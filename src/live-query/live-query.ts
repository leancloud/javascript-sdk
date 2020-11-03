import type { App, AuthOptions } from '../app';
import type { Query } from '../query';
import type { AppRequest } from '../app';
import { LCObject } from '../object';
import { Realtime, setAdapters } from 'leancloud-realtime/core';
import { LiveQueryPlugin } from 'leancloud-realtime-plugin-live-query';
import { EventEmitter } from 'eventemitter3';
import { KEY_SUBSCRIPTION_ID } from '../const';
import { onAdaptersSet } from '../adapters';

onAdaptersSet(setAdapters);

enum LiveQueryState {
  READY = 'Ready',
  CONNECTING = 'Connecting',
  CONNECTED = 'Connected',
  CLOSING = 'Closing',
  CLOSED = 'Closed',
}

interface LiveQueryListeners {
  create(object: LCObject): void;
  update(object: LCObject, updatedKeys: string[]): void;
  delete(object: LCObject): void;
  enter(object: LCObject): void;
  leave(object: LCObject): void;
}

class Subscription extends EventEmitter<LiveQueryListeners> {
  state = LiveQueryState.READY;
  readonly created = this._subscribe();

  private _onMessage: (messages: Record<string, any>[]) => void;
  private _onReconnect: () => void;
  private _client: any;
  private _id: string;
  private _queryId: string;

  constructor(public readonly query: Query, public options: AuthOptions) {
    super();
  }

  private async _subscribe(): Promise<this> {
    if (this.state !== LiveQueryState.READY) {
      throw new Error('Cannot subscribe, current state: ' + this.state);
    }
    this.state = LiveQueryState.CONNECTING;

    const { app } = this.query;
    const subscriptionId = await app.storage.getAsync(KEY_SUBSCRIPTION_ID);
    const { id, query_id } = await requestQueryId(this.query, this.options);
    if (id !== subscriptionId) {
      await app.storage.setAsync(KEY_SUBSCRIPTION_ID, id);
    }

    this._onMessage = (messages) => {
      messages.forEach((message) => {
        if (message.query_id === query_id) {
          const object = LCObject.fromJSON(app, message.object);
          this.emit(message.op, object, message.updatedKeys);
        }
      });
    };
    this._onReconnect = async () => {
      // 别觉得这个函数很奇怪, 本来是想打印些日志的
      await requestQueryId(this.query, { ...this.options, subscriptionId: id });
    };

    this._client = await createLiveQueryClient(app, id);
    this._client.register(this.query);
    this._client.on('message', this._onMessage);
    this._client.on('reconnect', this._onReconnect);
    this.state = LiveQueryState.CONNECTED;
    return this;
  }

  async unsubscribe(): Promise<void> {
    if (this.state !== LiveQueryState.CONNECTED) {
      throw new Error('Cannot unsubscribe, current state: ' + this.state);
    }
    this.state = LiveQueryState.CLOSING;

    try {
      this._client.off('message', this._onMessage);
      this._client.off('reconnect', this._onReconnect);
      this._client.deregister(this.query);
      await this.query.app.request({
        method: 'POST',
        path: '/LiveQuery/unsubscribe',
        body: {
          id: this._id,
          query_id: this._queryId,
        },
      });
    } finally {
      this.state = LiveQueryState.CLOSED;
    }
  }
}

function requestQueryId(
  query: Query,
  options?: AuthOptions & {
    subscriptionId?: string;
  }
): Promise<{
  id: string;
  query_id: string;
}> {
  const req: AppRequest = {
    method: 'POST',
    path: '/LiveQuery/subscribe',
    body: {
      query: {
        className: query.className,
        where: query.toString(),
        returnACL: query.shouldReturnACL() || undefined,
      },
    },
    options,
  };
  if (options?.subscriptionId) {
    req.body.id = options.subscriptionId;
  }
  return query.app.request(req);
}

export function subscribe(query: Query, options?: AuthOptions): Promise<Subscription> {
  return new Subscription(query, options).created;
}

function getRealtimeInstance(app: App): any {
  if (!app.realtimeInstance) {
    app.realtimeInstance = new Realtime({
      appId: app.appId,
      appKey: app.appKey,
      server: app.serverURL,
      plugins: [LiveQueryPlugin],
    });
  }
  return app.realtimeInstance;
}

function createLiveQueryClient(app: App, subscriptionId: string): Promise<any> {
  return getRealtimeInstance(app).createLiveQueryClient(subscriptionId);
}

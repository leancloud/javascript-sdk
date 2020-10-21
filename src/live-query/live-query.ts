/* eslint-disable @typescript-eslint/no-explicit-any */

import { Realtime, setAdapters, debug } from 'leancloud-realtime/core';
import { LiveQueryPlugin } from 'leancloud-realtime-plugin-live-query';
import { EventEmitter } from 'eventemitter3';
import { KEY_SUBSCRIPTION_ID } from '../const';
import type { App, AuthOptions } from '../app/app';
import type { Query } from '../query';
import type { HTTPRequest } from '../app/http';
import type { LCObject } from '../object';
import type { PluginManager } from '../app/plugin';
import type { Logger } from '../app/log';

/**
 * @internal
 */
let logger: typeof Logger;

/**
 * @internal
 */
export function install(pluginManager: typeof PluginManager): void {
  pluginManager.register('LiveQuery', LiveQuery);
  pluginManager.requestAdapters().then(setAdapters);

  logger = pluginManager.getLogger();
  logger.on('enable', debug.enable);
  logger.on('disable', debug.disable);
  if (logger.enabled) {
    debug.enable(logger.filter);
  }
}

/**
 * @internal
 */
enum LiveQueryState {
  READY,
  CONNECTING,
  CONNECTED,
  CLOSING,
  CLOSED,
}

interface LiveQueryListeners {
  create(object: LCObject): void;
  update(object: LCObject, updatedKeys: string[]): void;
  delete(object: LCObject): void;
  enter(object: LCObject): void;
  leave(object: LCObject): void;
}

type LiveQueryEvents = keyof LiveQueryListeners;

export class LiveQuery extends EventEmitter<LiveQueryListeners> {
  private _app: App;
  private _query: Query;
  private _client: any;
  private _id: string;
  private _queryId: string;
  private _subReq: HTTPRequest;
  private _state = LiveQueryState.READY;

  static install = install;

  static subscribe(query: Query, options?: AuthOptions): Promise<LiveQuery> {
    return new LiveQuery(query)._subscribe(options);
  }

  constructor(query: Query) {
    super();
    this._app = query.app;
    this._query = query;
  }

  private _makeSubscribeRequest(subscriptionId?: string): HTTPRequest {
    return {
      method: 'POST',
      path: `/LiveQuery/subscribe`,
      body: {
        id: subscriptionId,
        query: {
          className: this._query.className,
          where: this._query.toJSON(),
          returnACL: this._query['_returnACL'],
        },
      },
    };
  }

  private async _subscribe(options?: AuthOptions): Promise<this> {
    if (this._state !== LiveQueryState.READY) {
      throw new Error('You should call subscribe only once');
    }
    this._state = LiveQueryState.CONNECTING;

    const subscriptionId = await this._app.storage.getAsync(KEY_SUBSCRIPTION_ID);
    this._subReq = this._makeSubscribeRequest(subscriptionId || undefined);

    const res = await this._app.request({ ...this._subReq, options });
    const { id, query_id } = res.body as { id: string; query_id: string };
    if (id !== subscriptionId) {
      await this._app.storage.setAsync(KEY_SUBSCRIPTION_ID, id);
    }

    this._id = id;
    this._queryId = query_id;
    this._subReq.body['id'] = id;
    this._client = await createLiveQueryClient(this._app, id);

    this._client.on('message', this._onMessage);
    this._client.on('reconnect', this._onReconnect);
    this._state = LiveQueryState.CONNECTED;
    return this;
  }

  async unsubscribe(): Promise<void> {
    if (this._state < LiveQueryState.CONNECTED) {
      throw new Error('Cannot unsubscribe a unconnected live query');
    }
    if (this._state === LiveQueryState.CLOSING || this._state === LiveQueryState.CLOSED) {
      throw new Error('You should call unsubscribe only once');
    }
    this._state = LiveQueryState.CLOSING;

    try {
      this._client.off('message', this._onMessage);
      this._client.off('reconnect', this._onReconnect);
      this._client.close();
      await this._app.request({
        method: 'POST',
        path: `/LiveQuery/unsubscribe`,
        body: { id: this._id, query_id: this._queryId },
      });
    } finally {
      this._state = LiveQueryState.CLOSED;
    }
  }

  private _onMessage = (messages: Record<string, unknown>[]) => {
    messages.forEach((msg) => {
      if (msg.query_id === this._queryId) {
        const obj = this._app.decode(msg.object, { type: 'Object' });
        const event = msg.op as string;
        const updatedKeys = msg.updatedKeys as string[];
        this.emit(event as LiveQueryEvents, obj, updatedKeys);
      }
    });
  };

  private _onReconnect = async () => {
    try {
      await this._app.request(this._subReq);
      logger?.log('LC:LiveQuery:reconnect', 'ok');
    } catch (err) {
      logger?.log('LC:LiveQuery:reconnect', 'failed: ' + err.message);
      throw err;
    }
  };
}

/**
 * @internal
 */
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

/**
 * @internal
 */
function createLiveQueryClient(app: App, subscriptionId: string): Promise<any> {
  return getRealtimeInstance(app).createLiveQueryClient(subscriptionId);
}

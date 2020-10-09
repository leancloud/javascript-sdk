/* eslint-disable @typescript-eslint/no-explicit-any */

import { Realtime, setAdapters, debug } from 'leancloud-realtime/core';
import { LiveQueryPlugin } from 'leancloud-realtime-plugin-live-query';
import { EventEmitter } from 'eventemitter3';
import { API_VERSION, KEY_SUBSCRIPTION_ID } from '../const';
import type { App } from '../app/app';
import type { Query } from '../storage/query';
import type { HTTPRequest } from '../app/http';
import type { LCObject } from '../storage/object';
import type { UserObject } from '../storage/user';
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

export class LiveQuery extends EventEmitter {
  private _app: App;
  private _query: Query;
  private _client: any;
  private _id: string;
  private _queryId: string;
  private _subReq: HTTPRequest;
  private _onMessageHandler = this._onMessage.bind(this);
  private _onReconnectHandler = this._onReconnect.bind(this);
  private _state = LiveQueryState.READY;

  static install = install;

  static subscribe(query: Query): Promise<LiveQuery> {
    return new LiveQuery(query)._subscribe();
  }

  constructor(query: Query) {
    super();
    this._app = query.app;
    this._query = query;
  }

  private _makeSubscribeRequest(subscriptionId?: string): HTTPRequest {
    return {
      method: 'POST',
      path: `${API_VERSION}/LiveQuery/subscribe`,
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

  private async _subscribe(): Promise<this> {
    if (this._state !== LiveQueryState.READY) {
      throw new Error('You should call subscribe only once');
    }
    this._state = LiveQueryState.CONNECTING;

    const subscriptionId = await this._app.storage.getAsync(KEY_SUBSCRIPTION_ID);
    this._subReq = this._makeSubscribeRequest(subscriptionId || undefined);

    const res = await this._app.request(this._subReq);
    const { id, query_id } = res.body as { id: string; query_id: string };
    if (id !== subscriptionId) {
      await this._app.storage.setAsync(KEY_SUBSCRIPTION_ID, id);
    }

    this._id = id;
    this._queryId = query_id;
    this._subReq.body['id'] = id;
    this._client = await createLiveQueryClient(this._app, id);

    this._client.on('message', this._onMessageHandler);
    this._client.on('reconnect', this._onReconnectHandler);
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

    this._client.off('message', this._onMessageHandler);
    this._client.off('reconnect', this._onReconnectHandler);
    this._client.close();
    await this._app.request({
      method: 'POST',
      path: `${API_VERSION}/LiveQuery/unsubscribe`,
      body: { id: this._id, query_id: this._queryId },
    });
    this._state = LiveQueryState.CLOSED;
  }

  private _onMessage(messages: Record<string, unknown>[]): void {
    messages.forEach((msg) => {
      if (msg.query_id !== this._queryId) return;
      const obj = this._app.decodeObject(msg.object);
      const event = msg.op as string;
      const updatedKeys = msg.updatedKeys as string[];
      this.emit(event, obj, updatedKeys);
    });
  }

  private _onReconnect(): void {
    this._app
      .request(this._subReq)
      .then(() => logger?.log('LC:LiveQuery:reconnect', 'ok'))
      .catch((err) => {
        logger?.log('LC:LiveQuery:reconnect', 'failed: %o', err);
        throw new Error('LiveQuery resubscribe error: ' + err.message);
      });
  }

  on(event: 'create', listener: (obj?: LCObject) => void): this;
  on(event: 'update', listener: (obj?: LCObject, updatedKeys?: string[]) => void): this;
  on(event: 'enter', listener: (obj?: LCObject) => void): this;
  on(event: 'leave', listener: (obj?: LCObject) => void): this;
  on(event: 'delete', listener: (obj?: LCObject) => void): this;
  on(event: 'login', listener: (user?: UserObject) => void): this;
  on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
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

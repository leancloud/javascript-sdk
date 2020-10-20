import { CurrentUserManager, UserObject, UserObjectRef } from './user';
import type { AuthOptions, App, AppRequest } from '../app/app';
import { Query } from './query';
import { assert } from '../utils';
import { Pointer, LCObject } from './object';

type InboxType = 'default' | 'private' | string;

interface StatusOptions extends AuthOptions {
  inboxType?: InboxType;
}

interface StatusCount {
  total: number;
  unread: number;
}

export class StatusQuery extends Query {
  private _statusOwner: Pointer;
  private _inboxOwner: UserObject;
  private _inboxType: InboxType;
  private _sinceId: number;
  private _maxId: number;

  constructor(app?: App) {
    super('_Status', app);
  }

  whereStatusOwner(owner: UserObject | UserObjectRef | string): StatusQuery {
    const query = this._clone();
    if (typeof owner === 'string') {
      query._statusOwner = { __type: 'Pointer', className: '_User', objectId: owner };
    } else {
      query._statusOwner = owner.toPointer();
    }
    query._whereEqualTo('source', query._statusOwner);
    return query;
  }

  whereInboxOwner(owner: UserObject): StatusQuery {
    assert(owner.sessionToken, 'Cannot query inbox for an unauthorized user');
    const query = this._clone();
    query._inboxOwner = owner;
    return query;
  }

  whereInboxType(type: InboxType): StatusQuery {
    const query = this._clone();
    query._inboxType = type;
    return query;
  }

  whereSinceId(id: number): StatusQuery {
    const query = this._clone();
    query._sinceId = id;
    return query;
  }

  whereMaxId(id: number): StatusQuery {
    const query = this._clone();
    query._maxId = id;
    return query;
  }

  protected _clone(query?: StatusQuery): StatusQuery {
    if (!query) {
      query = new StatusQuery(this.app);
    }
    query = super._clone(query) as StatusQuery;
    query._statusOwner = this._statusOwner;
    query._inboxOwner = this._inboxOwner;
    query._inboxType = this._inboxType;
    query._sinceId = this._sinceId;
    query._maxId = this._maxId;
    return query;
  }

  protected _makeRequest(options?: AuthOptions): AppRequest {
    const req = super._makeRequest(options);
    if (this._inboxOwner) {
      assert(this._statusOwner === undefined, 'Cannot query both inboxOwner and statusOwner');
      req.path = `/subscribe/statuses`;

      if (!req.options) {
        req.options = { sessionToken: this._inboxOwner.sessionToken };
      } else if (!req.options.sessionToken) {
        req.options.sessionToken = this._inboxOwner.sessionToken;
      }

      req.query.owner = JSON.stringify(this._inboxOwner.toPointer());
      req.query.inboxType = this._inboxType;
      req.query.sinceId = this._sinceId;
      req.query.maxId = this._maxId;
    }
    return req;
  }
}

/**
 * @alias Status
 */
export class StatusClass extends StatusQuery {
  static async sendToFollowers(
    data: Record<string, unknown>,
    options?: StatusOptions
  ): Promise<LCObject> {
    return new StatusClass().sendToFollowers(data, options);
  }

  static async sendToUser(
    target: UserObject | UserObjectRef | string,
    data: Record<string, unknown>,
    options?: StatusOptions
  ): Promise<LCObject> {
    return new StatusClass().sendToUser(target, data, options);
  }

  static async deleteInboxStatus(messageId: number, options?: StatusOptions): Promise<void> {
    return new StatusClass().deleteInboxStatus(messageId, options);
  }

  static async getUnreadCount(options?: StatusOptions): Promise<StatusCount> {
    return new StatusClass().getUnreadCount(options);
  }

  static async resetUnreadCount(options?: StatusOptions): Promise<void> {
    return new StatusClass().resetUnreadCount(options);
  }

  async sendToFollowers(data: Record<string, unknown>, options?: StatusOptions): Promise<LCObject> {
    const owner = await CurrentUserManager.getAsync(this.app);
    assert(owner, 'No user is logged in');

    const res = await this.app.request({
      method: 'POST',
      path: `/statuses`,
      query: { fetchWhenSave: true },
      body: {
        query: {
          className: '_Follower',
          keys: 'follower',
          where: { user: owner.toPointer() },
        },
        // The 'source' field is necessary, it used to query send box. The backend will not generate
        // 'source' automatically, so it is your responsibility.
        data: { ...data, source: owner.toPointer() },
        inboxType: options?.inboxType,
      },
      options,
    });
    return this.app.decode(res.body, { className: '_Status' });
  }

  async sendToUser(
    target: UserObject | UserObjectRef | string,
    data: Record<string, unknown>,
    options?: StatusOptions
  ): Promise<LCObject> {
    const owner = await CurrentUserManager.getAsync(this.app);
    assert(owner, 'No user is logged in');

    const targetId = typeof target === 'string' ? target : target.objectId;

    const res = await this.app.request({
      method: 'POST',
      path: `/statuses`,
      body: {
        query: {
          className: '_User',
          where: { objectId: targetId },
        },
        // The 'source' field is necessary, it used to query send box. The backend will not generate
        // 'source' automatically, so it is your responsibility.
        data: { ...data, source: owner.toPointer() },
        inboxType: options?.inboxType || 'private',
      },
      options,
    });
    return this.app.decode(res.body, { className: '_Status' });
  }

  async deleteInboxStatus(messageId: number, options?: StatusOptions): Promise<void> {
    const owner = await CurrentUserManager.getAsync(this.app);
    assert(owner, 'No user is logged in');

    await this.app.request({
      method: 'DELETE',
      path: `/subscribe/statuses/inbox`,
      query: {
        owner: JSON.stringify(owner.toPointer()),
        inboxType: options?.inboxType,
        messageId,
      },
      options,
    });
  }

  async getUnreadCount(options?: StatusOptions): Promise<StatusCount> {
    const owner = await CurrentUserManager.getAsync(this.app);
    assert(owner, 'No user is logged in');

    const res = await this.app.request({
      method: 'GET',
      path: `/subscribe/statuses/count`,
      query: {
        owner: JSON.stringify(owner.toPointer()),
        inboxType: options?.inboxType,
      },
      options,
    });
    return res.body as StatusCount;
  }

  async resetUnreadCount(options?: StatusOptions): Promise<void> {
    const owner = await CurrentUserManager.getAsync(this.app);
    assert(owner, 'No user is logged in');

    await this.app.request({
      method: 'POST',
      path: `/subscribe/statuses/resetUnreadCount`,
      query: {
        owner: JSON.stringify(owner.toPointer()),
        inboxType: options?.inboxType,
      },
      options,
    });
  }
}

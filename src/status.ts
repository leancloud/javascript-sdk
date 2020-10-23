import type { AuthOptions, App, AppRequest } from './app';
import { AuthedUser, UserObject, UserObjectRef } from './user';
import { Query } from './query';
import { assert } from './utils';
import { Pointer, LCObject } from './object';

type InboxType = 'default' | 'private' | string;

interface StatusOptions extends Omit<AuthOptions, 'sessionToken'> {
  inboxType?: InboxType;
}

interface StatusCount {
  total: number;
  unread: number;
}

export class StatusQuery extends Query {
  private _statusOwner: Pointer;
  private _inboxOwner: AuthedUser;
  private _inboxType: InboxType;
  private _sinceId: number;
  private _maxId: number;

  constructor(app?: App) {
    super('_Status', app);
  }

  whereStatusOwner(owner: UserObject | UserObjectRef | string): StatusQuery {
    assert(this._inboxOwner === undefined, 'Cannot query both inboxOwner and statusOwner');
    const query = this._clone();
    if (typeof owner === 'string') {
      query._statusOwner = { __type: 'Pointer', className: '_User', objectId: owner };
    } else {
      query._statusOwner = owner.toPointer();
    }
    query._whereEqualTo('source', query._statusOwner);
    return query;
  }

  whereInboxOwner(owner: AuthedUser): StatusQuery {
    assert(this._statusOwner === undefined, 'Cannot query both inboxOwner and statusOwner');
    assert(owner.sessionToken, 'The owner cannot be an unauthorized user');
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

  protected _clone(): StatusQuery {
    const query = new StatusQuery(this.app);
    this._fill(query);
    return query;
  }

  protected _fill(query: StatusQuery): void {
    super._fill(query);
    query._statusOwner = this._statusOwner;
    query._inboxOwner = this._inboxOwner;
    query._inboxType = this._inboxType;
    query._sinceId = this._sinceId;
    query._maxId = this._maxId;
  }

  protected _makeRequest(options?: AuthOptions): AppRequest {
    const req = super._makeRequest(options);
    if (this._inboxOwner) {
      assert(this._statusOwner === undefined, 'Cannot query both inboxOwner and statusOwner');
      req.path = '/subscribe/statuses';

      req.options = {
        ...req.options,
        sessionToken: this._inboxOwner.sessionToken,
      };

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
    owner: AuthedUser,
    data: Record<string, unknown>,
    options?: StatusOptions
  ): Promise<LCObject> {
    return new StatusClass().sendToFollowers(owner, data, options);
  }

  static async sendToUser(
    owner: AuthedUser,
    target: UserObject | UserObjectRef | string,
    data: Record<string, unknown>,
    options?: StatusOptions
  ): Promise<LCObject> {
    return new StatusClass().sendToUser(owner, target, data, options);
  }

  static async deleteInboxStatus(
    owner: AuthedUser,
    messageId: number,
    options?: StatusOptions
  ): Promise<void> {
    return new StatusClass().deleteInboxStatus(owner, messageId, options);
  }

  static async getUnreadCount(owner: AuthedUser, options?: StatusOptions): Promise<StatusCount> {
    return new StatusClass().getUnreadCount(owner, options);
  }

  static async resetUnreadCount(owner: AuthedUser, options?: StatusOptions): Promise<void> {
    return new StatusClass().resetUnreadCount(owner, options);
  }

  async sendToFollowers(
    owner: AuthedUser,
    data: Record<string, unknown>,
    options?: StatusOptions
  ): Promise<LCObject> {
    assert(owner.sessionToken, 'The owner cannot be an unauthorized user');
    const res = await this.app.request({
      method: 'POST',
      path: '/statuses',
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
      options: { ...options, sessionToken: owner.sessionToken },
    });
    return this.app.decode(res.body, { className: '_Status' });
  }

  async sendToUser(
    owner: AuthedUser,
    target: UserObject | UserObjectRef | string,
    data: Record<string, unknown>,
    options?: StatusOptions
  ): Promise<LCObject> {
    assert(owner.sessionToken, 'The owner cannot be an unauthorized user');
    const targetId = typeof target === 'string' ? target : target.objectId;
    const res = await this.app.request({
      method: 'POST',
      path: '/statuses',
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
      options: { ...options, sessionToken: owner.sessionToken },
    });
    return this.app.decode(res.body, { className: '_Status' });
  }

  async deleteInboxStatus(
    owner: AuthedUser,
    messageId: number,
    options?: StatusOptions
  ): Promise<void> {
    assert(owner.sessionToken, 'The owner cannot be an unauthorized user');
    await this.app.request({
      method: 'DELETE',
      path: '/subscribe/statuses/inbox',
      query: {
        owner: JSON.stringify(owner.toPointer()),
        inboxType: options?.inboxType,
        messageId,
      },
      options: { ...options, sessionToken: owner.sessionToken },
    });
  }

  async getUnreadCount(owner: AuthedUser, options?: StatusOptions): Promise<StatusCount> {
    assert(owner.sessionToken, 'The owner cannot be an unauthorized user');
    const res = await this.app.request({
      method: 'GET',
      path: '/subscribe/statuses/count',
      query: {
        owner: JSON.stringify(owner.toPointer()),
        inboxType: options?.inboxType,
      },
      options: { ...options, sessionToken: owner.sessionToken },
    });
    return res.body;
  }

  async resetUnreadCount(owner: AuthedUser, options?: StatusOptions): Promise<void> {
    assert(owner.sessionToken, 'The owner cannot be an unauthorized user');
    await this.app.request({
      method: 'POST',
      path: '/subscribe/statuses/resetUnreadCount',
      query: {
        owner: JSON.stringify(owner.toPointer()),
        inboxType: options?.inboxType,
      },
      options: { ...options, sessionToken: owner.sessionToken },
    });
  }
}

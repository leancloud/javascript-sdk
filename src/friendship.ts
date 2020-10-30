import type { App, AuthOptions } from './app';
import { mustGetDefaultApp } from './app/default-app';
import { LCObject, LCObjectData, LCObjectRef } from './object';
import { Query } from './query';
import { AuthedUser, UserObject, UserObjectRef } from './user';
import { assert } from './utils';

interface FriendshipOptions extends AuthOptions {
  payload?: LCObjectData;
}

interface PaginationOptions extends Omit<AuthOptions, 'sessionToken'> {
  skip?: number;
  limit?: number;
}

type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'all';

export class Friendship {
  constructor(public app = mustGetDefaultApp()) {}

  async follow(
    user: AuthedUser,
    followee: UserObjectRef | UserObject | string,
    options?: FriendshipOptions
  ): Promise<void> {
    assert(user.sessionToken, 'The user cannot be an unauthorized user');
    const followeeId = typeof followee === 'string' ? followee : followee.objectId;
    await this.app.request({
      method: 'POST',
      path: `/users/${user.objectId}/friendship/${followeeId}`,
      body: options?.payload,
      options: { ...options, sessionToken: user.sessionToken },
    });
  }

  async unfollow(
    user: AuthedUser,
    followee: UserObjectRef | UserObject | string,
    options?: Omit<AuthOptions, 'sessionToken'>
  ): Promise<void> {
    assert(user.sessionToken, 'The user cannot be an unauthorized user');
    const followeeId = typeof followee === 'string' ? followee : followee.objectId;
    await this.app.request({
      method: 'DELETE',
      path: `/users/${user.objectId}/friendship/${followeeId}`,
      options: { ...options, sessionToken: user.sessionToken },
    });
  }

  getFollowerQuery(user: AuthedUser): Query {
    assert(user.sessionToken, 'The user must be authenticated');
    const query = new Query('_Follower', this.app).where('user', '==', user);
    const sessionTokenProtector = (options: AuthOptions) => {
      assert(!options.sessionToken, 'Cannot set sessionToken for _Follower query');
      options.sessionToken = user.sessionToken;
    };
    return query.addHooks({
      beforeFind: sessionTokenProtector,
      beforeSubscribe: sessionTokenProtector,
    });
  }

  getFolloweeQuery(user: AuthedUser): Query {
    assert(user.sessionToken, 'The user must be authenticated');
    const query = new Query('_Followee', this.app).where('user', '==', user);
    const sessionTokenProtector = (options: AuthOptions) => {
      assert(!options.sessionToken, 'Cannot set sessionToken for _Followee query');
      options.sessionToken = user.sessionToken;
    };
    return query.addHooks({
      beforeFind: sessionTokenProtector,
      beforeSubscribe: sessionTokenProtector,
    });
  }

  async getFollowers(user: AuthedUser, options?: PaginationOptions): Promise<UserObject[]> {
    let query = this.getFollowerQuery(user).select('follower').include('follower');
    if (options?.skip !== undefined) {
      query = query.skip(options.skip);
    }
    if (options?.limit !== undefined) {
      query = query.limit(options.limit);
    }
    const results = await query.find(options);
    return results.map((result) => result.data.follower);
  }

  async getFollowees(user: AuthedUser, options?: PaginationOptions): Promise<UserObject[]> {
    let query = this.getFolloweeQuery(user).select('followee').include('followee');
    if (options?.skip !== undefined) {
      query = query.skip(options.skip);
    }
    if (options?.limit !== undefined) {
      query = query.limit(options.limit);
    }
    const results = await query.find(options);
    return results.map((result) => result.data.followee);
  }

  async request(
    user: AuthedUser,
    target: UserObject | UserObjectRef | string,
    options?: FriendshipOptions
  ): Promise<void> {
    assert(user.sessionToken, 'The user cannot be an unauthorized user');
    if (typeof target === 'string') {
      target = new UserObjectRef(this.app, target);
    }
    await this.app.request({
      method: 'POST',
      path: `/users/friendshipRequests`,
      body: {
        user: user.toPointer(),
        friend: target.toPointer(),
        friendship: options?.payload,
      },
      options,
    });
  }

  getRequestQuery(user: AuthedUser): Query {
    assert(user.sessionToken, 'The user cannot be an unauthorized user');
    const query = new Query('_FriendshipRequest', this.app);
    const sessionTokenProtector = (options: AuthOptions) => {
      assert(!options.sessionToken, 'Cannot set sessionToken for _FriendshipRequest query');
      options.sessionToken = user.sessionToken;
    };
    return query.addHooks({
      beforeFind: sessionTokenProtector,
      beforeSubscribe: sessionTokenProtector,
      afterDecodeObject: (object) => {
        return new FriendshipRequestObject(user, object.objectId);
      },
    });
  }

  getSendedRequestQuery(user: AuthedUser, status: FriendshipStatus = 'all'): Query {
    const query = this.getRequestQuery(user).where('user', '==', user);
    if (status !== 'all') {
      return query.where('status', '==', status);
    }
    return query;
  }

  getReceivedRequestQuery(user: AuthedUser, status: FriendshipStatus = 'all'): Query {
    const query = this.getRequestQuery(user).where('friend', '==', user);
    if (status !== 'all') {
      return query.where('status', '==', status);
    }
    return query;
  }

  getSendedRequests(
    user: AuthedUser,
    status: FriendshipStatus = 'all',
    options?: PaginationOptions & {
      include?: string[];
    }
  ): Promise<FriendshipRequestObject[]> {
    let query = this.getSendedRequestQuery(user, status);
    if (options?.include) {
      query = query.include(options.include);
    }
    if (options?.limit !== undefined) {
      query = query.limit(options.limit);
    }
    if (options?.skip !== undefined) {
      query = query.skip(options.skip);
    }
    return query.find(options) as Promise<FriendshipRequestObject[]>;
  }

  getReceivedRequests(
    user: AuthedUser,
    status: FriendshipStatus = 'all',
    options?: PaginationOptions & {
      include?: string[];
    }
  ): Promise<FriendshipRequestObject[]> {
    let query = this.getReceivedRequestQuery(user, status);
    if (options?.include) {
      query = query.include(options.include);
    }
    if (options?.limit !== undefined) {
      query = query.limit(options.limit);
    }
    if (options?.skip !== undefined) {
      query = query.skip(options.skip);
    }
    return query.find(options) as Promise<FriendshipRequestObject[]>;
  }

  acceptRequest(
    user: AuthedUser,
    requestId: string,
    options?: Omit<FriendshipOptions, 'sessionToken'>
  ): Promise<void> {
    return new FriendshipRequestObjectRef(this.app, requestId).accept({
      ...options,
      sessionToken: user.sessionToken,
    });
  }

  declineRequest(
    user: AuthedUser,
    requestId: string,
    options?: Omit<AuthOptions, 'sessionToken'>
  ): Promise<void> {
    return new FriendshipRequestObjectRef(this.app, requestId).decline({
      ...options,
      sessionToken: user.sessionToken,
    });
  }

  getFriendQuery(user: AuthedUser): Query {
    assert(user.sessionToken, 'The user cannot be an unauthorized user');
    const query = new Query('_Followee', this.app).where('user', '==', user);
    // .where('friendStatus', '==', true);
    const sessionTokenProtector = (options: AuthOptions) => {
      assert(!options.sessionToken, 'Cannot set sessionToken for _FriendshipRequest query');
      options.sessionToken = user.sessionToken;
    };
    return query.addHooks({
      beforeFind: sessionTokenProtector,
      beforeSubscribe: sessionTokenProtector,
    });
  }

  async getFriends(user: AuthedUser, options?: PaginationOptions): Promise<UserObject[]> {
    let query = this.getFriendQuery(user).select('followee').include('followee');
    if (options?.limit !== undefined) {
      query = query.limit(options.limit);
    }
    if (options?.skip !== undefined) {
      query = query.skip(options.skip);
    }
    const results = await query.find(options);
    return results.map((result) => result.data.followee);
  }
}

class FriendshipRequestObjectRef extends LCObjectRef {
  constructor(app: App, objectId: string) {
    super(app, '_FriendshipRequest', objectId);
  }

  async accept(options?: FriendshipOptions): Promise<void> {
    await this.app.request({
      method: 'PUT',
      path: `/users/friendshipRequests/${this.objectId}/accept`,
      body: {
        friendship: options?.payload,
      },
      options,
    });
  }

  async decline(options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'PUT',
      path: `/users/friendshipRequests/${this.objectId}/decline`,
      options,
    });
  }
}

export class FriendshipRequestObject extends LCObject {
  private _user: AuthedUser;

  constructor(user: AuthedUser, objectId: string) {
    super(user.app, '_FriendshipRequest', objectId);
    this._user = user;
  }

  get status(): string {
    return this.data.status;
  }

  get user(): UserObject {
    return this.data.user;
  }

  async accept(options?: Omit<FriendshipOptions, 'sessionToken'>): Promise<void> {
    await this.app.request({
      method: 'PUT',
      path: `/users/friendshipRequests/${this.objectId}/accept`,
      body: {
        friendship: options?.payload,
      },
      options: { ...options, sessionToken: this._user.sessionToken },
    });
  }

  async decline(options?: Omit<AuthOptions, 'sessionToken'>): Promise<void> {
    await this.app.request({
      method: 'PUT',
      path: `/users/friendshipRequests/${this.objectId}/decline`,
      options: { ...options, sessionToken: this._user.sessionToken },
    });
  }
}

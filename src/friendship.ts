import type { App, AuthOptions } from './app';
import { mustGetDefaultApp } from './app/default-app';
import { LCObject, LCObjectData } from './object';
import { Query } from './query';
import { AuthedUser, UserObject, UserObjectRef } from './user';
import { assert } from './utils';

interface FriendshipOptions extends Omit<AuthOptions, 'sessionToken'> {
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
    const sessionTokenProtector = (options: AuthOptions) => {
      assert(!options.sessionToken, 'Cannot set sessionToken for _Follower query');
      options.sessionToken = user.sessionToken;
    };
    return new Query({
      app: this.app,
      className: '_Follower',
      beforeFind: sessionTokenProtector,
      beforeSubscribe: sessionTokenProtector,
    }).where('user', '==', user);
  }

  getFolloweeQuery(user: AuthedUser): Query {
    assert(user.sessionToken, 'The user must be authenticated');
    const sessionTokenProtector = (options: AuthOptions) => {
      assert(!options.sessionToken, 'Cannot set sessionToken for _Followee query');
      options.sessionToken = user.sessionToken;
    };
    return new Query({
      app: this.app,
      className: '_Followee',
      beforeFind: sessionTokenProtector,
      beforeSubscribe: sessionTokenProtector,
    }).where('user', '==', user);
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
    const sessionTokenProtector = (options: AuthOptions) => {
      assert(!options.sessionToken, 'Cannot set sessionToken for _FriendshipRequest query');
      options.sessionToken = user.sessionToken;
    };
    return new Query<FriendshipRequestObject>({
      app: this.app,
      className: '_FriendshipRequest',
      beforeFind: sessionTokenProtector,
      beforeSubscribe: sessionTokenProtector,
    });
  }

  getRequests(
    user: AuthedUser,
    status: FriendshipStatus,
    direction: 'send' | 'receive',
    options?: PaginationOptions
  ): Promise<FriendshipRequestObject[]> {
    let query = this.getRequestQuery(user);
    if (options?.limit !== undefined) {
      query = query.limit(options.limit);
    }
    if (options?.skip !== undefined) {
      query = query.skip(options.skip);
    }
    if (status !== 'all') {
      query = query.where('status', '==', status);
    }
    switch (direction) {
      case 'send':
        query = query.where('user', '==', user);
        break;
      case 'receive':
        query = query.where('friend', '==', user);
        break;
    }
    return query.find(options) as Promise<FriendshipRequestObject[]>;
  }

  getFriendQuery(user: AuthedUser): Query {
    assert(user.sessionToken, 'The user cannot be an unauthorized user');
    const sessionTokenProtector = (options: AuthOptions) => {
      assert(!options.sessionToken, 'Cannot set sessionToken for _FriendshipRequest query');
      options.sessionToken = user.sessionToken;
    };
    return new Query({
      app: this.app,
      className: '_Followee',
      beforeFind: sessionTokenProtector,
      beforeSubscribe: sessionTokenProtector,
    })
      .where('user', '==', user)
      .where('friendStatus', '==', true);
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

export class FriendshipRequestObject extends LCObject {
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

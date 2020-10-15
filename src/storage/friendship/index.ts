import { App, AuthOptions } from '../../app/app';
import { API_VERSION } from '../../const';
import type { LiveQuery } from '../../_entry/live-query';
import { ACL } from '../acl';
import { Encoder, LCObject } from '../object';
import { Query } from '../query';
import { CurrentUserManager, UserObject, UserObjectRef } from '../user';

Encoder.setCreator('_FriendshipRequest', (app, id) => new FriendshipRequestObject(app, id));

interface FollowOptions extends AuthOptions {
  data?: Record<string, unknown>;
}

interface FriendshipOptions extends AuthOptions {
  friendship?: {
    [key: string]: unknown;
    ACL?: ACL;
  };
}

interface GetFollowersOptions extends AuthOptions {
  include?: string[];

  /**
   * The default value is `0`.
   */
  skip?: number;

  /**
   * The default value is `100`.
   */
  limit?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FollowerResult extends Record<string, any> {
  follower: UserObject;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FolloweeResult extends Record<string, any> {
  followee: UserObject;
}

type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'all';

export class Friendship {
  constructor(public app = App.default) {}

  async request(
    target: UserObject | UserObjectRef | string,
    options?: FriendshipOptions
  ): Promise<void> {
    const source = await this._mustGetCurrentUserAsnyc();

    if (typeof target === 'string') {
      target = new UserObjectRef(this.app, target);
    }

    await this.app.request({
      method: 'POST',
      path: `${API_VERSION}/users/friendshipRequests`,
      body: {
        user: source.toPointer(),
        friend: target.toPointer(),
        friendship: options?.friendship,
      },
      options,
    });
  }

  async follow(
    followee: UserObjectRef | UserObject | string,
    options?: FollowOptions
  ): Promise<void> {
    const source = await this._mustGetCurrentUserAsnyc();
    const followeeId = typeof followee === 'string' ? followee : followee.objectId;
    await this.app.request({
      method: 'POST',
      path: `${API_VERSION}/users/${source.objectId}/friendship/${followeeId}`,
      body: options?.data,
      options: { ...options, sessionToken: source.sessionToken },
    });
  }

  async unfollow(
    followee: UserObjectRef | UserObject | string,
    options?: AuthOptions
  ): Promise<void> {
    const currentUser = await this._mustGetCurrentUserAsnyc();
    const followeeId = typeof followee === 'string' ? followee : followee.objectId;
    await this.app.request({
      method: 'DELETE',
      path: `${API_VERSION}/users/${currentUser.objectId}/friendship/${followeeId}`,
      options: { ...options, sessionToken: currentUser.sessionToken },
    });
  }

  async getFollowers(options?: GetFollowersOptions): Promise<FollowerResult[]> {
    const currentUser = await this._mustGetCurrentUserAsnyc();
    const res = await this.app.request({
      method: 'GET',
      path: `${API_VERSION}/users/${currentUser.objectId}/followers`,
      query: {
        keys: '-user', // 没必要返回自己
        include: options?.include?.join(','),
        skip: options?.skip,
        limit: options?.limit,
      },
      options: { ...options, sessionToken: currentUser.sessionToken },
    });
    return Encoder.decode(this.app, res.body['results']);
  }

  async getFollowees(options?: GetFollowersOptions): Promise<FolloweeResult[]> {
    const currentUser = await this._mustGetCurrentUserAsnyc();
    const res = await this.app.request({
      method: 'GET',
      path: `${API_VERSION}/users/${currentUser.objectId}/followees`,
      query: {
        keys: '-user', // 没必要返回自己
        include: options?.include?.join(','),
        skip: options?.skip,
        limit: options?.limit,
      },
      options: { ...options, sessionToken: currentUser.sessionToken },
    });
    return Encoder.decode(this.app, res.body['results']);
  }

  async getRequests(
    status: FriendshipStatus = 'pending',
    options?: AuthOptions
  ): Promise<FriendshipRequestObject[]> {
    const currentUser = await this._mustGetCurrentUserAsnyc();
    let query = new Query('_FriendshipRequest', this.app);
    if (status !== 'all') {
      query = query.where('status', '==', status);
    }
    return query.find({
      ...options,
      sessionToken: currentUser.sessionToken,
    }) as Promise<FriendshipRequestObject[]>;
  }

  async subscribeRequests(
    status: FriendshipStatus = 'pending',
    options?: AuthOptions
  ): Promise<LiveQuery> {
    const currentUser = await this._mustGetCurrentUserAsnyc();
    let query = new Query('_FriendshipRequest', this.app);
    if (status !== 'all') {
      query = query.where('status', '==', status);
    }
    return query.subscribe({ ...options, sessionToken: currentUser.sessionToken });
  }

  private async _mustGetCurrentUserAsnyc(): Promise<UserObject> {
    const currentUser = CurrentUserManager.getAsync(this.app);
    if (!currentUser) {
      throw new Error('No user is logged in');
    }
    return currentUser;
  }
}

export class FriendshipRequestObject extends LCObject {
  constructor(app: App, objectId: string) {
    super(app, '_FriendshipRequest', objectId);
  }

  async accept(options?: FriendshipOptions): Promise<void> {
    await this.app.request({
      method: 'PUT',
      path: `${API_VERSION}/users/friendshipRequests/${this.objectId}/accept`,
      body: {
        friendship: options?.friendship,
      },
      options,
    });
  }

  async decline(options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'PUT',
      path: `${API_VERSION}/users/friendshipRequests/${this.objectId}/decline`,
      options,
    });
  }
}

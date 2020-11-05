import type { App, AuthOptions } from './app';
import { ensurePointer, LCObject, LCObjectData } from './object';
import { Query } from './query';
import { CurrentUserManager, UserObject, UserObjectRef } from './user';

interface FriendshipOptions extends AuthOptions {
  payload?: LCObjectData;
}

interface PaginationOptions extends AuthOptions {
  skip?: number;
  limit?: number;
}

type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'all';

function ensureObjectId(id: string | { objectId: string }): string {
  return typeof id === 'string' ? id : id.objectId;
}

export class Friendship {
  constructor(public readonly app: App) {}

  async follow(followee: string | UserObjectRef, options?: FriendshipOptions): Promise<void> {
    const user = await CurrentUserManager.getAsync(this.app);
    await this.app.request({
      method: 'POST',
      path: `/users/${user.objectId}/friendship/${ensureObjectId(followee)}`,
      body: options?.payload,
      options,
    });
  }

  async unfollow(followee: string | UserObjectRef, options?: AuthOptions): Promise<void> {
    const user = await CurrentUserManager.getAsync(this.app);
    await this.app.request({
      method: 'DELETE',
      path: `/users/${user.objectId}/friendship/${ensureObjectId(followee)}`,
      options,
    });
  }

  async getFollowers(options?: PaginationOptions): Promise<UserObject[]> {
    const user = await CurrentUserManager.mustGetAsync(this.app);
    let query = new Query(this.app, '_Follower')
      .select('follower')
      .include('follower')
      .where('user', '==', user);
    if (options?.skip !== undefined) {
      query = query.skip(options.skip);
    }
    if (options?.limit !== undefined) {
      query = query.limit(options.limit);
    }
    const results = await query.find(options);
    return results.map(({ data: { follower } }) => UserObject.fromLCObject(follower));
  }

  async getFollowees(options?: PaginationOptions): Promise<UserObject[]> {
    const user = await CurrentUserManager.mustGetAsync(this.app);
    let query = new Query(this.app, '_Followee')
      .select('followee')
      .include('followee')
      .where('user', '==', user);
    if (options?.skip !== undefined) {
      query = query.skip(options.skip);
    }
    if (options?.limit !== undefined) {
      query = query.limit(options.limit);
    }
    const results = await query.find(options);
    return results.map(({ data: { followee } }) => UserObject.fromLCObject(followee));
  }

  async request(target: string | UserObjectRef, options?: FriendshipOptions): Promise<void> {
    const user = await CurrentUserManager.mustGetAsync(this.app);
    await this.app.request({
      method: 'POST',
      path: `/users/friendshipRequests`,
      body: {
        user: user.toPointer(),
        friend: ensurePointer('_User', target),
        friendship: options?.payload,
      },
      options,
    });
  }

  async getIncomingRequests(
    status: FriendshipStatus,
    options?: PaginationOptions & {
      include?: string[];
    }
  ): Promise<FriendshipRequestObject[]> {
    const user = await CurrentUserManager.mustGetAsync(this.app);
    let query = new Query(this.app, '_FriendshipRequest').where('friend', '==', user);
    if (status !== 'all') {
      query = query.where('status', '==', status);
    }
    if (options?.include) {
      query = query.include(options.include);
    }
    if (options?.skip) {
      query = query.skip(options.skip);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    return (await query.find()).map((object) => FriendshipRequestObject.fromLCObject(object));
  }

  async getOutgoingRequests(
    status: FriendshipStatus,
    options?: PaginationOptions & {
      include?: string[];
    }
  ): Promise<FriendshipRequestObject[]> {
    const user = await CurrentUserManager.mustGetAsync(this.app);
    let query = new Query(this.app, '_FriendshipRequest').where('user', '==', user);
    if (status !== 'all') {
      query = query.where('status', '==', status);
    }
    if (options?.include) {
      query = query.include(options.include);
    }
    if (options?.skip) {
      query = query.skip(options.skip);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    return (await query.find()).map((object) => FriendshipRequestObject.fromLCObject(object));
  }

  acceptRequest(requestId: string, options?: FriendshipOptions): Promise<void> {
    return new FriendshipRequestObject(this.app, requestId).accept(options);
  }

  declineRequest(requestId: string, options?: AuthOptions): Promise<void> {
    return new FriendshipRequestObject(this.app, requestId).decline(options);
  }

  async getFriends(options?: PaginationOptions): Promise<UserObject[]> {
    const user = await CurrentUserManager.mustGetAsync(this.app);
    let query = new Query(this.app, '_Followee')
      .where('user', '==', user)
      .select('followee')
      .include('followee');
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

  static fromLCObject(object: LCObject): FriendshipRequestObject {
    const request = new FriendshipRequestObject(object.app, object.id);
    request.data = object.data;
    return request;
  }

  get status(): string {
    return this.data.status;
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

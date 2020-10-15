import { App, AuthOptions } from '../app/app';
import { API_VERSION } from '../const';
import { assert } from '../utils';
import { Class } from './class';
import { Encoder, LCObject } from './object';
import { CurrentUserManager, UserObject, UserObjectRef } from './user';

Encoder.setCreator('_FriendshipRequest', (app, id) => new FriendshipObject(app, id));

interface FriendshipACL {
  // TODO
  todo?: unknown;
}

interface FriendshipOptions extends AuthOptions {
  friendship?: {
    [key: string]: unknown;
    ACL?: FriendshipACL;
  };
}

export class FriendshipClass extends Class {
  constructor(app?: App) {
    super('_FriendshipRequest', app);
  }

  async request(
    target: UserObject | UserObjectRef | string,
    options?: FriendshipOptions
  ): Promise<void> {
    const source = await CurrentUserManager.getAsync(this.app);
    assert(source, 'No user is logged in');

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
}

export class FriendshipObject extends LCObject {
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

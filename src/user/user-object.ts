import type { App, AuthOptions } from '../app';
import type { MiniAppAuthOptions } from './user-class';
import {
  UpdateObjectOptions,
  LCObjectRef,
  LCObject,
  LCEncode,
  LCDecode,
  GetObjectOptions,
  LCObjectData,
} from '../object';
import { Operation } from '../operation';
import { assert } from '../utils';
import { KEY_CURRENT_USER } from '../const';
import { getAdapters } from '../adapters';

export interface SignUpData extends LCObjectData {
  username: string;
  password: string;
  email?: string;
  mobilePhoneNumber?: string;
  authData?: Record<string, any>;
}

export interface UserData extends LCObjectData {
  username: string;
  sessionToken: string;
  email: string;
  emailVerified: boolean;
  mobilePhoneNumber: string;
  mobilePhoneVerified: boolean;
}

interface AssociateUnionIdOptions extends UpdateObjectOptions {
  unionIdPlatform?: string;
  asMainAccount?: boolean;
}

/**
 * @internal
 */
export class CurrentUserManager {
  static set(user: AuthedUser): void {
    user.app.currentUser = user;
    this.persist(user);
  }

  static setAsync(user: AuthedUser): Promise<void> {
    user.app.currentUser = user;
    return this.persistAsync(user);
  }

  static get(app: App): AuthedUser | null {
    if (!app.currentUser) {
      const encodedUser = app.storage.get(KEY_CURRENT_USER);
      if (encodedUser) {
        app.currentUser = AuthedUser.fromJSON(app, JSON.parse(encodedUser));
      }
    }
    return app.currentUser || null;
  }

  static async getAsync(app: App): Promise<AuthedUser | null> {
    if (!app.currentUser) {
      const encodedUser = await app.storage.getAsync(KEY_CURRENT_USER);
      if (encodedUser) {
        app.currentUser = AuthedUser.fromJSON(app, JSON.parse(encodedUser));
      }
    }
    return app.currentUser || null;
  }

  static remove(app: App): void {
    app.storage.delete(KEY_CURRENT_USER);
    app.currentUser = null;
  }

  static async removeAsync(app: App): Promise<void> {
    await app.storage.deleteAsync(KEY_CURRENT_USER);
    app.currentUser = null;
  }

  static persistAsync(user: AuthedUser): Promise<void> {
    const encodedUser = LCEncode(user, { full: true });
    return user.app.storage.setAsync(KEY_CURRENT_USER, JSON.stringify(encodedUser));
  }

  static persist(user: AuthedUser): void {
    const encodedUser = LCEncode(user, { full: true });
    user.app.storage.set(KEY_CURRENT_USER, JSON.stringify(encodedUser));
  }
}

export class UserObjectRef extends LCObjectRef {
  constructor(app: App, objectId: string) {
    super(app, '_User', objectId);
  }

  get aclKey(): string {
    return this.objectId;
  }

  async get(options?: GetObjectOptions): Promise<UserObject> {
    return UserObject.fromLCObject(await super.get(options));
  }

  async update(data: Record<string, any>, options?: UpdateObjectOptions): Promise<UserObject> {
    return UserObject.fromLCObject(await super.update(data, options));
  }
}

export class UserObject extends LCObject implements UserObjectRef {
  constructor(app: App, objectId: string) {
    super(app, '_User', objectId);
  }

  static fromJSON(app: App, data: Record<string, any>): UserObject {
    if (!data.objectId) {
      throw new Error('The objectId not in data');
    }
    const user = new UserObject(app, data.objectId);
    user.data = LCDecode(app, data);
    return user;
  }

  static fromLCObject(object: LCObject): UserObject {
    const user = new UserObject(object.app, object.objectId);
    user.data = object.data;
    return user;
  }

  get sessionToken(): string {
    return this.data.sessionToken;
  }

  get aclKey(): string {
    return this.objectId;
  }

  get username(): string {
    return this.data.username;
  }

  async get(options?: GetObjectOptions): Promise<UserObject> {
    return UserObject.fromLCObject(await super.get(options));
  }

  async update(data: Record<string, any>, options?: UpdateObjectOptions): Promise<UserObject> {
    return UserObject.fromLCObject(await super.update(data, options));
  }
}

export class AuthedUser extends UserObject {
  static fromJSON(app: App, data: Record<string, any>): AuthedUser {
    if (!data.objectId) {
      throw new Error('No objectId in data');
    }
    const user = new AuthedUser(app, data.objectId);
    user.data = LCDecode(app, data);
    return user;
  }

  static fromLCObject(object: LCObject): AuthedUser {
    if (typeof object.data.sessionToken !== 'string') {
      throw new Error('No sessionToken in object or it is not string');
    }
    const user = new AuthedUser(object.app, object.objectId);
    user.data = object.data;
    return user;
  }

  get sessionToken(): string {
    return this.data.sessionToken;
  }

  get authData(): Record<string, any> {
    return this.data.authData;
  }

  get anonymousId(): string {
    return this.authData?.anonymous?.id;
  }

  isCurrent(): boolean {
    return this.app.currentUser === this;
  }

  isAnonymous(): boolean {
    return Boolean(this.authData?.anonymous);
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.app.request({
        method: 'GET',
        path: '/users/me',
        options: { sessionToken: this.sessionToken },
      });
      return true;
    } catch (error) {
      if (error.code === 211) {
        return false;
      }
      throw error;
    }
  }

  async updatePassword(
    oldPassword: string,
    newPassword: string,
    options?: Omit<AuthOptions, 'sessionToken'>
  ): Promise<void> {
    const json = await this.app.request({
      method: 'PUT',
      path: `/users/${this.objectId}/updatePassword`,
      body: {
        old_password: oldPassword,
        new_password: newPassword,
      },
      options: { ...options, sessionToken: this.sessionToken },
    });
    this.mergeData(json);
    if (this.isCurrent()) {
      await CurrentUserManager.persistAsync(this);
    }
  }

  associateWithAuthData(
    platform: string,
    authDataItem: Record<string, unknown>,
    options?: UpdateObjectOptions
  ): Promise<AuthedUser> {
    return this.update({ authData: { [platform]: authDataItem } }, options);
  }

  associateWithAuthDataAndUnionId(
    platform: string,
    authDataItem: Record<string, unknown>,
    unionId: string,
    options: AssociateUnionIdOptions = { unionIdPlatform: 'weixin' }
  ): Promise<AuthedUser> {
    return this.associateWithAuthData(
      platform,
      {
        ...authDataItem,
        unionid: unionId,
        platform: options?.unionIdPlatform,
        main_account: options?.asMainAccount,
      },
      options
    );
  }

  async associateWithMiniApp(options?: MiniAppAuthOptions): Promise<AuthedUser> {
    const { getAuthInfo } = getAdapters();
    assert(getAuthInfo, 'The getAuthInfo adapter is not set');
    const { provider, authData } = await getAuthInfo(options);
    return this.associateWithAuthData(provider, authData, options);
  }

  dissociateAuthData(platform: string): Promise<UserObject> {
    return this.update({ [`authData.${platform}`]: Operation.unset() });
  }

  async signUp(data: SignUpData, options?: AuthOptions): Promise<AuthedUser> {
    if (!this.isAnonymous()) {
      throw new Error('The signUp method can only be invoked by an anonymous user');
    }
    assert(data.username, 'The username must be provided');
    assert(data.password, 'The password must be provided');
    delete this.data.authData.anonymous;
    return this.update(data, options);
  }

  async refreshSessionToken(options?: Omit<AuthOptions, 'sessionToken'>): Promise<string> {
    const json = await this.app.request({
      method: 'PUT',
      path: `/users/${this.objectId}/refreshSessionToken`,
      options: { ...options, sessionToken: this.sessionToken },
    });
    this.mergeData(json);
    if (this.isCurrent()) {
      await CurrentUserManager.persistAsync(this);
    }
    return this.sessionToken;
  }

  async get(options?: GetObjectOptions): Promise<this> {
    const user = await super.get(options);
    this.mergeData(user.data);
    if (this.isCurrent()) {
      await CurrentUserManager.persistAsync(this);
    }
    return this;
  }

  async update(data: Record<string, any>, options?: UpdateObjectOptions): Promise<this> {
    const user = await super.update(data, options);
    this.mergeData(user.data);
    if (this.isCurrent()) {
      await CurrentUserManager.persistAsync(this);
    }
    return this;
  }
}

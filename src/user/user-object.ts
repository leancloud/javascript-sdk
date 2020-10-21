import type { App, AuthOptions } from '../app';
import type { MiniAppAuthOptions } from './user-class';
import type { RoleObject } from '../role';
import { UpdateObjectOptions, LCObjectData, LCObjectRef, LCObject, lcEncode } from '../object';
import { Operation } from '../operation';
import { assert } from '../utils';
import { KEY_CURRENT_USER } from '../const';
import { Query } from '../query';
import { AdapterManager } from '../adapters';

export interface UserDataForAdd extends LCObjectData {
  username?: string;
  password?: string;
  email?: string;
  mobilePhoneNumber?: string;
  authData?: Record<string, unknown>;
}

export interface UserData extends LCObjectData {
  username?: string;
  sessionToken?: string;
  email?: string;
  emailVerified?: boolean;
  mobilePhoneNumber?: string;
  mobilePhoneVerified?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authData?: Record<string, any>;
}

interface FollowOptions extends AuthOptions {
  data?: Record<string, unknown>;
}

interface AssociateUnionIdOptions extends UpdateObjectOptions {
  unionIdPlatform?: string;
  asMainAccount?: boolean;
}

/**
 * @internal
 */
export class CurrentUserManager {
  static set(app: App, user: UserObject): void {
    const encodedUser = lcEncode(user, { full: true });
    app.storage.set(KEY_CURRENT_USER, JSON.stringify(encodedUser));
    app.currentUser = AuthedUser.from(user);
  }

  static async setAsync(app: App, user: UserObject): Promise<void> {
    const encodedUser = lcEncode(user, { full: true });
    await app.storage.setAsync(KEY_CURRENT_USER, JSON.stringify(encodedUser));
    app.currentUser = AuthedUser.from(user);
  }

  static get(app: App): AuthedUser {
    if (!app.currentUser) {
      const encodedUser = app.storage.get(KEY_CURRENT_USER);
      if (encodedUser) {
        const user = app.decode(JSON.parse(encodedUser));
        app.currentUser = AuthedUser.from(user);
      }
    }
    return app.currentUser || null;
  }

  static async getAsync(app: App): Promise<AuthedUser> {
    if (!app.currentUser) {
      const encodedUser = await app.storage.getAsync(KEY_CURRENT_USER);
      if (encodedUser) {
        const user = app.decode(JSON.parse(encodedUser));
        app.currentUser = AuthedUser.from(user);
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

  static syncData(app: App, h: (user: Record<string, unknown>) => void): void {
    const encodedUser = app.storage.get(KEY_CURRENT_USER);
    if (!encodedUser) return;
    const userKV = JSON.parse(encodedUser);
    h(userKV);
    delete userKV['password'];
    app.storage.set(KEY_CURRENT_USER, JSON.stringify(userKV));
    app.currentUser = null;
  }

  static async syncDataAsync(app: App, h: (user: Record<string, unknown>) => void): Promise<void> {
    const encodedUser = await app.storage.getAsync(KEY_CURRENT_USER);
    if (!encodedUser) return;
    const userKV = JSON.parse(encodedUser);
    h(userKV);
    delete userKV['password'];
    await app.storage.setAsync(KEY_CURRENT_USER, JSON.stringify(userKV));
    app.currentUser = null;
  }

  static flushDataAsync(app: App, data: UserData): Promise<void>;
  static flushDataAsync(app: App, modifier: (data: UserData) => void): Promise<void>;
  static async flushDataAsync(app: App, arg: UserData | ((data: UserData) => void)): Promise<void> {
    const encodedUser = await app.storage.getAsync(KEY_CURRENT_USER);
    const data = encodedUser ? JSON.parse(encodedUser) : {};
    if (typeof arg === 'function') {
      arg(data);
    } else {
      Object.assign(data, arg);
    }
    delete data.password;
    return app.storage.setAsync(KEY_CURRENT_USER, data);
  }

  static async persist(user: AuthedUser): Promise<void> {
    const encodedUser = lcEncode(user, { full: true });
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

  getRoles(): Promise<RoleObject[]> {
    return new Query('_Role', this.app).where('users', '==', this).find() as Promise<RoleObject[]>;
  }
}

export class UserObject extends LCObject {
  data: UserData;

  protected _ref: UserObjectRef;

  constructor(app: App, objectId: string) {
    super(app, '_User', objectId);
    this._ref = new UserObjectRef(app, objectId);
  }

  get sessionToken(): string {
    return this.data.sessionToken;
  }

  get aclKey(): string {
    return this._ref.aclKey;
  }

  getRoles(): Promise<RoleObject[]> {
    return this._ref.getRoles();
  }
}

export class AuthedUser extends UserObject {
  static from(user: UserObject): AuthedUser {
    const authedUser = new AuthedUser(user.app, user.objectId);
    authedUser.data = user.data;
    authedUser.createdAt = user.createdAt;
    authedUser.updatedAt = user.updatedAt;
    return authedUser;
  }

  get sessionToken(): string {
    return this.data.sessionToken;
  }

  get authData(): UserData['authData'] {
    return this.data.authData;
  }

  get anonymousId(): string {
    return this.authData?.anonymous?.id;
  }

  isAnonymous(): boolean {
    return Boolean(this.authData?.anonymous);
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.app.request({
        path: `/users/me`,
        options: { sessionToken: this.sessionToken },
      });
      return true;
    } catch (error) {
      if (error.code !== 211) {
        throw error;
      }
      return false;
    }
  }

  async updatePassword(
    oldPassword: string,
    newPassword: string,
    options?: Omit<AuthOptions, 'sessionToken'>
  ): Promise<void> {
    const res = await this.app.request({
      method: 'PUT',
      path: `/users/${this.objectId}/updatePassword`,
      body: {
        old_password: oldPassword,
        new_password: newPassword,
      },
      options: { ...options, sessionToken: this.sessionToken },
    });
    this.data.sessionToken = res.body.sessionToken;
    this.mergeData(res.body);
    if (this.app.currentUser === this) {
      await CurrentUserManager.persist(this);
    }
  }

  associateWithAuthData(
    platform: string,
    authDataItem: Record<string, unknown>,
    options?: UpdateObjectOptions
  ): Promise<AuthedUser> {
    const authData = { [platform]: authDataItem };
    return this.update({ authData }, options);
    // TODO: sync storage data
  }

  associateWithAuthDataAndUnionId(
    platform: string,
    authDataItem: Record<string, unknown>,
    unionId: string,
    options?: AssociateUnionIdOptions
  ): Promise<AuthedUser> {
    const item = Object.assign({}, authDataItem, {
      unionid: unionId,
      platform: options?.unionIdPlatform ?? 'weixin',
      main_account: options?.asMainAccount ?? false,
    });
    return this.associateWithAuthData(platform, item, options);
  }

  async associateWithMiniApp(options?: MiniAppAuthOptions): Promise<AuthedUser> {
    const { getAuthInfo } = AdapterManager.get();
    assert(getAuthInfo, 'The getAuthInfo adapter is not set');
    const { provider, authData } = await getAuthInfo(options);
    return this.associateWithAuthData(provider, authData, options);
  }

  dissociateAuthData(platform: string): Promise<UserObject> {
    return this.update({ [`authData.${platform}`]: Operation.unset() });
    // TODO: sync storage data
  }

  async signUp(data: UserDataForAdd, options?: AuthOptions): Promise<AuthedUser> {
    if (!this.isAnonymous()) {
      throw new Error('The signUp method can only be invoked by an anonymous user');
    }
    assert(data.username, 'The username must be provided');
    assert(data.password, 'The password must be provided');
    delete this.data.authData.anonymous;
    return this.update(data, options);
  }

  async refreshSessionToken(options?: Omit<AuthOptions, 'sessionToken'>): Promise<string> {
    const res = await this.app.request({
      method: 'PUT',
      path: `/users/${this.objectId}/refreshSessionToken`,
      options: { ...options, sessionToken: this.sessionToken },
    });
    this.mergeData(res.body);
    if (this.app.currentUser === this) {
      await CurrentUserManager.persist(this);
    }
    return this.sessionToken;
  }

  async update(data: UserData, options?: UpdateObjectOptions): Promise<this> {
    const user = AuthedUser.from((await super.update(data, options)) as UserObject);
    this.mergeData(user.data);
    return this;
  }
}

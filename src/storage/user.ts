import {
  GetObjectOptions,
  UpdateObjectOptions,
  LCObjectData,
  LCObjectRef,
  LCObject,
} from '../storage/object';
import type { App, AuthOptions } from '../app/app';
import type { MiniAppAuthOptions } from './user-class';
import type { RoleObject } from './role';
import { Operation } from './operation';
import { assert } from '../utils';
import { Encoder } from './object';
import { KEY_CURRENT_USER, API_VERSION } from '../const';
import { Query } from './query';
import { AdapterManager } from '../app/adapters';

Encoder.setCreator('_User', (app, id) => new UserObject(app, id));

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
  authData?: Record<string, unknown>;
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
    const encodedUser = Encoder.encode(user, true);
    app.storage.set(KEY_CURRENT_USER, JSON.stringify(encodedUser));
    app.currentUser = user;
  }

  static async setAsync(app: App, user: UserObject): Promise<void> {
    const encodedUser = Encoder.encode(user, true);
    await app.storage.setAsync(KEY_CURRENT_USER, JSON.stringify(encodedUser));
    app.currentUser = user;
  }

  static get(app: App): UserObject {
    if (!app.currentUser) {
      const encodedUser = app.storage.get(KEY_CURRENT_USER);
      if (encodedUser) {
        app.currentUser = Encoder.decode(app, JSON.parse(encodedUser)) as UserObject;
      }
    }
    return app.currentUser || null;
  }

  static async getAsync(app: App): Promise<UserObject> {
    if (!app.currentUser) {
      const encodedUser = await app.storage.getAsync(KEY_CURRENT_USER);
      if (encodedUser) {
        app.currentUser = Encoder.decode(app, JSON.parse(encodedUser)) as UserObject;
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
}

export class UserObjectRef extends LCObjectRef {
  constructor(app: App, objectId: string) {
    super(app, '_User', objectId);
  }

  get aclKey(): string {
    return this.objectId;
  }

  isCurrent(): boolean {
    const currentUser = CurrentUserManager.get(this.app);
    return this.objectId === currentUser?.objectId;
  }

  async isCurrentAsync(): Promise<boolean> {
    const currentUser = await CurrentUserManager.getAsync(this.app);
    return this.objectId === currentUser?.objectId;
  }

  async get(options?: GetObjectOptions): Promise<UserObject> {
    const user = (await super.get(options)) as UserObject;
    if (await this.isCurrentAsync()) {
      await CurrentUserManager.syncDataAsync(this.app, (userKV) => {
        Object.assign(userKV, Encoder.encode(user, true));
      });
    }
    return user;
  }

  async update(data: UserData, options?: UpdateObjectOptions): Promise<UserObject> {
    const user = (await super.update(data, options)) as UserObject;
    if (await this.isCurrentAsync()) {
      await CurrentUserManager.syncDataAsync(this.app, (userKV) => {
        // TODO: 因为无法直接从 API 获取删除的属性, 所以需要判断 data 来同步删除本地缓存的当前用户的属性.
        // 不过我怀疑是否有删除某属性后又在本地读取该属性的使用场景, 所以暂时未实现该功能
        Object.assign(userKV, data, Encoder.encode(user, true));
      });
    }
    return user;
  }

  async delete(options?: AuthOptions): Promise<void> {
    await super.delete(options);
    if (await this.isCurrentAsync()) {
      await CurrentUserManager.removeAsync(this.app);
    }
  }

  getRoles(): Promise<RoleObject[]> {
    return new Query('_Role', this.app).where('users', '==', this).find() as Promise<RoleObject[]>;
  }
}

export class UserObject extends LCObject {
  data: UserData;
  createdAt: Date;
  updatedAt: Date;

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

  private get _anonymousId(): string {
    const authData = this.data.authData as { anonymous?: { id: string } };
    return authData.anonymous?.id;
  }

  isCurrent(): boolean {
    if (this.isAnonymous()) {
      const currentUser = CurrentUserManager.get(this.app);
      return this._anonymousId === currentUser._anonymousId;
    }
    return this._ref.isCurrent();
  }

  async isCurrentAsync(): Promise<boolean> {
    if (this.isAnonymous()) {
      const currentUser = await CurrentUserManager.getAsync(this.app);
      return this._anonymousId === currentUser._anonymousId;
    }
    return this._ref.isCurrentAsync();
  }

  isAnonymous(): boolean {
    return !!this.data.authData?.anonymous;
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.app.request({
        path: `${API_VERSION}/users/me`,
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
    options?: AuthOptions
  ): Promise<void> {
    const res = await this.app.request({
      method: 'PUT',
      path: `${API_VERSION}/users/${this.objectId}/updatePassword`,
      body: {
        old_password: oldPassword,
        new_password: newPassword,
      },
      options: { sessionToken: this.sessionToken, ...options },
    });
    this.data.sessionToken = (res.body as UserData).sessionToken;
    if (await this.isCurrentAsync()) {
      await CurrentUserManager.syncDataAsync(this.app, (userKV) => {
        userKV.sessionToken = this.sessionToken;
      });
    }
  }

  associateWithAuthData(
    platform: string,
    authData: Record<string, unknown>,
    options?: UpdateObjectOptions
  ): Promise<UserObject> {
    return this.update({ authData: { [platform]: authData } }, { fetch: true, ...options });
  }

  associateWithAuthDataAndUnionId(
    platform: string,
    authData: Record<string, unknown>,
    unionId: string,
    options?: AssociateUnionIdOptions
  ): Promise<UserObject> {
    Object.assign(authData, {
      unionid: unionId,
      platform: options?.unionIdPlatform ?? 'weixin',
      main_account: options?.asMainAccount ?? false,
    });
    return this.associateWithAuthData(platform, authData, options);
  }

  async associateWithMiniApp(options?: MiniAppAuthOptions): Promise<UserObject> {
    const authInfo = await AdapterManager.get().getAuthInfo(options);
    return this.associateWithAuthData(authInfo.provider, authInfo.authData, options);
  }

  dissociateAuthData(platform: string): Promise<UserObject> {
    return this.update({ [`authData.${platform}`]: Operation.unset() }, { fetch: true });
  }

  async signUp(data: UserDataForAdd, options?: AuthOptions): Promise<UserObject> {
    if (!this.isAnonymous()) {
      throw new Error('User#signUp can only be invoked by an anonymous user');
    }
    assert(data.username, 'The username must be provided');
    assert(data.password, 'The password must be provided');
    if (await this.isCurrentAsync()) {
      CurrentUserManager.syncDataAsync(this.app, (userKV) => {
        delete userKV.authData['anonymous'];
      });
    }
    return this.update(data, options);
  }

  async refreshSessionToken(options?: AuthOptions): Promise<void> {
    const res = await this.app.request({
      method: 'PUT',
      path: `${API_VERSION}/users/${this.objectId}/refreshSessionToken`,
      options: { ...options, sessionToken: this.sessionToken },
    });
    this.data.sessionToken = res.body['sessionToken'];
    if (await this.isCurrentAsync()) {
      await CurrentUserManager.syncDataAsync(this.app, (userKV) => {
        userKV.sessionToken = this.sessionToken;
      });
    }
  }

  async follow(
    followee: UserObjectRef | UserObject | string,
    options?: FollowOptions
  ): Promise<void> {
    assert(this.sessionToken, 'Cannot create friendship for an unauthorized user');
    const followeeId = typeof followee === 'string' ? followee : followee.objectId;
    await this.app.request({
      method: 'POST',
      path: `${API_VERSION}/users/${this.objectId}/friendship/${followeeId}`,
      body: options?.data,
      options: { ...options, sessionToken: this.sessionToken },
    });
  }

  async unfollow(
    followee: UserObjectRef | UserObject | string,
    options?: AuthOptions
  ): Promise<void> {
    assert(this.sessionToken, 'Cannot remove friendship for an unauthorized user');
    const followeeId = typeof followee === 'string' ? followee : followee.objectId;
    await this.app.request({
      method: 'DELETE',
      path: `${API_VERSION}/users/${this.objectId}/friendship/${followeeId}`,
      options: { ...options, sessionToken: this.sessionToken },
    });
  }

  getRoles(): Promise<RoleObject[]> {
    return this._ref.getRoles();
  }

  get(options?: GetObjectOptions): Promise<UserObject> {
    return this._ref.get({ sessionToken: this.sessionToken, ...options });
  }

  update(data: UserData, options?: UpdateObjectOptions): Promise<UserObject> {
    return this._ref.update(data, { sessionToken: this.sessionToken, ...options });
  }

  delete(options?: AuthOptions): Promise<void> {
    return this._ref.delete({ sessionToken: this.sessionToken, ...options });
  }
}

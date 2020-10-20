import type { App, AuthOptions } from '../../app/app';
import {
  UserObject,
  UserObjectRef,
  CurrentUserManager,
  UserData,
  UserDataForAdd,
  AuthedUser,
} from './user-object';
import { v4 as uuid_v4 } from 'uuid';
import { Class } from '../class';
import { removeReservedKeys } from '../object';
import { AdapterManager } from '../../app/adapters';
import { mustGetDefaultApp } from '../../app/default-app';

interface SignUpDataWithMobile extends UserDataForAdd {
  mobilePhoneNumber: string;
  smsCode: string;
}

interface LoginWithAuthDataOptions extends AuthOptions {
  failOnNotExist?: boolean;
}

interface LoginWithAuthDataAndUnionIdOptions extends LoginWithAuthDataOptions {
  unionIdPlatform?: string;
  asMainAccount?: boolean;
}

interface AuthOptionsWithCaptchaToken extends AuthOptions {
  validateToken?: string;
}

interface ChangePhoneNumberOptions extends AuthOptionsWithCaptchaToken {
  ttl?: number;
}

export interface MiniAppAuthOptions extends LoginWithAuthDataOptions {
  [key: string]: unknown;
}

/**
 * @alias User
 */
export class UserClass extends Class {
  constructor(app?: App) {
    super('_User', app);
  }

  protected get _apiPath(): string {
    return `/users`;
  }

  static object(id: string): UserObjectRef {
    return new UserObjectRef(mustGetDefaultApp(), id);
  }

  static current(): UserObject {
    return CurrentUserManager.get(mustGetDefaultApp());
  }

  static currentAsync(): Promise<UserObject> {
    return CurrentUserManager.getAsync(mustGetDefaultApp());
  }

  static become(sessionToken: string, options?: AuthOptions): Promise<UserObject> {
    return new UserClass(mustGetDefaultApp()).become(sessionToken, options);
  }

  static signUp(data: UserDataForAdd, options?: AuthOptions): Promise<UserObject> {
    return new UserClass(mustGetDefaultApp()).signUp(data, options);
  }

  static signUpOrLoginWithMobilePhone(
    data: SignUpDataWithMobile,
    options?: AuthOptions
  ): Promise<UserObject> {
    return new UserClass(mustGetDefaultApp()).signUpOrLoginWithMobilePhone(data, options);
  }

  static loginWithData(data: UserData, options?: AuthOptions): Promise<UserObject> {
    return new UserClass(mustGetDefaultApp()).loginWithData(data, options);
  }

  static login(username: string, password: string, options?: AuthOptions): Promise<UserObject> {
    return new UserClass(mustGetDefaultApp()).login(username, password, options);
  }

  static loginWithAuthData(
    platform: string,
    authData: Record<string, unknown>,
    options?: LoginWithAuthDataOptions
  ): Promise<UserObject> {
    return new UserClass(mustGetDefaultApp()).loginWithAuthData(platform, authData, options);
  }

  static loginAnonymously(options?: AuthOptions): Promise<UserObject> {
    return new UserClass(mustGetDefaultApp()).loginAnonymously(options);
  }

  static loginWithEmail(
    email: string,
    password: string,
    options?: AuthOptions
  ): Promise<UserObject> {
    return new UserClass(mustGetDefaultApp()).loginWithEmail(email, password, options);
  }

  static loginWithMobilePhone(
    mobilePhoneNumber: string,
    password: string,
    options?: AuthOptions
  ): Promise<UserObject> {
    return new UserClass(mustGetDefaultApp()).loginWithMobilePhone(
      mobilePhoneNumber,
      password,
      options
    );
  }

  static loginWithMobilePhoneSMSCode(
    mobilePhoneNumber: string,
    smsCode: string,
    options?: AuthOptions
  ): Promise<UserObject> {
    return new UserClass(mustGetDefaultApp()).loginWithMobilePhoneSMSCode(
      mobilePhoneNumber,
      smsCode,
      options
    );
  }

  static loginWithAuthDataAndUnionId(
    platform: string,
    authData: Record<string, unknown>,
    unionId: string,
    options?: LoginWithAuthDataAndUnionIdOptions
  ): Promise<UserObject> {
    return new UserClass(mustGetDefaultApp()).loginWithAuthDataAndUnionId(
      platform,
      authData,
      unionId,
      options
    );
  }

  static loginWithMiniApp(options?: MiniAppAuthOptions): Promise<UserObject> {
    return new UserClass(mustGetDefaultApp()).loginWithMiniApp(options);
  }

  static logOut(): void {
    new UserClass(mustGetDefaultApp()).logOut();
  }

  static logOutAsync(): Promise<void> {
    return new UserClass(mustGetDefaultApp()).logOutAsync();
  }

  static requestEmailVerify(email: string, options?: AuthOptions): Promise<void> {
    return new UserClass(mustGetDefaultApp()).requestEmailVerify(email, options);
  }

  static requestLoginSMSCode(
    mobilePhoneNumber: string,
    options?: AuthOptionsWithCaptchaToken
  ): Promise<void> {
    return new UserClass(mustGetDefaultApp()).requestLoginSMSCode(mobilePhoneNumber, options);
  }

  static requestMobilePhoneVerify(
    mobilePhoneNumber: string,
    options?: AuthOptionsWithCaptchaToken
  ): Promise<void> {
    return new UserClass(mustGetDefaultApp()).requestMobilePhoneVerify(mobilePhoneNumber, options);
  }

  static requestPasswordReset(email: string, options?: AuthOptions): Promise<void> {
    return new UserClass(mustGetDefaultApp()).requestPasswordReset(email, options);
  }

  static requestPasswordResetBySMSCode(
    mobilePhoneNumber: string,
    options?: AuthOptionsWithCaptchaToken
  ): Promise<void> {
    return new UserClass(mustGetDefaultApp()).requestPasswordResetBySMSCode(
      mobilePhoneNumber,
      options
    );
  }

  static resetPasswordBySMSCode(
    code: string,
    password: string,
    options?: AuthOptions
  ): Promise<void> {
    return new UserClass(mustGetDefaultApp()).resetPasswordBySMSCode(code, password, options);
  }

  static verifyMobilePhone(code: string, options?: AuthOptions): Promise<void> {
    return new UserClass(mustGetDefaultApp()).verifyMobilePhone(code, options);
  }

  static requestChangePhoneNumber(
    mobilePhoneNumber: string,
    options?: ChangePhoneNumberOptions
  ): Promise<void> {
    return new UserClass(mustGetDefaultApp()).requestChangePhoneNumber(mobilePhoneNumber, options);
  }

  static changePhoneNumber(
    mobilePhoneNumber: string,
    code: string,
    options?: AuthOptions
  ): Promise<void> {
    return new UserClass(mustGetDefaultApp()).changePhoneNumber(mobilePhoneNumber, code, options);
  }

  object(id: string): UserObjectRef {
    return new UserObjectRef(this.app, id);
  }

  current(): UserObject {
    return CurrentUserManager.get(this.app);
  }

  currentAsync(): Promise<UserObject> {
    return CurrentUserManager.getAsync(this.app);
  }

  async become(sessionToken: string, options?: AuthOptions): Promise<AuthedUser> {
    const res = await this.app.request({
      path: `/users/me`,
      options: { ...options, sessionToken },
    });
    return this._decodeAndSetToCurrent(res.body);
  }

  async signUp(data: UserDataForAdd, options?: AuthOptions): Promise<UserObject> {
    const res = await this.app.request({
      method: 'POST',
      path: `/users`,
      body: removeReservedKeys(data),
      options,
    });
    return this._decodeAndSetToCurrent(res.body);
  }

  async signUpOrLoginWithMobilePhone(
    data: SignUpDataWithMobile,
    options?: AuthOptions
  ): Promise<UserObject> {
    const res = await this.app.request({
      method: 'POST',
      path: `/usersByMobilePhone`,
      body: removeReservedKeys(data),
      options,
    });
    return this._decodeAndSetToCurrent(res.body);
  }

  async loginWithData(data: UserData, options?: AuthOptions): Promise<UserObject> {
    const res = await this.app.request({
      method: 'POST',
      path: `/login`,
      body: removeReservedKeys(data),
      options,
    });
    return this._decodeAndSetToCurrent(res.body);
  }

  login(username: string, password: string, options?: AuthOptions): Promise<UserObject> {
    return this.loginWithData({ username, password }, options);
  }

  async loginWithAuthData(
    platform: string,
    authData: Record<string, unknown>,
    options?: LoginWithAuthDataOptions
  ): Promise<UserObject> {
    const res = await this.app.request({
      method: 'POST',
      path: `/users`,
      body: { authData: { [platform]: authData } },
      query: { failOnNotExist: options?.failOnNotExist },
      options,
    });
    return this._decodeAndSetToCurrent(res.body);
  }

  loginAnonymously(options?: AuthOptions): Promise<UserObject> {
    return this.loginWithAuthData('anonymous', { id: uuid_v4() }, options);
  }

  loginWithEmail(email: string, password: string, options?: AuthOptions): Promise<UserObject> {
    return this.loginWithData({ email, password }, options);
  }

  loginWithMobilePhone(
    mobilePhoneNumber: string,
    password: string,
    options?: AuthOptions
  ): Promise<UserObject> {
    return this.loginWithData({ mobilePhoneNumber, password }, options);
  }

  loginWithMobilePhoneSMSCode(
    mobilePhoneNumber: string,
    smsCode: string,
    options?: AuthOptions
  ): Promise<UserObject> {
    return this.loginWithData({ mobilePhoneNumber, smsCode }, options);
  }

  loginWithAuthDataAndUnionId(
    platform: string,
    authData: Record<string, unknown>,
    unionId: string,
    options?: LoginWithAuthDataAndUnionIdOptions
  ): Promise<UserObject> {
    authData = Object.assign({}, authData, {
      platform: options?.unionIdPlatform,
      main_account: options?.asMainAccount,
      unionid: unionId,
    });
    return this.loginWithAuthData(platform, authData, options);
  }

  async loginWithMiniApp(options?: MiniAppAuthOptions): Promise<UserObject> {
    const authInfo = await AdapterManager.get().getAuthInfo(options);
    // XXX: 如果对 provider 和 platform 的用法有困惑, 请咨询 @leeyeh
    return this.loginWithAuthData(authInfo.provider, authInfo.authData, options);
  }

  logOut(): void {
    CurrentUserManager.remove(this.app);
  }

  logOutAsync(): Promise<void> {
    return CurrentUserManager.removeAsync(this.app);
  }

  async requestEmailVerify(email: string, options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'POST',
      path: `/requestEmailVerify`,
      body: { email },
      options,
    });
  }

  async requestLoginSMSCode(
    mobilePhoneNumber: string,
    options?: AuthOptionsWithCaptchaToken
  ): Promise<void> {
    await this.app.request({
      method: 'POST',
      path: `/requestLoginSmsCode`,
      body: {
        mobilePhoneNumber,
        validate_token: options?.validateToken,
      },
      options,
    });
  }

  async requestMobilePhoneVerify(
    mobilePhoneNumber: string,
    options?: AuthOptionsWithCaptchaToken
  ): Promise<void> {
    await this.app.request({
      method: 'POST',
      path: `/requestMobilePhoneVerify`,
      body: {
        mobilePhoneNumber,
        validate_token: options?.validateToken,
      },
      options,
    });
  }

  async requestPasswordReset(email: string, options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'POST',
      path: `/requestPasswordReset`,
      body: { email },
      options,
    });
  }

  async requestPasswordResetBySMSCode(
    mobilePhoneNumber: string,
    options?: AuthOptionsWithCaptchaToken
  ): Promise<void> {
    await this.app.request({
      method: 'POST',
      path: `/requestPasswordResetBySmsCode`,
      body: {
        mobilePhoneNumber,
        validate_token: options?.validateToken,
      },
      options,
    });
  }

  async resetPasswordBySMSCode(
    code: string,
    password: string,
    options?: AuthOptions
  ): Promise<void> {
    await this.app.request({
      method: 'PUT',
      path: `/resetPasswordBySmsCode/${code}`,
      body: { password },
      options,
    });
  }

  async verifyMobilePhone(code: string, options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'POST',
      path: `/verifyMobilePhone/${code}`,
      options,
    });
  }

  async requestChangePhoneNumber(
    mobilePhoneNumber: string,
    options?: ChangePhoneNumberOptions
  ): Promise<void> {
    await this.app.request({
      method: 'POST',
      path: `/requestChangePhoneNumber`,
      body: {
        mobilePhoneNumber,
        ttl: options?.ttl,
      },
      options,
    });
  }

  async changePhoneNumber(
    mobilePhoneNumber: string,
    code: string,
    options?: AuthOptions
  ): Promise<void> {
    await this.app.request({
      method: 'POST',
      path: `/changePhoneNumber`,
      body: { mobilePhoneNumber, code },
      options,
    });
  }

  private async _decodeAndSetToCurrent(data: unknown): Promise<AuthedUser> {
    const user = this.app.decode(data, { type: 'Object', className: '_User' });
    const authedUser = AuthedUser.from(user);
    await CurrentUserManager.setAsync(this.app, authedUser);
    return authedUser;
  }
}

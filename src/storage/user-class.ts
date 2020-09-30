import { App, AuthOptions } from '../app/app';
import { UserObject, UserObjectRef, CurrentUserManager, UserData, UserDataForAdd } from './user';
import { v4 as uuid_v4 } from 'uuid';
import { Class } from './class';
import { Encoder, removeReservedKeys } from './object';
import { API_VERSION } from '../const';
import { AdapterManager } from '../app/adapters';

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

export class UserClass extends Class {
  constructor(app: App) {
    super(app, '_User');
  }

  protected get _apiPath(): string {
    return `${API_VERSION}/users`;
  }

  static object(id: string): UserObjectRef {
    return new UserObjectRef(App.default, id);
  }

  static current(): UserObject {
    return CurrentUserManager.get(App.default);
  }

  static currentAsync(): Promise<UserObject> {
    return CurrentUserManager.getAsync(App.default);
  }

  static become(sessionToken: string, options?: AuthOptions): Promise<UserObject> {
    return new UserClass(App.default).become(sessionToken, options);
  }

  static signUp(data: UserDataForAdd, options?: AuthOptions): Promise<UserObject> {
    return new UserClass(App.default).signUp(data, options);
  }

  static signUpOrLoginWithMobilePhone(
    data: SignUpDataWithMobile,
    options?: AuthOptions
  ): Promise<UserObject> {
    return new UserClass(App.default).signUpOrLoginWithMobilePhone(data, options);
  }

  static loginWithData(data: UserData, options?: AuthOptions): Promise<UserObject> {
    return new UserClass(App.default).loginWithData(data, options);
  }

  static login(username: string, password: string, options?: AuthOptions): Promise<UserObject> {
    return new UserClass(App.default).login(username, password, options);
  }

  static loginWithAuthData(
    platform: string,
    authData: Record<string, unknown>,
    options?: LoginWithAuthDataOptions
  ): Promise<UserObject> {
    return new UserClass(App.default).loginWithAuthData(platform, authData, options);
  }

  static loginAnonymously(options?: AuthOptions): Promise<UserObject> {
    return new UserClass(App.default).loginAnonymously(options);
  }

  static loginWithEmail(
    email: string,
    password: string,
    options?: AuthOptions
  ): Promise<UserObject> {
    return new UserClass(App.default).loginWithEmail(email, password, options);
  }

  static loginWithMobilePhone(
    mobilePhoneNumber: string,
    password: string,
    options?: AuthOptions
  ): Promise<UserObject> {
    return new UserClass(App.default).loginWithMobilePhone(mobilePhoneNumber, password, options);
  }

  static loginWithMobilePhoneSMSCode(
    mobilePhoneNumber: string,
    smsCode: string,
    options?: AuthOptions
  ): Promise<UserObject> {
    return new UserClass(App.default).loginWithMobilePhoneSMSCode(
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
    return new UserClass(App.default).loginWithAuthDataAndUnionId(
      platform,
      authData,
      unionId,
      options
    );
  }

  static loginWithMiniApp(options?: MiniAppAuthOptions): Promise<UserObject> {
    return new UserClass(App.default).loginWithMiniApp(options);
  }

  static logOut(): void {
    new UserClass(App.default).logOut();
  }

  static logOutAsync(): Promise<void> {
    return new UserClass(App.default).logOutAsync();
  }

  static requestEmailVerify(email: string, options?: AuthOptions): Promise<void> {
    return new UserClass(App.default).requestEmailVerify(email, options);
  }

  static requestLoginSMSCode(
    mobilePhoneNumber: string,
    options?: AuthOptionsWithCaptchaToken
  ): Promise<void> {
    return new UserClass(App.default).requestLoginSMSCode(mobilePhoneNumber, options);
  }

  static requestMobilePhoneVerify(
    mobilePhoneNumber: string,
    options?: AuthOptionsWithCaptchaToken
  ): Promise<void> {
    return new UserClass(App.default).requestMobilePhoneVerify(mobilePhoneNumber, options);
  }

  static requestPasswordReset(email: string, options?: AuthOptions): Promise<void> {
    return new UserClass(App.default).requestPasswordReset(email, options);
  }

  static requestPasswordResetBySMSCode(
    mobilePhoneNumber: string,
    options?: AuthOptionsWithCaptchaToken
  ): Promise<void> {
    return new UserClass(App.default).requestPasswordResetBySMSCode(mobilePhoneNumber, options);
  }

  static resetPasswordBySMSCode(
    code: string,
    password: string,
    options?: AuthOptions
  ): Promise<void> {
    return new UserClass(App.default).resetPasswordBySMSCode(code, password, options);
  }

  static verifyMobilePhone(code: string, options?: AuthOptions): Promise<void> {
    return new UserClass(App.default).verifyMobilePhone(code, options);
  }

  static requestChangePhoneNumber(
    mobilePhoneNumber: string,
    options?: ChangePhoneNumberOptions
  ): Promise<void> {
    return new UserClass(App.default).requestChangePhoneNumber(mobilePhoneNumber, options);
  }

  static changePhoneNumber(
    mobilePhoneNumber: string,
    code: string,
    options?: AuthOptions
  ): Promise<void> {
    return new UserClass(App.default).changePhoneNumber(mobilePhoneNumber, code, options);
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

  async become(sessionToken: string, options?: AuthOptions): Promise<UserObject> {
    const res = await this.app.request({
      path: `${API_VERSION}/users/me`,
      options: { ...options, sessionToken },
    });
    return this._decodeAndSetToCurrent(res.body);
  }

  async signUp(data: UserDataForAdd, options?: AuthOptions): Promise<UserObject> {
    const res = await this.app.request({
      method: 'POST',
      path: `${API_VERSION}/users`,
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
      path: `${API_VERSION}/usersByMobilePhone`,
      body: removeReservedKeys(data),
      options,
    });
    return this._decodeAndSetToCurrent(res.body);
  }

  async loginWithData(data: UserData, options?: AuthOptions): Promise<UserObject> {
    const res = await this.app.request({
      method: 'POST',
      path: `${API_VERSION}/login`,
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
      path: `${API_VERSION}/users`,
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
      path: `${API_VERSION}/requestEmailVerify`,
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
      path: `${API_VERSION}/requestLoginSmsCode`,
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
      path: `${API_VERSION}/requestMobilePhoneVerify`,
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
      path: `${API_VERSION}/requestPasswordReset`,
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
      path: `${API_VERSION}/requestPasswordResetBySmsCode`,
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
      path: `${API_VERSION}/resetPasswordBySmsCode/${code}`,
      body: { password },
      options,
    });
  }

  async verifyMobilePhone(code: string, options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'POST',
      path: `${API_VERSION}/verifyMobilePhone/${code}`,
      options,
    });
  }

  async requestChangePhoneNumber(
    mobilePhoneNumber: string,
    options?: ChangePhoneNumberOptions
  ): Promise<void> {
    await this.app.request({
      method: 'POST',
      path: `${API_VERSION}/requestChangePhoneNumber`,
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
      path: `${API_VERSION}/changePhoneNumber`,
      body: { mobilePhoneNumber, code },
      options,
    });
  }

  private async _decodeAndSetToCurrent(data: unknown): Promise<UserObject> {
    const user = Encoder.decodeObject(this.app, data, this.className) as UserObject;
    await CurrentUserManager.setAsync(this.app, user);
    return user;
  }
}

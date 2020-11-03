import type { App, AuthOptions } from '../app';
import { UserObject, UserObjectRef, CurrentUserManager, AuthedUser } from './user-object';
import { v4 as uuid_v4 } from 'uuid';
import { Class } from '../class';
import { getAdapters } from '../adapters';
import { assert } from '../utils';
import { LCEncode, LCObjectData, omitReservedKeys } from '../object';

interface SignUpData extends LCObjectData {
  username: string;
  password: string;
  email?: string;
  mobilePhoneNumber?: string;
  authData?: Record<string, any>;
}

interface SignUpDataWithMobile extends Partial<SignUpData> {
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
  constructor(app: App) {
    super(app, '_User');
  }

  protected get _apiPath(): string {
    return `/users`;
  }

  object(id: string): UserObjectRef {
    return new UserObjectRef(this.app, id);
  }

  current(): AuthedUser {
    return CurrentUserManager.get(this.app);
  }

  currentAsync(): Promise<AuthedUser> {
    return CurrentUserManager.getAsync(this.app);
  }

  async become(sessionToken: string, options?: AuthOptions): Promise<AuthedUser> {
    return this._decodeAndSetToCurrent(
      await this.app.request({
        method: 'GET',
        path: `/users/me`,
        options: { ...options, sessionToken },
      })
    );
  }

  async signUp(data: SignUpData, options?: AuthOptions): Promise<AuthedUser> {
    return this._decodeAndSetToCurrent(
      await this.app.request({
        method: 'POST',
        path: `/users`,
        body: LCEncode(omitReservedKeys(data)),
        options,
      })
    );
  }

  async signUpOrLoginWithMobilePhone(
    data: SignUpDataWithMobile,
    options?: AuthOptions
  ): Promise<AuthedUser> {
    return this._decodeAndSetToCurrent(
      await this.app.request({
        method: 'POST',
        path: `/usersByMobilePhone`,
        body: LCEncode(omitReservedKeys(data)),
        options,
      })
    );
  }

  async loginWithData(data: Record<string, any>, options?: AuthOptions): Promise<AuthedUser> {
    return this._decodeAndSetToCurrent(
      await this.app.request({
        method: 'POST',
        path: `/login`,
        body: LCEncode(omitReservedKeys(data)),
        options,
      })
    );
  }

  login(username: string, password: string, options?: AuthOptions): Promise<UserObject> {
    return this.loginWithData({ username, password }, options);
  }

  async loginWithAuthData(
    platform: string,
    authDataItem: Record<string, unknown>,
    options?: LoginWithAuthDataOptions
  ): Promise<UserObject> {
    return this._decodeAndSetToCurrent(
      await this.app.request({
        method: 'POST',
        path: `/users`,
        body: { authData: { [platform]: authDataItem } },
        query: { failOnNotExist: options?.failOnNotExist },
        options,
      })
    );
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
    authDataItem: Record<string, unknown>,
    unionId: string,
    options: LoginWithAuthDataAndUnionIdOptions
  ): Promise<UserObject> {
    const { unionIdPlatform = 'weixin' } = options || {};
    return this.loginWithAuthData(
      platform,
      {
        ...authDataItem,
        unionid: unionId,
        platform: unionIdPlatform,
        main_account: options?.asMainAccount,
      },
      options
    );
  }

  async loginWithMiniApp(options?: MiniAppAuthOptions): Promise<UserObject> {
    const authInfo = await getAdapters().getAuthInfo(options);
    return this.loginWithAuthData(authInfo.provider, authInfo.authData, options);
  }

  async loginWithMiniAppAndUnionId(
    unionId: string,
    options?: MiniAppAuthOptions & Pick<LoginWithAuthDataAndUnionIdOptions, 'asMainAccount'>
  ): Promise<UserObject> {
    const { provider, authData, platform } = await getAdapters().getAuthInfo(options);
    assert(platform, 'Current mini-app not support login with unionId');
    return this.loginWithAuthDataAndUnionId(provider, authData, unionId, {
      ...options,
      unionIdPlatform: platform,
    });
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

  private async _decodeAndSetToCurrent(data: Record<string, any>): Promise<AuthedUser> {
    const user = AuthedUser.fromJSON(this.app, data);
    await CurrentUserManager.setAsync(user);
    return user;
  }
}

import { HTTPRequest, RequestOptions, HTTPResponse, request } from './http';
import { AdapterManager } from './adapters';
import { NSStorage } from './storage';
import { Encoder, LCObject } from '../storage/object';
import { KEY_CURRENT_USER, SDK_VERSION } from '../const';
import { APIError } from './errors';
import { assert } from '../utils';
import { isCNApp, Router, Service } from './router';
import type { UserObject } from '../storage/user';

interface AppConfig {
  appId: string;
  appKey: string;
  serverURL: string;
  masterKey?: string;
  useMasterKey?: boolean;
  production?: boolean;
}

export interface AuthOptions extends RequestOptions {
  sessionToken?: string;
  useMasterKey?: boolean;
}

/** @internal */
export interface AdvancedHTTPRequest extends HTTPRequest {
  service?: Service;
  options?: AuthOptions;
}

/**
 * 初始化默认应用. 如果需要使用多个应用, 请实例化 {@link App}.
 * @since 5.0.0
 */
export function init(config: AppConfig): void {
  App.initDefault(config);
}

export class App {
  appId: string;
  appKey: string;
  serverURL: string;
  masterKey: string;

  /**
   * 是否使用 masterKey, 默认为 `false`.
   * @since 5.0.0
   */
  useMasterKey: boolean;

  /**
   * 是否使用生成环境, 默认为 `true`.
   * @since 5.0.0
   */
  production: boolean;

  /** @internal */
  storage: NSStorage;

  /** @internal */
  currentUser: UserObject;

  /* eslint-disable */
  /** @internal */
  realtimeInstance: any;
  /* eslint-enable */

  private _router: Router;

  private static _default: App;

  constructor(config: AppConfig) {
    this.appId = config.appId;
    this.appKey = config.appKey;
    this.serverURL = config.serverURL;
    this.masterKey = config.masterKey;
    this.useMasterKey = config.useMasterKey ?? false;
    this.production = config.production ?? true;

    assert(this.appId, 'The appId is required');
    assert(this.appKey, 'The appKey is required');
    if (isCNApp(this)) {
      assert(this.serverURL, 'The serverURL is required by CN App');
    }

    this.storage = new NSStorage(this.appId);
    if (!this.serverURL) {
      this._router = new Router(this);
    }
  }

  /** @internal */
  static initDefault(config: AppConfig): void {
    assert(!this._default, 'Default app already initialized');
    this._default = new App(config);
  }

  /**
   * 获取默认应用, 在默认应用未{@link init | 初始化}时将抛出异常.
   * @since 5.0.0
   */
  static get default(): App {
    assert(this._default, 'Default app not initialized');
    return this._default;
  }

  /** @internal */
  async request(req: AdvancedHTTPRequest): Promise<HTTPResponse> {
    if (req.baseURL) {
      return request(req);
    }

    req.baseURL = this.serverURL || (await this._router.getServiceURL(req.service));

    req.header = Object.assign(req.header || {}, {
      'Content-Type': 'application/json',
      'X-LC-UA': getUserAgent('LeanCloud-JS-SDK'),
      'X-LC-Id': this.appId,
      'X-LC-Key': this.appKey,
    });

    let { useMasterKey } = this;
    if (req.options?.useMasterKey !== undefined) {
      useMasterKey = req.options.useMasterKey;
    }
    if (useMasterKey) {
      req.header['X-LC-Key'] = this.masterKey + ',master';
    }

    let sessionToken: string;
    if (req.options?.sessionToken) {
      sessionToken = req.options.sessionToken;
    } else {
      sessionToken = await this.getSessionTokenAsync();
    }
    if (sessionToken) {
      req.header['X-LC-Session'] = sessionToken;
    }

    if (!this.production) {
      req.header['X-LC-Prod'] = '0';
    }
    const res = await request(req);
    if (res.status >= 400) {
      const { code, error } = res.body as { code: number; error: string };
      throw new APIError(code, error);
    }
    return res;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decode(data: unknown): any {
    return Encoder.decode(this, data);
  }

  decodeObject(data: unknown, className?: string): LCObject {
    return Encoder.decodeObject(this, data, className);
  }

  /**
   * 暂停当前应用的即时通讯连接, 通常在将应用切换到后台之前调用.
   * @since 5.0.0
   */
  pause(): void {
    if (this.realtimeInstance) {
      this.realtimeInstance.pause();
    }
  }

  /**
   * 恢复当前应用的即时通讯连接.
   * @since 5.0.0
   */
  resume(): void {
    if (this.realtimeInstance) {
      this.realtimeInstance.resume();
    }
  }

  /**
   * 同步获取当前登录用户的 sessionToken.
   * @since 5.0.0
   */
  getSessionToken(): string {
    if (this.currentUser) {
      return this.currentUser.sessionToken;
    }
    const userStr = this.storage.get(KEY_CURRENT_USER);
    if (userStr) {
      return JSON.parse(userStr).sessionToken;
    }
    return null;
  }

  /**
   * 异步获取当前登录用户的 sessionToken.
   * @since 5.0.0
   */
  async getSessionTokenAsync(): Promise<string> {
    if (this.currentUser) {
      return this.currentUser.sessionToken;
    }
    const userStr = await this.storage.getAsync(KEY_CURRENT_USER);
    if (userStr) {
      return JSON.parse(userStr).sessionToken;
    }
    return null;
  }
}

/** @internal */
function getUserAgent(base: string): string {
  const userAgent = base + '/' + SDK_VERSION;
  if (AdapterManager.isSet) {
    const { platformInfo } = AdapterManager.get();
    if (platformInfo) {
      const { name, version } = platformInfo;
      if (name) {
        if (version) {
          return userAgent + ` (${name}/${version})`;
        }
        return userAgent + ` (${name})`;
      }
    }
  }
  return userAgent;
}

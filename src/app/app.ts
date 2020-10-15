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

/**
 * @internal
 */
export interface AdvancedHTTPRequest extends HTTPRequest {
  service?: Service;
  options?: AuthOptions;
}

/**
 * Initialize the default App. If multiple App is needed, instantiate {@link App}.
 *
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
   * Switches the SDK to using the `masterKey`. The `masterKey` grants privileged access to the data
   * in LeanCloud and can be used to bypass ACLs and other restrictions that are applied to the client SDKs.
   *
   * The default value is `false`.
   *
   * @since 5.0.0
   */
  useMasterKey: boolean;

  /**
   * Use the production environment
   *
   * The default value is `true`.
   *
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
   * Getter of the default App, throw an error if the default App is not {@link init initialized}.
   *
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

  /**
   * @since 5.0.0
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decode(data: unknown): any {
    return Encoder.decode(this, data);
  }

  /**
   * Decode data, assert the data can be decoded to an LCObject.
   *
   * @param className Preferred className.
   *
   * @since 5.0.0
   */
  decodeObject(data: unknown, className?: string): LCObject {
    return Encoder.decodeObject(this, data, className);
  }

  /**
   * Pause the real-time connection of the current App. This is useful to deactivate the SDK when the
   * program is switched to the background.
   *
   * @since 5.0.0
   */
  pause(): void {
    this.realtimeInstance?.pause();
  }

  /**
   * Resume the real-time connection of the current App. All LiveQuery subscriptions will be restored
   * after reconnection.
   *
   * @since 5.0.0
   */
  resume(): void {
    this.realtimeInstance?.resume();
  }

  /**
   * Get the current user's `sessionToken`, returns `null` if no user is logged in the current App.
   *
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
   * Get the current user's `sessionToken` asynchronously.
   *
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

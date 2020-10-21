import { HTTP, HTTPRequest, HTTPResponse, RequestOptions } from '../http';
import { AdapterManager } from '../adapters';
import { NSStorage } from './storage';
import { LCObject } from '../object';
import { API_VERSION, KEY_CURRENT_USER, SDK_VERSION } from '../const';
import { APIError } from './errors';
import { assert, mapObject } from '../utils';
import { isCNApp, Router, Service } from './router';
import { AuthedUser, UserObject } from '../user';
import { isPlainObject, omit } from 'lodash';
import { ACL } from '../acl';
import { RoleObject } from '../role';
import { FileObject } from '../file';
import { FriendshipRequestObject } from '../friendship';
import { getDefaultApp, setDefaultApp } from './default-app';

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
export interface AppRequest extends Omit<HTTPRequest, 'baseURL'> {
  service?: Service;
  options?: AuthOptions;
}

type ObjectType = 'Object' | 'Pointer' | 'File' | 'Date';

interface DecodeObjectOptions {
  type?: ObjectType;
  className?: string;
  objectId?: string;
}

/**
 * Initialize the default App. If multiple App is needed, instantiate {@link App}.
 *
 * @since 5.0.0
 */
export function init(config: AppConfig): void {
  setDefaultApp(new App(config));
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
  currentUser: AuthedUser;

  /* eslint-disable */
  /** @internal */
  realtimeInstance: any;
  /* eslint-enable */

  private _router: Router;

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

  /**
   * Getter of the default App, throw an error if the default App is not {@link init initialized}.
   *
   * @since 5.0.0
   */
  static get default(): App {
    return getDefaultApp();
  }

  /**
   * @internal
   */
  async request(req: AppRequest): Promise<HTTPResponse> {
    let { appKey, useMasterKey } = this;
    if (req.options?.useMasterKey !== undefined) {
      useMasterKey = req.options.useMasterKey;
    }
    if (useMasterKey) {
      assert(this.masterKey, 'The masterKey is empty');
      appKey = this.masterKey + ',master';
    }

    const httpReq: HTTPRequest = {
      baseURL: this.serverURL || (await this._router.getServiceURL(req.service || 'api')),
      path: HTTP.assemblePath(API_VERSION, req.path || ''),
      header: {
        ...req.header,
        'Content-Type': 'application/json',
        'X-LC-UA': UserAgent.get(),
        'X-LC-Id': this.appId,
        'X-LC-Key': appKey,
      },
    };

    const sessionToken = req.options?.sessionToken || (await this.getSessionTokenAsync());
    if (sessionToken) {
      httpReq.header['X-LC-Session'] = sessionToken;
    }

    if (!this.production) {
      httpReq.header['X-LC-Prod'] = '0';
    }

    const res = await HTTP.request({ ...req, ...httpReq });
    if (res.status >= 400) {
      throw new APIError(res.body.code, res.body.error);
    }
    return res;
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
  getSessionToken(): string | undefined {
    if (this.currentUser) {
      return this.currentUser.sessionToken;
    }
    const encodedUser = this.storage.get(KEY_CURRENT_USER);
    if (encodedUser) {
      return JSON.parse(encodedUser).sessionToken;
    }
  }

  /**
   * Get the current user's `sessionToken` asynchronously.
   *
   * @since 5.0.0
   */
  async getSessionTokenAsync(): Promise<string | undefined> {
    if (this.currentUser) {
      return this.currentUser.sessionToken;
    }
    const encodedUser = this.storage.get(KEY_CURRENT_USER);
    if (encodedUser) {
      return JSON.parse(encodedUser).sessionToken;
    }
  }

  /**
   * @since 5.0.0
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  decode(data: any, options?: DecodeObjectOptions): any {
    if (!data) {
      return data;
    }

    const type = options?.type ?? (data.__type as ObjectType);

    if (type === 'Date' && typeof data.iso === 'string') {
      return new Date(data.iso);
    }

    if (type === 'Pointer' || type === 'Object') {
      const className = options?.className ?? (data.className as string);
      const objectId = options?.objectId ?? (data.objectId as string);
      assert(className, 'Decode failed: no className');
      assert(objectId, 'Decode failed: no objectId');

      let object: LCObject;
      switch (className) {
        case '_User':
          object = new UserObject(this, objectId);
          break;
        case '_Role':
          object = new RoleObject(this, objectId);
          break;
        case '_File':
          object = new FileObject(this, objectId);
          break;
        case '_FriendShipRequest':
          object = new FriendshipRequestObject(this, objectId);
          break;
        default:
          object = new LCObject(this, className, objectId);
      }

      object.data = this.decode(
        omit(data, ['__type', 'className', 'objectId', 'createdAt', 'updatedAt', 'ACL'])
      );

      if (data.createdAt) {
        object.createdAt = new Date(data.createdAt);
      }
      if (data.updatedAt) {
        object.updatedAt = new Date(data.updatedAt);
      }
      if (data.ACL) {
        object.data.ACL = ACL.fromJSON(data.ACL);
      }
      return object;
    }

    if (type === 'File') {
      return this.decode(data, { type: 'Pointer', className: '_File' });
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.decode(item));
    }

    if (isPlainObject(data)) {
      return mapObject(data, (value) => this.decode(value));
    }

    return data;
  }
}

/**
 * @inrernal
 */
class UserAgent {
  static prefix = 'LeanCloud-JS-SDK/' + SDK_VERSION;

  static get(): string {
    const suffix = this.getPlatformSuffix();
    if (suffix) {
      return this.prefix + ' ' + suffix;
    }
    return this.prefix;
  }

  static getPlatformSuffix(): string {
    if (AdapterManager.isSet) {
      const { platformInfo } = AdapterManager.get();
      if (platformInfo) {
        const { name, version } = platformInfo;
        if (name) {
          if (version) {
            return '(' + name + '/' + version + ')';
          }
          return '(' + name + ')';
        }
      }
    }
    return '';
  }
}

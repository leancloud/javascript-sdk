import { HTTP, HTTPRequest, RequestOptions } from '../http';
import { getAdapters } from '../adapters';
import { NSStorage } from './storage';
import { KEY_CURRENT_USER } from '../const';
import { APIError } from './errors';
import { isCNApp, Router, Service } from './router';
import { AuthedUser } from '../user';
import { version } from '../../package.json';

export interface AuthOptions extends RequestOptions {
  sessionToken?: string;
  useMasterKey?: boolean;
}

export interface AppRequest extends Omit<HTTPRequest, 'url'> {
  path: string;
  service?: Service;
  options?: AuthOptions;
}

export class App {
  appId: string;
  appKey: string;
  serverURL?: string;
  masterKey?: string;

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

  storage: NSStorage;
  currentUser: AuthedUser;
  realtimeInstance?: any;

  private _router: Router;

  constructor({
    appId,
    appKey,
    serverURL,
    masterKey,
    useMasterKey = false,
    production = true,
  }: {
    appId: string;
    appKey: string;
    serverURL?: string;
    masterKey?: string;
    useMasterKey?: boolean;
    production?: boolean;
  }) {
    if (!appId || !appKey) {
      throw new Error('The appId and appKey are required');
    }
    if (isCNApp(appId) && !serverURL) {
      throw new Error('The serverURL is required by CN app');
    }

    this.appId = appId;
    this.appKey = appKey;
    this.serverURL = serverURL;
    this.masterKey = masterKey;
    this.useMasterKey = useMasterKey;
    this.production = production;

    this.storage = new NSStorage(this.appId);
    if (!this.serverURL) {
      this._router = new Router(this);
    }
  }

  async request(req: AppRequest): Promise<any> {
    let key = this.appKey;
    if (req.options?.useMasterKey ?? this.useMasterKey) {
      if (!this.masterKey) {
        throw new Error('The masterKey is empty');
      }
      key = this.masterKey + ',master';
    }

    const url = this.serverURL || (await this._router.getServiceURL(req.service || 'api'));

    const sessionToken = req.options?.sessionToken || (await this.getSessionTokenAsync());

    let ua = 'LeanCloud-JS-SDK/' + version;
    const { platformInfo } = getAdapters();
    if (platformInfo) {
      const { name, version } = platformInfo;
      if (name) {
        if (version) {
          ua += ` (${name}/${version})`;
        } else {
          ua += ` (${name})`;
        }
      }
    }

    const { status, body } = await HTTP.request({
      method: req.method,
      url: HTTP.assemblePath(url, '1.1', req.path),
      header: {
        ...req.header,
        'Content-Type': 'application/json',
        'X-LC-UA': ua,
        'X-LC-Id': this.appId,
        'X-LC-Key': key,
        'X-LC-Session': sessionToken,
        'X-LC-Prod': this.production ? void 0 : '0',
      },
      query: req.query,
      body: req.body,
    });

    if (status >= 400) {
      const { code, error } = body;
      if (typeof code === 'number' && typeof error === 'string') {
        throw new APIError(code, error);
      }
      throw new Error(JSON.stringify(body));
    }

    return body;
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
   * Get the current user's `sessionToken`, returns `undefined` if no user is logged in the current App.
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
}

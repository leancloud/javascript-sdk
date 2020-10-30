import { KEY_SERVER_URLS } from '../const';
import { HTTP } from '../http';
import type { App } from './app';

export type Service = 'engine' | 'api' | 'push';

interface ServerURLs {
  stats_server: string;
  rtm_router_server: string;
  push_server: string;
  play_server: string;
  engine_server: string;
  api_server: string;
  ttl: number;
  expire_at: number;
}

export function isCNApp(app: string | App): boolean {
  const appId = typeof app === 'string' ? app : app.appId;
  return appId.slice(-9) !== '-MdYXbMMI';
}

export class Router {
  private _app: App;
  private _refreshing = false;
  private _urls?: ServerURLs;

  constructor(app: App) {
    this._app = app;
  }

  async getURLs(): Promise<ServerURLs> {
    if (!this._urls) {
      const urls = await this._app.storage.getAsync(KEY_SERVER_URLS);
      if (urls) {
        this._urls = JSON.parse(urls);
      } else {
        this._urls = this.getDefaultServerURLs();
      }
    }
    if (Date.now() >= this._urls!.expire_at) {
      // DO NOT await here
      this.refresh();
    }
    return this._urls!;
  }

  async getServiceURL(service: Service): Promise<string> {
    const urls = await this.getURLs();
    const schema = 'https://';
    switch (service) {
      case 'api':
        return schema + urls.api_server;
      case 'engine':
        return schema + urls.engine_server;
      default:
        throw new Error('Unknown service: ' + service);
    }
  }

  async refresh(): Promise<void> {
    if (this._refreshing) {
      return;
    }
    this._refreshing = true;

    try {
      const { body } = await HTTP.request({
        method: 'GET',
        baseURL: 'https://app-router.com/2/route',
        query: { appId: this._app.appId },
      });
      this._urls = body;
      this._urls!.expire_at = Date.now() + this._urls!.ttl * 1000;
      await this._app.storage.setAsync(KEY_SERVER_URLS, JSON.stringify(this._urls));
    } finally {
      this._refreshing = false;
    }
  }

  getDefaultServerURLs(): ServerURLs {
    const domain = isCNApp(this._app) ? 'lncld.net' : 'lncldglobal.com';
    const id = this._app.appId.slice(0, 8).toLowerCase();
    return {
      stats_server: `${id}.stats.${domain}`,
      rtm_router_server: `${id}.rtm.${domain}`,
      push_server: `${id}.push.${domain}`,
      play_server: `${id}.play.${domain}`,
      engine_server: `${id}.engine.${domain}`,
      api_server: `${id}.api.${domain}`,
      ttl: 0,
      expire_at: 0,
    };
  }
}

import {
  Adapters,
  HTTPMethod,
  RequestOptions as AdapterRequestOptions,
} from '@leancloud/adapter-types';
import { AdapterManager } from '../app/adapters';
import { Log } from '../log';

export type RequestOptions = Pick<AdapterRequestOptions, 'onprogress' | 'signal'>;

export interface HTTPRequest {
  baseURL: string;
  method?: HTTPMethod;
  path?: string;
  header?: Record<string, string>;
  query?: Record<string, string | number | boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  options?: RequestOptions;
}

export interface HTTPResponse {
  status: number;
  header?: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
}

export class HTTP {
  static encodeQuery(query: HTTPRequest['query']): string {
    let queryStr = '';
    Object.entries(query).forEach(([key, val], idx) => {
      if (val !== undefined) {
        if (idx) {
          queryStr += '&';
        }
        queryStr += key + '=' + encodeURIComponent(val);
      }
    });
    return queryStr;
  }

  static assemblePath(...paths: string[]): string {
    return paths.map((path) => (path.startsWith('/') ? path : '/' + path)).join('');
  }

  static async request(req: HTTPRequest): Promise<HTTPResponse> {
    const request = this._mustGetRequestAdapter();

    let url = req.baseURL;
    if (req.path) {
      url += req.path.startsWith('/') ? req.path : '/' + req.path;
    }
    if (req.query) {
      url += '?' + this.encodeQuery(req.query);
    }

    const logResponse = Log.request(req);
    const _res = await request(url, {
      ...req.options,
      method: req.method ?? 'GET',
      headers: req.header,
      data: req.body,
    });
    const res: HTTPResponse = {
      status: _res.status,
      header: _res.headers as Record<string, string>,
      body: _res.data,
    };
    logResponse(res);
    return res;
  }

  private static _mustGetRequestAdapter(): Adapters['request'] {
    const adapters = AdapterManager.get();
    if (!adapters['request']) {
      throw new Error('The request adapter is not set');
    }
    return adapters['request'];
  }
}

import {
  FormDataPart,
  HTTPMethod,
  RequestOptions as AdapterRequestOptions,
  Response as AdapterResponse,
} from '@leancloud/adapter-types';
import { AdapterManager } from '../adapters';
import { debug } from '../debug';

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

export interface UploadRequest extends Omit<HTTPRequest, 'body'> {
  file: FormDataPart;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: Record<string, any>;
}

export class HTTP {
  private static _nextId = 1;

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

  static encodeURL(req: HTTPRequest): string {
    let url = req.baseURL;
    if (req.path) {
      url += req.path.startsWith('/') ? req.path : '/' + req.path;
    }
    if (req.query) {
      url += '?' + this.encodeQuery(req.query);
    }
    return url;
  }

  static assemblePath(...paths: string[]): string {
    return paths.map((path) => (path.startsWith('/') ? path : '/' + path)).join('');
  }

  static async request(req: HTTPRequest): Promise<HTTPResponse> {
    const { request } = AdapterManager.get();
    if (!request) {
      throw new Error('The request adapter is not set');
    }

    const id = this._nextId++;
    debug.log('Request:send', '%d: %O', id, req);
    const res = this._convertResponse(
      await request(this.encodeURL(req), {
        ...req.options,
        method: req.method ?? 'GET',
        headers: req.header,
        data: req.body,
      })
    );
    debug.log('Request:recv', '%d: %O', id, res);
    return res;
  }

  static async upload(req: UploadRequest): Promise<HTTPResponse> {
    const { upload } = AdapterManager.get();
    if (!upload) {
      throw new Error('The upload adapter is not set');
    }

    const id = this._nextId++;
    debug.log('Upload:send', '%d: %O', id, req);
    const res = this._convertResponse(
      await upload(this.encodeURL(req), req.file, {
        ...req.options,
        method: req.method || 'POST',
        headers: req.header,
        data: req.form,
      })
    );
    debug.log('Upload:recv', '%d: %O', id, res);
    return res;
  }

  private static _convertResponse(res: AdapterResponse): HTTPResponse {
    return {
      status: res.status,
      header: res.headers as Record<string, string>,
      body: res.data,
    };
  }
}

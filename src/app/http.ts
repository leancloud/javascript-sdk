import {
  HTTPMethod,
  FormDataPart,
  RequestOptions as AdapterRequestOptions,
  Response as AdapterHTTPResponse,
} from '@leancloud/adapter-types';
import { AdapterManager } from './adapters';
import { Logger } from './log';

export type RequestOptions = Pick<AdapterRequestOptions, 'onprogress' | 'signal'>;

export interface HTTPRequest {
  baseURL?: string;
  path?: string;
  method?: HTTPMethod;
  header?: Record<string, string>;
  query?: Record<string, string | number | boolean>;
  body?: unknown;
  options?: RequestOptions;
}

export interface UploadRequest extends Omit<HTTPRequest, 'body'> {
  form?: Record<string, unknown>;
}

export interface HTTPResponse {
  status: number;
  header?: Record<string, string | string[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
}

let requestID = 0;
export async function request(req: HTTPRequest): Promise<HTTPResponse> {
  const { request } = AdapterManager.get();
  const url = parseURL(req);
  const id = ++requestID;
  Logger.log('LC:Request:send', '%d: %O', id, req);
  const res = parseResponse(
    await request(url, {
      ...req.options,
      method: req.method || 'GET',
      headers: req.header,
      // XXX: 这里是 adapter-types 的定义过于严格, SDK 稍微放宽
      data: req.body as Record<string, string>,
    })
  );
  Logger.log('LC:Request:recv', '%d: %O', id, res);
  return res;
}

export async function upload(req: UploadRequest, file: FormDataPart): Promise<HTTPResponse> {
  const { upload } = AdapterManager.get();
  const url = parseURL(req);
  Logger.log('LC:Upload:send', '%O', req);
  const res = parseResponse(
    await upload(url, file, {
      ...req.options,
      method: req.method || 'POST',
      headers: req.header,
      // XXX: 这里是 adapter-types 的定义过于严格, SDK 稍微放宽
      data: req.form as Record<string, string>,
    })
  );
  Logger.log('LC:Upload:recv', '%O', res);
  return res;
}

function parseQuery(query: HTTPRequest['query']): string {
  let str = '';
  if (query) {
    Object.entries(query).forEach(([key, val], idx) => {
      if (val !== undefined) {
        if (idx) str += '&';
        str += key + '=' + encodeURIComponent(val);
      }
    });
  }
  return str;
}

function parseURL(req: HTTPRequest): string {
  if (!req.baseURL) {
    throw new Error('Cannot send request: the baseURL is empty');
  }

  let url = req.baseURL;
  if (req.path) {
    if (req.path[0] === '/') {
      url += req.path;
    } else {
      url += '/' + req.path;
    }
  }

  const query = parseQuery(req.query);
  if (query) {
    url += '?' + query;
  }
  return url;
}

function parseResponse(res: AdapterHTTPResponse): HTTPResponse {
  return {
    status: res.status,
    header: res.headers as Record<string, string>,
    body: res.data,
  };
}

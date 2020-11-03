import {
  FormDataPart,
  HTTPMethod,
  RequestOptions as AdapterRequestOptions,
  Response as AdapterResponse,
} from '@leancloud/adapter-types';
import { trim } from 'lodash';
import { getAdapters } from './adapters';
import { debug as d } from 'debug';

const debug_http = d('LC:http');
const debug_upload = d('LC:upload');

export type RequestOptions = Pick<AdapterRequestOptions, 'onprogress' | 'signal'>;

export interface HTTPRequest {
  method: HTTPMethod;
  url: string;
  header?: Record<string, string>;
  query?: Record<string, string | number | boolean>;
  body?: any;
  options?: RequestOptions;
}

export interface HTTPResponse {
  status: number;
  header?: Record<string, string>;
  body?: any;
}

export interface UploadRequest extends Omit<HTTPRequest, 'body'> {
  file: FormDataPart;
  form?: Record<string, any>;
}

export class HTTP {
  private static _nextId = 1;

  static encodeQuery(query: Record<string, string | number | boolean | undefined>): string {
    let queryStr = '';
    Object.entries(query).forEach(([key, val], idx) => {
      if (val === undefined) {
        delete query[key];
        return;
      }
      if (idx) {
        queryStr += '&';
      }
      queryStr += key + '=' + encodeURIComponent(val);
    });
    return queryStr;
  }

  static assemblePath(...paths: string[]): string {
    let pathStr = '';
    paths.forEach((path, index) => {
      if (index) {
        pathStr += '/' + trim(path, '/');
      } else {
        pathStr += trim(path, '/');
      }
    });
    return pathStr;
  }

  static async request(req: HTTPRequest): Promise<HTTPResponse> {
    const { request } = getAdapters();
    if (!request) {
      throw new Error('The request adapter is not set');
    }

    let url = req.url;
    if (req.query) {
      url += '?' + this.encodeQuery(req.query);
    }

    if (req.header) {
      Object.entries(req.header).forEach(([key, value]) => {
        if (value === undefined) {
          delete req.header[key];
        }
      });
    }

    const id = this._nextId++;
    debug_http('send(↑) %d: %O', id, req);

    const res = this._convertResponse(
      await request(url, {
        ...req.options,
        method: req.method ?? 'GET',
        headers: req.header,
        data: req.body,
      })
    );

    debug_http('recv(↓) %d: %O', id, res);
    return res;
  }

  static async upload(req: UploadRequest): Promise<HTTPResponse> {
    const { upload } = getAdapters();
    if (!upload) {
      throw new Error('The upload adapter is not set');
    }

    let url = req.url;
    if (req.query) {
      url += '?' + this.encodeQuery(req.query);
    }

    if (req.header) {
      Object.entries(req.header).forEach(([key, value]) => {
        if (value === undefined) {
          delete req.header[key];
        }
      });
    }

    const id = this._nextId++;
    debug_upload('send(↑) %d: %O', id, req);

    const res = this._convertResponse(
      await upload(url, req.file, {
        ...req.options,
        method: req.method || 'POST',
        headers: req.header,
        data: req.form,
      })
    );

    debug_upload('recv(↓) %d: %O', id, res);
    return res;
  }

  private static _convertResponse(res: AdapterResponse): HTTPResponse {
    return {
      status: res.status ?? 200,
      header: res.headers as Record<string, string>,
      body: res.data,
    };
  }
}

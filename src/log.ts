import type { HTTPRequest, HTTPResponse } from './http';
import { debug } from './debug';

export class Log {
  private static _nextRequestId = 1;

  static request(req: HTTPRequest): (res: HTTPResponse) => void {
    const id = this._nextRequestId++;
    debug.onRequestSend?.(id, req);
    return (res) => debug.onRequestRecv(id, res);
  }

  static localStorageSet(key: string, value: string): void {
    debug.onLocalStorageSet?.(key, value);
  }

  static localStorageGet(key: string, value: string): void {
    debug.onLocalStorageGet?.(key, value);
  }

  static localStorageDelete(key: string): void {
    debug.onLocalStorageDelete?.(key);
  }
}

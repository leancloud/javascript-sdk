import _debug from 'debug';
import { HTTPRequest, HTTPResponse } from './http';

_debug.enable('LC:*');
const debugRequestSend = _debug('LC:Request:send');
const debugRequestRecv = _debug('LC:Request:recv');
const debugLocalStorageSet = _debug('LC:LocalStorage:set');
const debugLocalStorageGet = _debug('LC:LocalStorage:get');
const debugLocalStorageDelete = _debug('LC:LocalStorage:delete');

export const debug = {
  onRequestSend(id: number, req: HTTPRequest): void {
    debugRequestSend('%d: %O', id, req);
  },

  onRequestRecv(id: number, res: HTTPResponse): void {
    debugRequestRecv('%d: %O', id, res);
  },

  onLocalStorageSet(key: string, value: string): void {
    debugLocalStorageSet('%o', { key, value });
  },

  onLocalStorageGet(key: string, value: string): void {
    debugLocalStorageGet('%o', { key, value });
  },

  onLocalStorageDelete(key: string): void {
    debugLocalStorageDelete(key);
  },
};

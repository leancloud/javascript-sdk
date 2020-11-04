import { Storage as AdapterStorage, SyncStorage } from '@leancloud/adapter-types';
import { LOCAL_STORAGE_NAMESPACE } from '../const';
import { getAdapters } from '../adapters';
import { debug as d } from 'debug';

const debug = d('LC:localStorage');

function mustGetStorage(): AdapterStorage {
  const { storage } = getAdapters();
  if (!storage) {
    throw new Error('The storage adapter is not set');
  }
  return storage;
}

function mustGetSyncStorage(): SyncStorage {
  const storage = mustGetStorage();
  if (storage.async) {
    throw new Error('Current platform provides an async storage, please use async method instead');
  }
  return storage as SyncStorage;
}

export class LocalStorage {
  static keyWithNamespace(key: string): string {
    return LOCAL_STORAGE_NAMESPACE + ':' + key;
  }

  static set(key: string, value: string): void {
    key = this.keyWithNamespace(key);
    mustGetSyncStorage().setItem(key, value);
    debug('set', { key, value });
  }

  static get(key: string): string | null {
    key = this.keyWithNamespace(key);
    const value = mustGetSyncStorage().getItem(key) ?? null;
    debug('get', { key, value });
    return value;
  }

  static delete(key: string): void {
    key = this.keyWithNamespace(key);
    mustGetSyncStorage().removeItem(key);
    debug('delete', key);
  }

  static async setAsync(key: string, value: string): Promise<void> {
    key = this.keyWithNamespace(key);
    await mustGetStorage().setItem(key, value);
    debug('set', { key, value });
  }

  static async getAsync(key: string): Promise<string | null> {
    key = this.keyWithNamespace(key);
    const value = (await mustGetStorage().getItem(key)) ?? null;
    debug('get', { key, value });
    return value;
  }

  static async deleteAsync(key: string): Promise<void> {
    key = this.keyWithNamespace(key);
    await mustGetStorage().removeItem(key);
    debug('delete', key);
  }
}

export class NSStorage {
  constructor(private _namespace: string) {}

  keyWithNamespace(key: string): string {
    return this._namespace + ':' + key;
  }

  set(key: string, value: string): void {
    LocalStorage.set(this.keyWithNamespace(key), value);
  }

  get(key: string): string | null {
    return LocalStorage.get(this.keyWithNamespace(key));
  }

  delete(key: string): void {
    LocalStorage.delete(this.keyWithNamespace(key));
  }

  setAsync(key: string, value: string): Promise<void> {
    return LocalStorage.setAsync(this.keyWithNamespace(key), value);
  }

  getAsync(key: string): Promise<string | null> {
    return LocalStorage.getAsync(this.keyWithNamespace(key));
  }

  deleteAsync(key: string): Promise<void> {
    return LocalStorage.deleteAsync(this.keyWithNamespace(key));
  }
}

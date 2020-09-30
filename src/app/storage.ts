import { Storage as AdapterStorage, SyncStorage } from '@leancloud/adapter-types';
import { Logger } from './log';
import { LOCAL_STORAGE_NAMESPACE } from '../const';
import { AdapterManager } from './adapters';

function assertIsSyncStorage(storage: AdapterStorage): asserts storage is SyncStorage {
  if (storage.async) {
    throw new TypeError('The adapters provides an async storage, please use async method instead');
  }
}

export class LocalStorage {
  static keyWithNamespace(key: string): string {
    return LOCAL_STORAGE_NAMESPACE + ':' + key;
  }

  static set(key: string, value: string): void {
    const { storage } = AdapterManager.get();
    assertIsSyncStorage(storage);
    key = this.keyWithNamespace(key);
    storage.setItem(key, value);
    Logger.log('LC:LocalStorage:set', key, value);
  }

  static get(key: string): string {
    const { storage } = AdapterManager.get();
    assertIsSyncStorage(storage);
    key = this.keyWithNamespace(key);
    const value = storage.getItem(key) ?? null;
    Logger.log('LC:LocalStorage:get', key, value);
    return value;
  }

  static delete(key: string): void {
    const { storage } = AdapterManager.get();
    assertIsSyncStorage(storage);
    key = this.keyWithNamespace(key);
    storage.removeItem(key);
    Logger.log('LC:LocalStorage:delete', key);
  }

  static async setAsync(key: string, value: string): Promise<void> {
    const { storage } = AdapterManager.get();
    key = this.keyWithNamespace(key);
    await storage.setItem(key, value);
    Logger.log('LC:LocalStorage:set', key, value);
  }

  static async getAsync(key: string): Promise<string> {
    const { storage } = AdapterManager.get();
    key = this.keyWithNamespace(key);
    const value = (await storage.getItem(key)) ?? null;
    Logger.log('LC:LocalStorage:get', key, value);
    return value;
  }

  static async deleteAsync(key: string): Promise<void> {
    const { storage } = AdapterManager.get();
    key = this.keyWithNamespace(key);
    await storage.removeItem(key);
    Logger.log('LC:LocalStorage:delete', key);
  }
}

export class NSStorage {
  constructor(private _ns: string) {}

  keyWithNamespace(key: string): string {
    return this._ns + ':' + key;
  }

  set(key: string, value: string): void {
    LocalStorage.set(this.keyWithNamespace(key), value);
  }

  get(key: string): string {
    return LocalStorage.get(this.keyWithNamespace(key));
  }

  delete(key: string): void {
    LocalStorage.delete(this.keyWithNamespace(key));
  }

  setAsync(key: string, value: string): Promise<void> {
    return LocalStorage.setAsync(this.keyWithNamespace(key), value);
  }

  getAsync(key: string): Promise<string> {
    return LocalStorage.getAsync(this.keyWithNamespace(key));
  }

  deleteAsync(key: string): Promise<void> {
    return LocalStorage.deleteAsync(this.keyWithNamespace(key));
  }
}

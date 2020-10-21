import { Storage as AdapterStorage, SyncStorage } from '@leancloud/adapter-types';
import { LOCAL_STORAGE_NAMESPACE } from '../const';
import { AdapterManager } from '../adapters';
import { debug } from '../debug';

export class LocalStorage {
  static keyWithNamespace(key: string): string {
    return LOCAL_STORAGE_NAMESPACE + ':' + key;
  }

  static set(key: string, value: string): void {
    key = this.keyWithNamespace(key);
    this._mustGetSyncStorage().setItem(key, value);
    debug.log('LocalStorage:set', { key, value });
  }

  static get(key: string): string {
    key = this.keyWithNamespace(key);
    const value = this._mustGetSyncStorage().getItem(key) ?? null;
    debug.log('LocalStorage:get', { key, value });
    return value;
  }

  static delete(key: string): void {
    key = this.keyWithNamespace(key);
    this._mustGetSyncStorage().removeItem(key);
    debug.log('LocalStorage:delete', key);
  }

  static async setAsync(key: string, value: string): Promise<void> {
    key = this.keyWithNamespace(key);
    await this._mustGetStorage().setItem(key, value);
    debug.log('LocalStorage:set', { key, value });
  }

  static async getAsync(key: string): Promise<string> {
    key = this.keyWithNamespace(key);
    const value = (await this._mustGetStorage().getItem(key)) ?? null;
    debug.log('LocalStorage:get', { key, value });
    return value;
  }

  static async deleteAsync(key: string): Promise<void> {
    key = this.keyWithNamespace(key);
    await this._mustGetStorage().removeItem(key);
    debug.log('LocalStorage:delete', key);
  }

  private static _mustGetStorage(): AdapterStorage {
    const { storage } = AdapterManager.get();
    if (!storage) {
      throw new Error('The storage adapter is not set');
    }
    return storage;
  }

  private static _mustGetSyncStorage(): SyncStorage {
    const storage = this._mustGetStorage();
    if (storage.async) {
      throw new Error('The adapters provides an async storage, please use async method instead');
    }
    return storage as SyncStorage;
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

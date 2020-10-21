import { Adapters } from '@leancloud/adapter-types';

/**
 * @internal
 */
export class AdapterManager {
  private static _adapters: Partial<Adapters>;
  private static _requestPromise: Promise<Partial<Adapters>>;
  private static _requestRecevier: (adapters: Partial<Adapters>) => void;

  static get isSet(): boolean {
    return Boolean(this._adapters);
  }

  static set(adapters: Partial<Adapters>): void {
    if (this._adapters) {
      throw new Error('Adapters already set');
    }
    this._adapters = adapters;
    this._requestRecevier?.(this._adapters);
  }

  static get(): Partial<Adapters> {
    if (!this._adapters) {
      throw new Error('Adapters not set');
    }
    return this._adapters;
  }

  static request(): Promise<Partial<Adapters>> {
    if (this._adapters) {
      return Promise.resolve(this._adapters);
    }
    if (!this._requestPromise) {
      this._requestPromise = new Promise((resolve) => {
        this._requestRecevier = resolve;
      });
    }
    return this._requestPromise;
  }
}

export function setAdapters(adapters: Partial<Adapters>): void {
  AdapterManager.set(adapters);
}

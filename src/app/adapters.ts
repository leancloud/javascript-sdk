import { Adapters } from '@leancloud/adapter-types';

export class AdapterManager {
  private static _adapters: Partial<Adapters>;
  private static _onSet: ((adapters?: Partial<Adapters>) => void)[] = [];

  static get isSet(): boolean {
    return this._adapters ? true : false;
  }

  static set(adapters: Partial<Adapters>): void {
    if (this._adapters) {
      console.warn('Adapters already set');
    }
    this._adapters = adapters;
    this._onSet.forEach((h) => h(adapters));
  }

  static get(): Partial<Adapters> {
    if (!this._adapters) {
      throw new Error('Adapters not set');
    }
    return this._adapters;
  }

  static on(event: 'set', listener: (adapters?: Partial<Adapters>) => void): void {
    switch (event) {
      case 'set':
        this._onSet.push(listener);
        break;
    }
  }
}

export function setAdapters(adapters: Partial<Adapters>): void {
  AdapterManager.set(adapters);
}

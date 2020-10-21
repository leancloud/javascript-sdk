import d from 'debug';

interface OnEnableListener {
  (filter: string): void;
}

interface OnDisableListener {
  (): void;
}

interface Callable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...args: any[]): void;
}

export class debug {
  private static _enabled = false;
  private static _filter: string;
  private static _loggers: Record<string, Callable> = {};
  private static _onEnable: OnEnableListener[] = [];
  private static _onDisable: OnDisableListener[] = [];

  static get enabled(): boolean {
    return this._enabled;
  }

  static get filter(): string {
    return this._filter;
  }

  static enable(filter: string): void {
    d.enable(filter);
    this._filter = filter;
    this._enabled = true;
    this._onEnable.forEach((h) => h(filter));
  }

  static disable(): void {
    d.disable();
    this._enabled = false;
    this._onDisable.forEach((h) => h());
  }

  static log(tag: string, ...args: unknown[]): void {
    if (!this._loggers[tag]) {
      this._loggers[tag] = d('LC:' + tag);
    }
    this._loggers[tag](...args);
  }

  static on(event: 'enable', listener: OnEnableListener): void;
  static on(event: 'disable', listener: OnDisableListener): void;
  static on(event: string, listener: Callable): void {
    switch (event) {
      case 'enable':
        this._onEnable.push(listener);
        break;
      case 'disable':
        this._onDisable.push(listener);
        break;
    }
  }
}

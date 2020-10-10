import debug from 'debug';

/**
 * @alias debug
 */
export class Logger {
  private static _enabled = false;
  private static _filter: string;
  private static _logger: Record<string, (...args: unknown[]) => void> = {};
  private static _onEnable: ((filter?: string) => void)[] = [];
  private static _onDisable: (() => void)[] = [];

  static get enabled(): boolean {
    return this._enabled;
  }

  static get filter(): string {
    return this._filter;
  }

  static enable(filter: string): void {
    debug.enable(filter);
    this._filter = filter;
    this._enabled = true;
    this._onEnable.forEach((h) => h(filter));
  }

  static disable(): void {
    debug.disable();
    this._enabled = false;
    this._onDisable.forEach((h) => h());
  }

  static log(tag: string, ...args: unknown[]): void {
    if (!this._logger[tag]) {
      this._logger[tag] = debug(tag);
    }
    this._logger[tag](...args);
  }

  static on(event: 'enable' | 'disable', listener: (filter?: string) => void): void {
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

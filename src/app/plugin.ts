import { Adapters } from '@leancloud/adapter-types';
import { AdapterManager } from './adapters';
import { debug } from '../debug';

/**
 * @internal
 */
export interface Plugin {
  install(pluginManager: typeof PluginManager): void;
}

export function use(plugin: Plugin): void {
  plugin.install(PluginManager);
}

/**
 * @internal
 */
export class PluginManager {
  static plugins: Record<string, Plugin> = {};

  static register(id: string, plugin: Plugin): void {
    debug.log('LC:Plugin:register', id);
    this.plugins[id] = plugin;
  }

  static debug = debug;

  static requestAdapters(): Promise<Partial<Adapters>> {
    return AdapterManager.request();
  }
}

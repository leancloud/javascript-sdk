import type { App } from './app';

let defaultApp: App = null;

export function setDefaultApp(app: App): void {
  if (defaultApp) {
    console.warn('The default app is already initialized, skip.');
    return;
  }
  defaultApp = app;
}

export function getDefaultApp(): App {
  return defaultApp;
}

export function mustGetDefaultApp(): App {
  if (!defaultApp) {
    throw new Error('The default app is not initialized');
  }
  return getDefaultApp();
}

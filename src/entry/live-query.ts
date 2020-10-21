import { LiveQuery } from '../live-query';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getGlobalContext(): any {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  } else if (typeof global !== 'undefined') {
    return global;
  } else if (typeof window !== 'undefined') {
    return window;
  }
}

// Auto load
getGlobalContext()?.LC?.use(LiveQuery);

export * from '../live-query';

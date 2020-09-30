import { LiveQuery } from '../live-query/live-query';

function getGlobal(): unknown {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  }
  if (typeof global !== 'undefined') {
    return global;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
}

// Auto load
const root = getGlobal();
if (root && root['LC']) {
  root['LC'].use(LiveQuery);
}

export * from '../live-query/live-query';

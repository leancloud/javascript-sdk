import { transform } from 'lodash';

export function deleteObjectKey(obj: unknown, key: string | string[]): void {
  if (!obj) return;
  if (Array.isArray(key)) {
    key.forEach((k) => deleteObjectKey(obj, k));
    return;
  }
  if (key.includes('.')) {
    const keys = key.split('.');
    deleteObjectKey(obj[keys[0]], keys.slice(1).join('.'));
  } else {
    delete obj[key];
  }
}

export function mapObject(
  object: Record<string, unknown>,
  iteratee: (value?: unknown, key?: string) => unknown
): Record<string, unknown> {
  return transform(object, (result, value, key) => {
    if (typeof key === 'string') {
      result[key] = iteratee(value, key);
    }
  });
}

export function assert(cond: unknown, msg?: string): asserts cond {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

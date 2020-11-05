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

export function assert(cond: unknown, msg?: string): asserts cond {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

export function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

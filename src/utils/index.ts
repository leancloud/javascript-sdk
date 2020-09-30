export function checkObjectTag(obj: unknown, name: string): boolean {
  return Object.prototype.toString.call(obj) === '[object ' + name + ']';
}

export function isDate(obj: unknown): obj is Date {
  return checkObjectTag(obj, 'Date');
}

export function isRegExp(obj: unknown): obj is RegExp {
  return checkObjectTag(obj, 'RegExp');
}

export function isObject(obj: unknown): obj is Record<string, unknown> {
  return checkObjectTag(obj, 'Object');
}

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
  obj: Record<string, unknown>,
  fn: (value?: unknown, key?: string) => unknown
): Record<string, unknown> {
  const map: Record<string, unknown> = {};
  Object.entries(obj).forEach(([key, value]) => (map[key] = fn(value, key)));
  return map;
}

export function isEmptyObject(obj: unknown): boolean {
  return !obj || Object.keys(obj).length === 0;
}

export function assert(cond: unknown, msg?: string): asserts cond {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

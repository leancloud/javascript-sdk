import { Adapters } from '@leancloud/adapter-types';

let _adapters: Partial<Adapters>;

const onSetListeners: Array<(adapters: Partial<Adapters>) => void> = [];

export function setAdapters(adapters: Partial<Adapters>): void {
  _adapters = { ..._adapters, ...adapters };
  onSetListeners.forEach((listener) => listener(_adapters));
}

export function getAdapters(): Partial<Adapters> {
  return _adapters;
}

export function onAdaptersSet(listener: (adapters: Partial<Adapters>) => void): void {
  onSetListeners.push(listener);
}

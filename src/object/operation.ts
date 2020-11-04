import { pointer } from './pointer';
import { ensureArray } from '../utils';

export function unset(): any {
  return { __op: 'Delete' };
}

export function increment(amount = 1): any {
  return { __op: 'Increment', amount };
}

export function decrement(amount = 1): any {
  return { __op: 'Decrement', amount };
}

export function add(objects: any | any[]): any {
  return { __op: 'Add', objects: ensureArray(objects) };
}

export function addUnique(objects: any | any[]): any {
  return { __op: 'AddUnique', objects: ensureArray(objects) };
}

export function remove(objects: any | any[]): any {
  return { __op: 'Remove', objects: ensureArray(objects) };
}

export function bitAnd(value: number): any {
  return { __op: 'BitAnd', value };
}

export function bitOr(value: number): any {
  return { __op: 'BitOr', value };
}

export function bitXor(value: number): any {
  return { __op: 'BitXor', value };
}

export function addRelation(
  objects:
    | {
        className: string;
        objectId: string;
      }
    | {
        className: string;
        objectId: string;
      }[]
): any {
  return {
    __op: 'AddRelation',
    objects: ensureArray(objects).map((object) => pointer(object)),
  };
}

export function removeRelation(
  objects:
    | {
        className: string;
        objectId: string;
      }
    | {
        className: string;
        objectId: string;
      }[]
): any {
  return {
    __op: 'RemoveRelation',
    objects: ensureArray(objects).map((object) => pointer(object)),
  };
}

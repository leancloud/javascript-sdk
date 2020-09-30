import type { LCObject, LCObjectRef } from './object';

export class Operation {
  static unset(): unknown {
    return { __op: 'Delete' };
  }

  static increment(amount = 1): unknown {
    return { __op: 'Increment', amount };
  }

  static decrement(amount = 1): unknown {
    return { __op: 'Decrement', amount };
  }

  static add(objects: unknown | unknown[]): unknown {
    if (!Array.isArray(objects)) {
      objects = [objects];
    }
    return { __op: 'Add', objects };
  }

  static addUnique(objects: unknown | unknown[]): unknown {
    if (!Array.isArray(objects)) {
      objects = [objects];
    }
    return { __op: 'AddUnique', objects };
  }

  static remove(objects: unknown | unknown[]): unknown {
    if (!Array.isArray(objects)) {
      objects = [objects];
    }
    return { __op: 'Remove', objects };
  }

  static bitAnd(value: number): unknown {
    return { __op: 'BitAnd', value };
  }

  static bitOr(value: number): unknown {
    return { __op: 'BitOr', value };
  }

  static bitXor(value: number): unknown {
    return { __op: 'BitXor', value };
  }

  static addRelation(objects: LCObject | LCObjectRef | Array<LCObject | LCObjectRef>): unknown {
    if (!Array.isArray(objects)) {
      objects = [objects];
    }
    return { __op: 'AddRelation', objects: objects.map((o) => o.toPointer()) };
  }

  static removeRelation(objects: LCObject | LCObjectRef | Array<LCObject | LCObjectRef>): unknown {
    const op = Operation.addRelation(objects);
    op['__op'] = 'RemoveRelation';
    return op;
  }
}

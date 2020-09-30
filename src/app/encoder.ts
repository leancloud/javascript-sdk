/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

// XXX: 这是为 Tree Shaking 友好而极端设计的 Encoder, 还未投入使用(也还未设计完成).

import { isDate, isObject, mapObject } from '../utils';
import type { App } from './app';

interface ObjectCreator {
  (app: App, objectId: string): any;
}

interface ACLPrivilege {
  read?: boolean;
  write?: boolean;
}

export class Encoder {
  static objectCreator = new Map<string, ObjectCreator>();
  static aclCreator: (data: Record<string, ACLPrivilege>) => any;

  static createObject(app: App, className: string, objectId: string): any {
    const creator = this.objectCreator.get(className) || this.objectCreator.get('*');
    if (!creator) {
      throw new Error('No creator for class ' + className);
    }
    return creator(app, objectId);
  }

  static encode(data: any, full?: boolean): any {
    if (!data) return data;

    const { constructor } = Object.getPrototypeOf(data);
    if (constructor) {
      if (typeof constructor.lcEncodeFunc === 'function') {
        return constructor.lcEncodeFunc(data);
      }

      if (typeof constructor.lcType === 'string') {
        switch (constructor.lcType) {
          case 'Pointer':
            return this.encodePointer(data);
          case 'Object':
            return this.encodeObject(data, full);
        }
      }
    }

    if (isDate(data)) {
      return this.encodeDate(data);
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.encode(item));
    }

    if (isObject(data)) {
      return mapObject(data, (value) => this.encode(value));
    }

    return data;
  }

  static encodePointer(obj: any): any {
    ['className', 'objectId'].forEach((key) => {
      if (!obj[key]) {
        throw new Error(`Encode error: no ${key} provided`);
      }
    });
    return { __type: 'Pointer', className: obj.className, objectId: obj.objectId };
  }

  static encodeObject(obj: any, full?: boolean): any {
    const encoded = this.encodePointer(obj);
    if (full) {
      encoded.__type = 'Object';
      encoded.data = this.encode(obj.data);

      if (obj.createdAt) {
        encoded.createdAt = obj.createdAt.toISOString();
      }
      if (obj.updatedAt) {
        encoded.updatedAt = obj.updatedAt.toISOString();
      }
    }
    return encoded;
  }

  static encodeDate(date: Date): any {
    return { __type: 'Date', iso: date.toISOString() };
  }

  static decode(app: App, data: any): any {
    if (!data) return data;

    switch (data.__type) {
      case 'Pointer':
      case 'Object':
        return this.decodeObject(app, data);
      case 'Date':
        return new Date(data.iso);
      case 'File':
        return this.decodeObject(app, data, '_File');
    }
  }

  static decodeObject(app: App, data: any, className?: string): any {
    if (className) {
      data.className = className;
    }
    ['className', 'objectId'].forEach((key) => {
      if (!data[key]) {
        throw new Error(`Decode error: no ${key} provided`);
      }
    });

    const obj = this.createObject(app, data.className, data.objectId);
    obj.data = this.decode(app, data);
  }

  static decodeObjectData(app: App, data: any): any {
    const decoded: Record<string, any> = { ...data };
    ['__type', 'className', 'objectId', 'ACL'].forEach((key) => {
      delete decoded[key];
    });
  }
}

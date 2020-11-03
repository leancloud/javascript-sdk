import { isPlainObject, isEmpty, isDate, merge, omit } from 'lodash';
import type { Query } from './query';
import type { AuthOptions, App } from './app';
import { mapObject } from './utils';
import { ACL } from './acl';

export interface LCObjectData extends Record<string, any> {
  ACL?: ACL;
}

export interface AddObjectOptions extends AuthOptions {
  fetch?: boolean;
}

export interface GetObjectOptions extends AuthOptions {
  keys?: string[];
  include?: string[];
  returnACL?: boolean;
}

export interface UpdateObjectOptions extends AddObjectOptions {
  query?: Query;
}

export interface Pointer {
  __type: 'Pointer';
  className: string;
  objectId: string;
}

export function pointer({ className, objectId }: { className: string; objectId: string }): Pointer {
  return { __type: 'Pointer', className, objectId };
}
export class LCObjectRef {
  constructor(
    public readonly app: App,
    public readonly className: string,
    public readonly objectId: string
  ) {}

  get apiPath(): string {
    return `/classes/${this.className}/${this.objectId}`;
  }

  toPointer(): Pointer {
    return pointer(this);
  }

  async get(options?: GetObjectOptions): Promise<LCObject> {
    const json = await this.app.request({
      method: 'GET',
      path: this.apiPath,
      query: {
        keys: options?.keys?.join(','),
        include: options?.include?.join(','),
        returnACL: options?.returnACL,
      },
      options,
    });
    if (isEmpty(json)) {
      throw new Error(`The Object(id=${this.objectId}) is not exists`);
    }
    return LCObject.fromJSON(this.app, json, this.className);
  }

  async update(data: LCObjectData, options?: UpdateObjectOptions): Promise<LCObject> {
    const json = await this.app.request({
      method: 'PUT',
      path: this.apiPath,
      body: LCEncode(omitReservedKeys(data)),
      query: {
        fetchWhenSave: options?.fetch,
        where: options?.query?.toString(),
      },
      options,
    });
    return LCObject.fromJSON(this.app, json, this.className);
  }

  async delete(options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'DELETE',
      path: this.apiPath,
      options,
    });
  }
}

export class LCObject implements LCObjectRef {
  data: Record<string, any>;

  constructor(
    public readonly app: App,
    public readonly className: string,
    public readonly objectId: string
  ) {}

  static fromJSON(app: App, data: Record<string, any>, className?: string): LCObject {
    const object = new LCObject(app, className ?? data.className, data.objectId);
    object.data = LCDecode(app, data);
    return object;
  }

  get apiPath(): string {
    return `/classes/${this.className}/${this.objectId}`;
  }

  get id(): string {
    return this.objectId;
  }

  toPointer(): Pointer {
    return pointer(this);
  }

  async get(options?: GetObjectOptions): Promise<LCObject> {
    const json = await this.app.request({
      method: 'GET',
      path: this.apiPath,
      query: {
        keys: options?.keys?.join(','),
        include: options?.include?.join(','),
        returnACL: options?.returnACL,
      },
      options,
    });
    if (isEmpty(json)) {
      throw new Error(`The Object(id=${this.objectId}) is not exists`);
    }
    return LCObject.fromJSON(this.app, json, this.className);
  }

  async update(data: LCObjectData, options?: UpdateObjectOptions): Promise<LCObject> {
    const json = await this.app.request({
      method: 'PUT',
      path: this.apiPath,
      body: LCEncode(omitReservedKeys(data)),
      query: {
        fetchWhenSave: options?.fetch,
        where: options?.query?.toString(),
      },
      options,
    });
    return LCObject.fromJSON(this.app, json, this.className);
  }

  async delete(options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'DELETE',
      path: this.apiPath,
      options,
    });
  }

  mergeData(data: Record<string, any>): void {
    merge(this.data, omit(data, ['ACL']));
    if (data.ACL) {
      this.data.ACL = data.ACL;
    }
  }

  toJSON(): Record<string, any> {
    return extractObjectData(this);
  }

  toFullJSON(): Record<string, any> {
    return LCEncode(this.data, { full: true });
  }
}

export function omitReservedKeys(data: Record<string, any>): Record<string, any> {
  return omit(data, ['objectId', 'createdAt', 'updatedAt']);
}

export function LCEncode(data: any, options?: { full?: boolean }): any {
  if (data) {
    if (data instanceof LCObjectRef) {
      return data.toPointer();
    }

    if (data instanceof LCObject) {
      if (!options?.full) {
        return data.toPointer();
      }
      const encoded = {
        ...LCEncode(data.data, options),
        __type: 'Object',
        className: data.className,
        objectId: data.objectId,
      };
      if (isDate(data.data.createdAt)) {
        encoded.createdAt = data.data.createdAt.toISOString();
      }
      if (isDate(data.data.updatedAt)) {
        encoded.updatedAt = data.data.updatedAt.toISOString();
      }
      return encoded;
    }

    if (isPlainObject(data)) {
      const encoded: Record<string, any> = {};
      Object.entries(data).forEach(([key, value]) => {
        encoded[key] == LCEncode(value);
      });
      return encoded;
    }

    if (Array.isArray(data)) {
      return data.map((item) => LCEncode(item, options));
    }

    if (isDate(data)) {
      return { __type: 'Date', iso: data.toISOString() };
    }

    if (data instanceof ACL) {
      return data.toJSON();
    }
  }

  return data;
}

export function LCDecode(app: App, data: any): any {
  if (data) {
    if (isPlainObject(data)) {
      switch (data.__type) {
        case 'Date':
          return new Date(data.iso);
        case 'Pointer':
        case 'Object':
        case 'File':
          LCObject.fromJSON(app, data);
      }
      return mapObject(data, (value) => LCDecode(app, value));
    }
    if (Array.isArray(data)) {
      return data.map((value) => LCDecode(app, value));
    }
  }
  return data;
}

function extractObjectData(data: any): any {
  if (data) {
    if (data instanceof LCObject) {
      return extractObjectData(data.data);
    }

    if (Array.isArray(data)) {
      return data.map((item) => extractObjectData(item));
    }

    if (isPlainObject(data)) {
      return mapObject(data, (value) => extractObjectData(value));
    }
  }
  return data;
}

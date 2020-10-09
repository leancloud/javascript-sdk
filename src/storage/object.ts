import type { Query } from './query';
import type { AuthOptions, App } from '../app/app';
import { isEmptyObject, isObject, assert, isDate, mapObject, deleteObjectKey } from '../utils';
import { ACL } from './acl';
import { API_VERSION } from '../const';

/**
 * @internal
 */
export function removeReservedKeys(data: Record<string, unknown>): Record<string, unknown> {
  const removed: Record<string, unknown> = { ...data };
  ['objectId', 'createdAt', 'updatedAt'].forEach((key) => delete removed[key]);
  return removed;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export class LCObjectRef {
  constructor(public app: App, public className: string, public objectId: string) {}

  toPointer(): Pointer {
    return { __type: 'Pointer', className: this.className, objectId: this.objectId };
  }

  async get(options?: GetObjectOptions): Promise<LCObject> {
    const res = await this.app.request({
      method: 'GET',
      path: `${API_VERSION}/classes/${this.className}/${this.objectId}`,
      query: {
        keys: options?.keys?.join(','),
        include: options?.include?.join(','),
        returnACL: options?.returnACL,
      },
      options,
    });
    if (isEmptyObject(res.body)) {
      throw new Error(`The objectId '${this.objectId}' is not exists`);
    }
    return Encoder.decodeObject(this.app, res.body, this.className) as LCObject;
  }

  async update(data: LCObjectData, options?: UpdateObjectOptions): Promise<LCObject> {
    const res = await this.app.request({
      method: 'PUT',
      path: `${API_VERSION}/classes/${this.className}/${this.objectId}`,
      body: Encoder.encode(removeReservedKeys(data)),
      query: {
        fetchWhenSave: options?.fetch,
        where: options?.query?.toString(),
      },
      options,
    });
    return Encoder.decodeObject(this.app, res.body, this.className) as LCObject;
  }

  async delete(options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'DELETE',
      path: `${API_VERSION}/classes/${this.className}/${this.objectId}`,
      options,
    });
  }
}

export class LCObject {
  data: LCObjectData;
  createdAt: Date;
  updatedAt: Date;

  protected _ref: LCObjectRef;

  constructor(app: App, className: string, objectId: string) {
    this._ref = new LCObjectRef(app, className, objectId);
  }

  /**
   * @internal
   */
  static extractData(data: unknown): unknown {
    if (!data) return data;

    if (data instanceof LCObject) {
      return this.extractData(data.data);
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.extractData(item));
    }

    if (isObject(data)) {
      return mapObject(data, (value) => this.extractData(value));
    }

    return data;
  }

  get app(): App {
    return this._ref.app;
  }

  get className(): string {
    return this._ref.className;
  }

  get objectId(): string {
    return this._ref.objectId;
  }

  /**
   * 等同于 objectId
   */
  get id(): string {
    return this.objectId;
  }

  toPointer(): Pointer {
    return this._ref.toPointer();
  }

  get(options?: GetObjectOptions): Promise<LCObject> {
    return this._ref.get(options);
  }

  update(data: LCObjectData, options?: UpdateObjectOptions): Promise<LCObject> {
    return this._ref.update(data, options);
  }

  delete(options?: AuthOptions): Promise<void> {
    return this._ref.delete(options);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toJSON(): Record<string, any> {
    const data = LCObject.extractData(this) as Record<string, unknown>;
    data.objectId = this.objectId;
    if (this.createdAt) {
      data.createdAt = this.createdAt;
    }
    if (this.updatedAt) {
      data.updatedAt = this.updatedAt;
    }
    return data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toFullJSON(): Record<string, any> {
    return Encoder.encodeObject(this, true);
  }
}

interface ObjectCreator {
  (app: App, objectId: string, className?: string): LCObject;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/** @internal */
export class Encoder {
  private static _creators = new Map<string, ObjectCreator>();

  static setCreator(className: string, creator: ObjectCreator): void {
    this._creators.set(className, creator);
  }

  static create(app: App, className: string, objectId: string): LCObject {
    const creator = this._creators.get(className);
    if (creator) {
      return creator(app, objectId, className);
    }
    return new LCObject(app, className, objectId);
  }

  static encode(data: any, full?: boolean): any {
    if (!data) return data;

    if (data instanceof LCObjectRef) {
      return data.toPointer();
    }

    if (data instanceof LCObject) {
      return this.encodeObject(data, full);
    }

    if (data instanceof ACL) {
      return data.toJSON();
    }

    if (isDate(data)) {
      return { __type: 'Date', iso: data.toISOString() };
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.encode(item, full));
    }

    if (isObject(data)) {
      return mapObject(data, (value) => this.encode(value));
    }

    return data;
  }

  static encodeObject(obj: LCObject, full?: boolean): any {
    if (!full) {
      return obj.toPointer();
    }

    const encoded = this.encode(obj.data, full);
    encoded.__type = 'Object';
    encoded.className = obj.className;
    encoded.objectId = obj.objectId;

    if (obj.createdAt) {
      encoded.createdAt = obj.createdAt.toISOString();
    }
    if (obj.updatedAt) {
      encoded.updatedAt = obj.updatedAt.toISOString();
    }

    return encoded;
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

    if (Array.isArray(data)) {
      return data.map((item) => this.decode(app, item));
    }

    if (isObject(data)) {
      return mapObject(data, (value) => this.decode(app, value));
    }

    return data;
  }

  static decodeObject(app: App, data: any, className?: string): LCObject {
    if (className) {
      data.className = className;
    }
    assert(data.className, 'Decode failed: the className is empty');
    assert(data.objectId, 'Decode failed: the objectId is empty');

    const obj = this.create(app, data.className, data.objectId);
    obj.data = { ...data };
    deleteObjectKey(obj.data, ['className', 'objectId', 'ACL', '__type', 'createdAt', 'updatedAt']);
    obj.data = this.decode(app, obj.data);

    if (data.createdAt) {
      obj.createdAt = new Date(data.createdAt);
    }
    if (data.updatedAt) {
      obj.updatedAt = new Date(data.updatedAt);
    }

    if (data.ACL) {
      obj.data.ACL = ACL.fromJSON(data.ACL);
    }

    return obj;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
/* eslint-enable @typescript-eslint/explicit-module-boundary-types */

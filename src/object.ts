import { merge, omit, isPlainObject, isEmpty, isDate } from 'lodash';
import type { Query } from './query';
import type { AuthOptions, App } from './app';
import { mapObject } from './utils';
import { ACL } from './acl';

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

  get id(): string {
    return this.objectId;
  }

  toPointer(): Pointer {
    return { __type: 'Pointer', className: this.className, objectId: this.objectId };
  }

  async get(options?: GetObjectOptions): Promise<LCObject> {
    const res = await this.app.request({
      method: 'GET',
      path: `/classes/${this.className}/${this.objectId}`,
      query: {
        keys: options?.keys?.join(','),
        include: options?.include?.join(','),
        returnACL: options?.returnACL,
      },
      options,
    });
    if (isEmpty(res.body)) {
      throw new Error(`The objectId '${this.objectId}' is not exists`);
    }
    return this.app.decode(res.body, { type: 'Object', className: this.className });
  }

  async update(data: LCObjectData, options?: UpdateObjectOptions): Promise<LCObject> {
    const res = await this.app.request({
      method: 'PUT',
      path: `/classes/${this.className}/${this.objectId}`,
      body: lcEncode(removeReservedKeys(data)),
      query: {
        fetchWhenSave: options?.fetch,
        where: options?.query?.toString(),
      },
      options,
    });
    return this.app.decode(res.body, { type: 'Object', className: this.className });
  }

  async delete(options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'DELETE',
      path: `/classes/${this.className}/${this.objectId}`,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  static extractData(data: any): any {
    if (!data) return data;

    if (data instanceof LCObject) {
      return this.extractData(data.data);
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.extractData(item));
    }

    if (isPlainObject(data)) {
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

  async get(options?: GetObjectOptions): Promise<LCObject> {
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
    const data = LCObject.extractData(this);
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
    return lcEncode(this, { full: true });
  }

  mergeData(data: LCObjectData): this {
    merge(this.data, omit(data, ['objectId', 'createdAt', 'updatedAt', 'ACL']));
    if (data.updatedAt) {
      this.updatedAt = new Date(data.updatedAt);
    }
    return this;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export function lcEncode(data: any, options?: { full?: boolean }): any {
  if (!data) {
    return data;
  }

  if (data instanceof LCObjectRef) {
    return data.toPointer();
  }

  if (data instanceof LCObject) {
    if (!options?.full) {
      return data.toPointer();
    }
    const encoded = {
      ...lcEncode(data.data, options),
      __type: 'Object',
      className: data.className,
      objectId: data.objectId,
    };
    if (data.createdAt) {
      encoded.createdAt = data.createdAt.toISOString();
    }
    if (data.updatedAt) {
      encoded.updatedAt = data.updatedAt.toISOString();
    }
    return encoded;
  }

  if (data instanceof ACL) {
    return data.toJSON();
  }

  if (isDate(data)) {
    return { __type: 'Date', iso: data.toISOString() };
  }

  if (Array.isArray(data)) {
    return data.map((item) => lcEncode(item, options));
  }

  if (isPlainObject(data)) {
    return mapObject(data, (value) => lcEncode(value, options));
  }

  return data;
}

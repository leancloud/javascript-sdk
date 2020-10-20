import { Query } from './query';
import { LCObjectRef, AddObjectOptions, removeReservedKeys, LCObject, lcEncode } from './object';

export class Class extends Query {
  protected get _apiPath(): string {
    return `/classes/${this.className}`;
  }

  /**
   * Create an object reference.
   *
   * @since 5.0.0
   */
  object(id: string): LCObjectRef {
    return new LCObjectRef(this.app, this.className, id);
  }

  /**
   * Add an Object to the server.
   *
   * @since 5.0.0
   */
  async add(data: Record<string, unknown>, options?: AddObjectOptions): Promise<LCObject> {
    const res = await this.app.request({
      method: 'POST',
      path: this._apiPath,
      body: lcEncode(removeReservedKeys(data)),
      query: { fetchWhenSave: options?.fetch },
      options,
    });
    return this.app.decode(res.body, { type: 'Object', className: this.className });
  }
}

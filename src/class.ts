import { Query } from './query';
import { LCObjectRef, AddObjectOptions, LCObject, LCEncode, omitReservedKeys } from './object';

export class Class extends Query {
  get apiPath(): string {
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
  async add(data: Record<string, any>, options?: AddObjectOptions): Promise<LCObject> {
    const json = await this.app.request({
      method: 'POST',
      path: this.apiPath,
      body: LCEncode(omitReservedKeys(data)),
      query: { fetchWhenSave: options?.fetch },
      options,
    });
    return LCObject.fromJSON(this.app, json, this.className);
  }
}

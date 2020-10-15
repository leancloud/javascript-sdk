import { Query } from './query';
import { LCObject, LCObjectRef, AddObjectOptions, removeReservedKeys } from './object';
import { Encoder } from './object';
import { API_VERSION } from '../const';

export class Class extends Query {
  protected get _apiPath(): string {
    return `${API_VERSION}/classes/${this.className}`;
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
      body: Encoder.encode(removeReservedKeys(data)),
      query: { fetchWhenSave: options?.fetch },
      options,
    });
    return Encoder.decodeObject(this.app, res.body, this.className);
  }
}

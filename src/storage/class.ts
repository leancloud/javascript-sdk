import { Query } from './query';
import { LCObject, LCObjectRef, AddObjectOptions, removeReservedKeys } from './object';
import { Encoder } from './object';
import { API_VERSION } from '../const';
import { App } from '../app/app';

export function CLASS(className: string): Class {
  return new Class(App.default, className);
}

export class Class extends Query {
  protected get _apiPath(): string {
    return `${API_VERSION}/classes/${this.className}`;
  }

  object(id: string): LCObjectRef {
    return new LCObjectRef(this.app, this.className, id);
  }

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

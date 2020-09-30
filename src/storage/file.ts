import {
  LCObjectRef,
  LCObject,
  LCObjectData,
  GetObjectOptions,
  UpdateObjectOptions,
  Encoder,
} from './object';
import { App } from '../app/app';

Encoder.setCreator('_File', (app, id) => new FileObject(app, id));

export interface FileData extends LCObjectData {
  name: string;
  url: string;
  mime_type: string;
  metaData: Record<string, unknown>;
}

export class FileObjectRef extends LCObjectRef {
  constructor(app: App, objectId: string) {
    super(app, '_File', objectId);
  }

  get(options?: GetObjectOptions): Promise<FileObject> {
    return super.get(options) as Promise<FileObject>;
  }

  update(data: Partial<FileData>, options?: UpdateObjectOptions): Promise<FileObject> {
    return super.update(
      {
        name: data.name,
        url: data.url,
        mime_type: data.mime_type,
        metaData: data.metaData,
        ACL: data.ACL,
      },
      options
    ) as Promise<FileObject>;
  }
}

export class FileObject extends LCObject {
  data: FileData;

  protected _ref: FileObjectRef;

  constructor(app: App, objectId: string) {
    super(app, '_File', objectId);
    this._ref = new FileObjectRef(app, objectId);
  }

  get name(): string {
    return this.data.name;
  }

  get url(): string {
    return this.data.url;
  }

  get size(): number {
    return this.data.metaData?.size as number;
  }

  thumbnailURL(
    width: number,
    height: number,
    quality = 100,
    scaleToFit = true,
    format = 'png'
  ): string {
    const mode = scaleToFit ? 2 : 1;
    return this.url + `?imageView/${mode}/w/${width}/h/${height}/q/${quality}/format/${format}`;
  }

  get(options?: GetObjectOptions): Promise<FileObject> {
    return this._ref.get(options);
  }

  update(data: Partial<FileData>, options?: UpdateObjectOptions): Promise<FileObject> {
    return this._ref.update(data, options);
  }
}

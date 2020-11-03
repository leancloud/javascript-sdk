import type { App } from '../app';
import { GetObjectOptions, LCObjectRef, LCObject, LCObjectData } from '../object';

export interface FileData extends LCObjectData {
  name: string;
  url: string;
  mime_type: string;
  metaData: Record<string, any>;
}

export class FileObjectRef extends LCObjectRef {
  constructor(app: App, objectId: string) {
    super(app, '_File', objectId);
  }

  get apiPath(): string {
    return '/files/' + this.objectId;
  }

  async get(options?: GetObjectOptions): Promise<FileObject> {
    return FileObject.fromLCObject(await super.get(options));
  }

  update(): never {
    throw new Error('Cannot update file object');
  }
}

export class FileObject extends LCObject implements FileObjectRef {
  constructor(app: App, objectId: string) {
    super(app, '_File', objectId);
  }

  static fromLCObject(object: LCObject): FileObject {
    const file = new FileObject(object.app, object.objectId);
    file.data = object.data;
    return file;
  }

  get apiPath(): string {
    return '/files/' + this.objectId;
  }

  get name(): string {
    return this.data.name;
  }

  get url(): string {
    return this.data.url;
  }

  get mimeType(): string {
    return this.data.mime_type;
  }

  get metaData(): Record<string, any> {
    return this.data.metaData;
  }

  get size(): number {
    return this.metaData?.size as number;
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

  async get(options?: GetObjectOptions): Promise<FileObject> {
    return FileObject.fromLCObject(await super.get(options));
  }

  update(): never {
    throw new Error('Cannot update file object');
  }
}

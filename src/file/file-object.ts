import type { App } from '../app';
import { LCObjectRef, LCObject, LCObjectData, GetObjectOptions } from '../object';

export interface FileData extends LCObjectData {
  name: string;
  url: string;
  mime_type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metaData: Record<string, any>;
}

export class FileObjectRef extends LCObjectRef {
  constructor(app: App, objectId: string) {
    super(app, '_File', objectId);
  }

  protected get _apiPath(): string {
    return '/files/' + this.objectId;
  }

  get(options?: GetObjectOptions): Promise<FileObject> {
    return super.get(options) as Promise<FileObject>;
  }

  update(): never {
    throw new Error('Cannot update file object');
  }
}

export class FileObject extends LCObject {
  data: Partial<FileData>;

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

  update(): never {
    return this._ref.update();
  }
}

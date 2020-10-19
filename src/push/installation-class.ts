import type { App } from '../app/app';
import { KEY_INSTALLATION } from '../const';
import { Class } from '../storage/class';
import { Encoder, LCObject, LCObjectData, UpdateObjectOptions } from '../storage/object';

interface InstallationData extends LCObjectData {
  badge?: number;
  channels?: string[];
  deviceToken?: string;
  deviceType?: string;
  installationId?: string;
  timeZone?: string;
  valid?: boolean;
  vendor?: string;
}

export class InstallationClass extends Class {
  constructor(app?: App) {
    super('_Installation', app);
  }

  protected get _apiPath(): string {
    return `/installations`;
  }

  static addOrUpdateCurrent(
    data: InstallationData,
    options?: UpdateObjectOptions
  ): Promise<LCObject> {
    return new InstallationClass().addOrUpdateCurrent(data, options);
  }

  async addOrUpdateCurrent(
    data: InstallationData,
    options?: UpdateObjectOptions
  ): Promise<LCObject> {
    const encodedIns = await this.app.storage.getAsync(KEY_INSTALLATION);
    if (encodedIns) {
      const ins = Encoder.decodeObject(this.app, JSON.parse(encodedIns));
      return ins.update(data, options);
    }
    return this.add(data, options);
  }
}

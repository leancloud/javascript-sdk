import type { App } from '../app/app';
import { KEY_INSTALLATION } from '../const';
import { Class } from '../class';
import { lcEncode, LCObject, LCObjectData, UpdateObjectOptions } from '../object';

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
      const ins = this.app.decode(JSON.parse(encodedIns));
      return ins.update(data, options);
    }
    const ins = await this.add(data, options);
    await this.app.storage.setAsync(
      KEY_INSTALLATION,
      JSON.stringify(lcEncode(ins, { full: true }))
    );
    return ins;
  }
}

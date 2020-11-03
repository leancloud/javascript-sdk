import type { App } from '../app';
import { KEY_INSTALLATION } from '../const';
import { Class } from '../class';
import { LCEncode, LCObject, LCObjectData, UpdateObjectOptions } from '../object';

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
  constructor(app: App) {
    super(app, '_Installation');
  }

  get apiPath(): string {
    return `/installations`;
  }

  async addOrUpdateCurrent(
    data: InstallationData,
    options?: UpdateObjectOptions
  ): Promise<LCObject> {
    const encodedIns = await this.app.storage.getAsync(KEY_INSTALLATION);
    if (encodedIns) {
      const ins = LCObject.fromJSON(this.app, JSON.parse(encodedIns));
      return ins.update(data, options);
    }
    const ins = await this.add(data, options);
    await this.app.storage.setAsync(
      KEY_INSTALLATION,
      JSON.stringify(LCEncode(ins, { full: true }))
    );
    return ins;
  }
}

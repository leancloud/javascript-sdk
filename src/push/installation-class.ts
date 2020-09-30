import { App } from '../app/app';
import { API_VERSION, KEY_INSTALLATION } from '../const';
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
  constructor(app: App) {
    super(app, '_Installation');
  }

  protected get _apiPath(): string {
    return `${API_VERSION}/installations`;
  }

  static addOrUpdateCurrent(
    data: InstallationData,
    options?: UpdateObjectOptions
  ): Promise<LCObject> {
    return new InstallationClass(App.default).addOrUpdateCurrent(data, options);
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

import { Class } from './class';
import { App } from '../app/app';
import { RoleObjectRef, RoleObject } from './role';
import { AddObjectOptions, Encoder, LCObjectData } from './object';
import { Operation } from './operation';
import type { UserObject, UserObjectRef } from './user';
import type { ACL } from './acl';
import { API_VERSION } from '../const';

interface RoleDataToAdd extends LCObjectData {
  ACL: ACL;
  name: string;
  users?: Array<UserObject | UserObjectRef>;
  roles?: Array<RoleObject | RoleObjectRef>;
}

/**
 * @alias Role
 */
export class RoleClass extends Class {
  constructor(app: App) {
    super(app, '_Role');
  }

  static object(id: string): RoleObjectRef {
    return new RoleObjectRef(App.default, id);
  }

  static add(data: RoleDataToAdd, options?: AddObjectOptions): Promise<RoleObject> {
    return new RoleClass(App.default).add(data, options);
  }

  object(id: string): RoleObjectRef {
    return new RoleObjectRef(this.app, id);
  }

  async add(data: RoleDataToAdd, options?: AddObjectOptions): Promise<RoleObject> {
    const body: Record<string, unknown> = { ...data };
    if (data.roles) {
      body.roles = Operation.addRelation(data.roles);
    }
    if (data.users) {
      body.users = Operation.addRelation(data.users);
    }
    const res = await this.app.request({
      method: 'POST',
      path: `${API_VERSION}/roles`,
      body,
      options,
    });
    return Encoder.decodeObject(this.app, res.body, this.className) as RoleObject;
  }
}

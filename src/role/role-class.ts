import type { UserObject, UserObjectRef } from '../user';
import type { ACL } from '../acl';
import type { App } from '../app';
import { Class } from '../class';
import { RoleObjectRef, RoleObject } from './role-object';
import { AddObjectOptions, LCObjectData, op } from '../object';

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

  object(id: string): RoleObjectRef {
    return new RoleObjectRef(this.app, id);
  }

  async add(data: RoleDataToAdd, options?: AddObjectOptions): Promise<RoleObject> {
    const body: Record<string, any> = { ...data };
    if (data.roles) {
      body.roles = op.addRelation(data.roles);
    }
    if (data.users) {
      body.users = op.addRelation(data.users);
    }
    const json = await this.app.request({
      method: 'POST',
      path: `/roles`,
      body,
      options,
    });
    return RoleObject.fromJSON(this.app, json);
  }

  async getUsersRole(user: UserObjectRef): Promise<RoleObject[]> {
    const objects = await this.where('users', '==', user).find();
    return objects.map((object) => RoleObject.fromLCObject(object));
  }
}

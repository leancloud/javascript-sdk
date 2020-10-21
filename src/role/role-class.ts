import type { UserObject, UserObjectRef } from '../user';
import type { ACL } from '../acl';
import type { App } from '../app';
import { mustGetDefaultApp } from '../app/default-app';
import { Class } from '../class';
import { RoleObjectRef, RoleObject } from './role-object';
import { AddObjectOptions, LCObjectData } from '../object';
import { Operation } from '../operation';

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
  constructor(app?: App) {
    super('_Role', app);
  }

  static object(id: string): RoleObjectRef {
    return new RoleObjectRef(mustGetDefaultApp(), id);
  }

  static add(data: RoleDataToAdd, options?: AddObjectOptions): Promise<RoleObject> {
    return new RoleClass().add(data, options);
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
      path: `/roles`,
      body,
      options,
    });
    return this.app.decode(res.body, { type: 'Object', className: this.className });
  }
}

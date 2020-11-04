import type { ACL } from '../acl';
import { UserObject, UserObjectRef } from '../user';
import {
  LCObject,
  LCObjectRef,
  GetObjectOptions,
  UpdateObjectOptions,
  LCObjectData,
  op,
} from '../object';
import { AuthOptions, App } from '../app';
import { Query } from '../query';

export interface RoleData extends LCObjectData {
  ACL: ACL;
  name: string;
}
export class RoleObjectRef extends LCObjectRef {
  constructor(app: App, objectId: string) {
    super(app, '_Role', objectId);
  }

  get apiPath(): string {
    return '/roles/' + this.objectId;
  }

  async addUser(user: UserObjectRef | UserObjectRef[], options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'PUT',
      path: this.apiPath,
      body: {
        users: op.addRelation(user),
      },
      options,
    });
  }

  async addRole(role: RoleObjectRef | RoleObjectRef[], options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'PUT',
      path: this.apiPath,
      body: {
        roles: op.addRelation(role),
      },
      options,
    });
  }

  async removeUser(user: UserObjectRef | UserObjectRef[], options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'PUT',
      path: this.apiPath,
      body: {
        users: op.removeRelation(user),
      },
      options,
    });
  }

  async removeRole(role: RoleObjectRef | RoleObjectRef[], options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'PUT',
      path: this.apiPath,
      body: {
        roles: op.removeRelation(role),
      },
      options,
    });
  }

  getUsersQuery(): Query {
    return new Query(this.app, '_User').where('$relatedTo', '==', { key: 'users', object: this });
  }

  getRolesQuery(): Query {
    return new Query(this.app, '_Role').where('$relatedTo', '==', { key: 'roles', object: this });
  }

  async getUsers(options?: AuthOptions): Promise<UserObject[]> {
    const objects = await this.getUsersQuery().find(options);
    return objects.map((object) => UserObject.fromLCObject(object));
  }

  async getRoles(options?: AuthOptions): Promise<RoleObject[]> {
    const objects = await this.getRolesQuery().find(options);
    return objects.map((object) => RoleObject.fromLCObject(object));
  }

  async get(options?: GetObjectOptions): Promise<RoleObject> {
    return RoleObject.fromLCObject(await super.get(options));
  }

  async update(data: Record<string, any>, options?: UpdateObjectOptions): Promise<RoleObject> {
    return RoleObject.fromLCObject(await super.update(data, options));
  }
}

export class RoleObject extends LCObject implements RoleObjectRef {
  constructor(app: App, objectId: string) {
    super(app, '_Role', objectId);
  }

  static fromLCObject(object: LCObject): RoleObject {
    const role = new RoleObject(object.app, object.objectId);
    role.data = object.data;
    return role;
  }

  static fromJSON(app: App, data: Record<string, any>): RoleObject {
    return this.fromLCObject(super.fromJSON(app, data, '_Role'));
  }

  get apiPath(): string {
    return '/roles/' + this.objectId;
  }

  get name(): string {
    return this.data.name;
  }

  get aclKey(): string {
    return 'role:' + this.data.name;
  }

  async addUser(user: UserObjectRef | UserObjectRef[], options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'PUT',
      path: this.apiPath,
      body: {
        users: op.addRelation(user),
      },
      options,
    });
  }

  async addRole(role: RoleObjectRef | RoleObjectRef[], options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'PUT',
      path: this.apiPath,
      body: {
        roles: op.addRelation(role),
      },
      options,
    });
  }

  async removeUser(user: UserObjectRef | UserObjectRef[], options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'PUT',
      path: this.apiPath,
      body: {
        users: op.removeRelation(user),
      },
      options,
    });
  }

  async removeRole(role: RoleObjectRef | RoleObjectRef[], options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'PUT',
      path: this.apiPath,
      body: {
        roles: op.removeRelation(role),
      },
      options,
    });
  }

  getUsersQuery(): Query {
    return new Query(this.app, '_User').where('$relatedTo', '==', { key: 'users', object: this });
  }

  getRolesQuery(): Query {
    return new Query(this.app, '_Role').where('$relatedTo', '==', { key: 'roles', object: this });
  }

  async getUsers(options?: AuthOptions): Promise<UserObject[]> {
    const objects = await this.getUsersQuery().find(options);
    return objects.map((object) => UserObject.fromLCObject(object));
  }

  async getRoles(options?: AuthOptions): Promise<RoleObject[]> {
    const objects = await this.getRolesQuery().find(options);
    return objects.map((object) => RoleObject.fromLCObject(object));
  }

  async get(options?: GetObjectOptions): Promise<RoleObject> {
    return RoleObject.fromLCObject(await super.get(options));
  }

  async update(data: Record<string, any>, options?: UpdateObjectOptions): Promise<RoleObject> {
    return RoleObject.fromLCObject(await super.update(data, options));
  }
}

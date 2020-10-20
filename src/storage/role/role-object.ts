import type { UserObject, UserObjectRef } from '../user';
import {
  LCObject,
  LCObjectData,
  LCObjectRef,
  GetObjectOptions,
  UpdateObjectOptions,
} from '../../storage/object';
import type { ACL } from '../../storage/acl';
import { AuthOptions, App } from '../../app/app';
import { Query } from '../query';
import { Operation } from '../operation';

export interface RoleData extends LCObjectData {
  ACL: ACL;
  name: string;
}

type UserSubject = UserObjectRef | UserObject;
type RoleSubject = RoleObjectRef | RoleObject;

export class RoleObjectRef extends LCObjectRef {
  constructor(app: App, objectId: string) {
    super(app, '_Role', objectId);
  }

  async addUser(user: UserSubject | UserSubject[], options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'PUT',
      path: `/roles/${this.objectId}`,
      body: {
        users: Operation.addRelation(user),
      },
      options,
    });
  }

  async addRole(role: RoleSubject | RoleSubject[], options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'PUT',
      path: `/roles/${this.objectId}`,
      body: {
        roles: Operation.addRelation(role),
      },
      options,
    });
  }

  async removeUser(user: UserSubject | UserSubject[], options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'PUT',
      path: `/roles/${this.objectId}`,
      body: {
        users: Operation.removeRelation(user),
      },
      options,
    });
  }

  async removeRole(role: RoleSubject | RoleSubject[], options?: AuthOptions): Promise<void> {
    await this.app.request({
      method: 'PUT',
      path: `/roles/${this.objectId}`,
      body: {
        roles: Operation.removeRelation(role),
      },
      options,
    });
  }

  getUsersQuery(): Query {
    return new Query('_User', this.app).where('$relatedTo', '==', { key: 'users', object: this });
  }

  getRolesQuery(): Query {
    return new Query('_Role', this.app).where('$relatedTo', '==', { key: 'roles', object: this });
  }

  async getUsers(options?: AuthOptions): Promise<UserObject[]> {
    return this.getUsersQuery().find(options) as Promise<UserObject[]>;
  }

  async getRoles(options?: AuthOptions): Promise<RoleObject[]> {
    return this.getRolesQuery().find(options) as Promise<RoleObject[]>;
  }

  get(options?: GetObjectOptions): Promise<RoleObject> {
    return super.get(options) as Promise<RoleObject>;
  }

  update(data: RoleData, options?: UpdateObjectOptions): Promise<RoleObject> {
    return super.update(data, options) as Promise<RoleObject>;
  }
}

export class RoleObject extends LCObject {
  data: RoleData;

  protected _ref: RoleObjectRef;

  constructor(app: App, objectId: string) {
    super(app, '_Role', objectId);
    this._ref = new RoleObjectRef(app, objectId);
  }

  get name(): string {
    return this.data.name;
  }

  get aclKey(): string {
    return 'role:' + this.data.name;
  }

  addUser(user: UserSubject | UserSubject[], options?: AuthOptions): Promise<void> {
    return this._ref.addUser(user, options);
  }

  addRole(role: RoleSubject | RoleSubject[], options?: AuthOptions): Promise<void> {
    return this._ref.addRole(role, options);
  }

  removeUser(user: UserSubject | UserSubject[], options?: AuthOptions): Promise<void> {
    return this._ref.removeUser(user, options);
  }

  removeRole(role: RoleSubject | RoleSubject[], options?: AuthOptions): Promise<void> {
    return this._ref.removeRole(role, options);
  }

  getUsersQuery(): Query {
    return this._ref.getUsersQuery();
  }

  getRolesQuery(): Query {
    return this._ref.getRolesQuery();
  }

  getUsers(options?: AuthOptions): Promise<UserObject[]> {
    return this._ref.getUsers(options);
  }

  getRoles(options?: AuthOptions): Promise<RoleObject[]> {
    return this._ref.getRoles(options);
  }

  get(options?: GetObjectOptions): Promise<RoleObject> {
    return super.get(options) as Promise<RoleObject>;
  }

  update(data: RoleData, options?: UpdateObjectOptions): Promise<RoleObject> {
    return super.update(data, options) as Promise<RoleObject>;
  }
}

import type { UserObject, UserObjectRef } from './user';
import type { RoleObject } from './role';

type Subject = '*' | UserObject | UserObjectRef | RoleObject | string;

interface Privilege {
  read?: boolean;
  write?: boolean;
}

type Operation = keyof Privilege;

export class ACL {
  private _canRead = new Set<string>();
  private _canWrite = new Set<string>();

  private static _getSubjectKey(subject: Subject): string {
    return typeof subject === 'string' ? subject : subject.aclKey;
  }

  private static _getRoleSubectKey(role: RoleObject | string): string {
    if (typeof role === 'string') {
      if (role.startsWith('role:')) {
        return role;
      } else {
        return 'role:' + role;
      }
    } else {
      return role.aclKey;
    }
  }

  static fromJSON(data: unknown): ACL {
    const acl = new ACL();
    Object.entries(data).forEach(([subject, privilege]) => {
      if (privilege.read === true) {
        acl.allow(subject, 'read');
      } else if (privilege.read === false) {
        acl.deny(subject, 'read');
      }
      if (privilege.write === true) {
        acl.allow(subject, 'write');
      } else if (privilege.write === false) {
        acl.deny(subject, 'write');
      }
    });
    return acl;
  }

  toJSON(): Record<string, Privilege> {
    const json: Record<string, Privilege> = {};
    this._canRead.forEach((key) => {
      if (json[key]) {
        json[key].read = true;
      } else {
        json[key] = { read: true };
      }
    });
    this._canWrite.forEach((key) => {
      if (json[key]) {
        json[key].write = true;
      } else {
        json[key] = { write: true };
      }
    });
    return json;
  }

  allow(subject: Subject, operation: Operation): this {
    const key = ACL._getSubjectKey(subject);
    switch (operation) {
      case 'read':
        this._canRead.add(key);
        break;
      case 'write':
        this._canWrite.add(key);
        break;
      default:
        throw new Error('Unknown operation: ' + operation);
    }
    return this;
  }

  deny(subject: Subject, operation: Operation): this {
    const key = ACL._getSubjectKey(subject);
    switch (operation) {
      case 'read':
        this._canRead.delete(key);
        break;
      case 'write':
        this._canWrite.delete(key);
        break;
      default:
        throw new Error('Unknown operation: ' + operation);
    }
    return this;
  }

  can(subject: Subject, operation: Operation): boolean {
    const key = ACL._getSubjectKey(subject);
    switch (operation) {
      case 'read':
        return this._canRead.has(key);
      case 'write':
        return this._canWrite.has(key);
      default:
        throw new Error('Unknown operation: ' + operation);
    }
  }

  setPublicReadAccess(allowed: boolean): this {
    return allowed ? this.allow('*', 'read') : this.deny('*', 'read');
  }

  getPublicReadAccess(): boolean {
    return this.can('*', 'read');
  }

  setPublicWriteAccess(allowed: boolean): this {
    return allowed ? this.allow('*', 'write') : this.deny('*', 'write');
  }

  getPublicWriteAccess(): boolean {
    return this.can('*', 'write');
  }

  setReadAccess(subject: Subject, allowed: boolean): this {
    return allowed ? this.allow(subject, 'read') : this.deny(subject, 'read');
  }

  getReadAccess(subject: Subject): boolean {
    return this.can(subject, 'read');
  }

  setWriteAccess(subject: Subject, allowed: boolean): this {
    return allowed ? this.allow(subject, 'write') : this.deny(subject, 'write');
  }

  getWriteAccess(subject: Subject): boolean {
    return this.can(subject, 'write');
  }

  setRoleReadAccess(role: RoleObject | string, allowed: boolean): this {
    const roleKey = ACL._getRoleSubectKey(role);
    return allowed ? this.allow(roleKey, 'read') : this.deny(roleKey, 'read');
  }

  getRoleReadAccess(role: RoleObject | string): boolean {
    return this.can(ACL._getRoleSubectKey(role), 'read');
  }

  setRoleWriteAccess(role: RoleObject | string, allowed: boolean): this {
    const roleKey = ACL._getRoleSubectKey(role);
    return allowed ? this.allow(roleKey, 'write') : this.deny(roleKey, 'write');
  }

  getRoleWriteAccess(role: RoleObject | string): boolean {
    if (typeof role === 'string' && !role.startsWith('role:')) {
      role = 'role:' + role;
    }
    return this.can(role, 'write');
  }
}

import type { UserObject, UserObjectRef } from './user';
import type { RoleObject } from './role';
import { isEmptyObject } from '../utils';

type Subject = '*' | UserObject | UserObjectRef | RoleObject | string;

interface Privilege {
  read?: boolean;
  write?: boolean;
}

type Operation = keyof Privilege;

/**
 * @internal
 */
function getACLKey(subject: Subject): string {
  return typeof subject === 'string' ? subject : subject.aclKey;
}

/**
 * @internal
 */
function getRoleACLKey(role: RoleObject | string): string {
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

export class ACL {
  data: Record<string, Privilege> = {};

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
    return this.data;
  }

  allow(subject: Subject, operation: Operation): this {
    const key = getACLKey(subject);
    if (!this.data[key]) {
      this.data[key] = {};
    }
    this.data[key][operation] = true;
    return this;
  }

  deny(subject: Subject, operation: Operation): this {
    const key = getACLKey(subject);
    if (this.data[key]) {
      delete this.data[key][operation];
      if (isEmptyObject(this.data[key])) {
        delete this.data[key];
      }
    }
    return this;
  }

  can(subject: Subject, operation: Operation): boolean {
    const key = getACLKey(subject);
    return Boolean(this.data[key] && this.data[key][operation]);
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
    const roleKey = getRoleACLKey(role);
    return allowed ? this.allow(roleKey, 'read') : this.deny(roleKey, 'read');
  }

  getRoleReadAccess(role: RoleObject | string): boolean {
    return this.can(getRoleACLKey(role), 'read');
  }

  setRoleWriteAccess(role: RoleObject | string, allowed: boolean): this {
    const roleKey = getRoleACLKey(role);
    return allowed ? this.allow(roleKey, 'write') : this.deny(roleKey, 'write');
  }

  getRoleWriteAccess(role: RoleObject | string): boolean {
    if (typeof role === 'string' && !role.startsWith('role:')) {
      role = 'role:' + role;
    }
    return this.can(role, 'write');
  }
}

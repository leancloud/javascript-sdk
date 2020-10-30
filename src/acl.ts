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

  /**
   * @since 5.0.0
   */
  static fromJSON(data: Record<string, Privilege>): ACL {
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

  /**
   * @since 5.0.0
   */
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

  /**
   * Allow the subject to execute the operation.
   *
   * @since 5.0.0
   */
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

  /**
   * Deny the subject to execute the operation.
   *
   * @since 5.0.0
   */
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

  /**
   * Test whether the subject can execute the operation.
   *
   * @since 5.0.0
   */
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

  /**
   * Set whether the public is allowed to read.
   *
   * @since 5.0.0
   */
  setPublicReadAccess(allowed: boolean): this {
    return allowed ? this.allow('*', 'read') : this.deny('*', 'read');
  }

  /**
   * Get whether the public is allowed to read.
   *
   * @since 5.0.0
   */
  getPublicReadAccess(): boolean {
    return this.can('*', 'read');
  }

  /**
   * Set whether the public is allowed to write.
   *
   * @since 5.0.0
   */
  setPublicWriteAccess(allowed: boolean): this {
    return allowed ? this.allow('*', 'write') : this.deny('*', 'write');
  }

  /**
   * Get whether the public is allowed to write.
   *
   * @since 5.0.0
   */
  getPublicWriteAccess(): boolean {
    return this.can('*', 'write');
  }

  /**
   * Set whether the given subject is allowed to read.
   *
   * @since 5.0.0
   */
  setReadAccess(subject: Subject, allowed: boolean): this {
    return allowed ? this.allow(subject, 'read') : this.deny(subject, 'read');
  }

  /**
   * Get whether the given subject is **explicitly** allowed to read. Even if this returns false,
   * the user may still be able to access it if getPublicReadAccess returns true or a role that the
   * user belongs to has write access.
   *
   * @since 5.0.0
   */
  getReadAccess(subject: Subject): boolean {
    return this.can(subject, 'read');
  }

  /**
   * Set whether the given user id is allowed to write.
   *
   * @since 5.0.0
   */
  setWriteAccess(subject: Subject, allowed: boolean): this {
    return allowed ? this.allow(subject, 'write') : this.deny(subject, 'write');
  }

  /**
   * Get whether the given user is **explicitly** allowed to write. Even if this returns false, the
   * user may still be able to write it if getPublicWriteAccess returns true or a role that the user
   * belongs to has write access.
   *
   * @since 5.0.0
   */
  getWriteAccess(subject: Subject): boolean {
    return this.can(subject, 'write');
  }

  /**
   * Set whether users belonging to the given role are allowed to read.
   *
   * @since 5.0.0
   */
  setRoleReadAccess(role: RoleObject | string, allowed: boolean): this {
    const roleKey = ACL._getRoleSubectKey(role);
    return allowed ? this.allow(roleKey, 'read') : this.deny(roleKey, 'read');
  }

  /**
   * Get whether users belonging to the given role are allowed to read. Even if this returns false,
   * the role may still be able to read it if a parent role has read access.
   *
   * @since 5.0.0
   */
  getRoleReadAccess(role: RoleObject | string): boolean {
    return this.can(ACL._getRoleSubectKey(role), 'read');
  }

  /**
   * Set whether users belonging to the given role are allowed to write.
   *
   * @since 5.0.0
   */
  setRoleWriteAccess(role: RoleObject | string, allowed: boolean): this {
    const roleKey = ACL._getRoleSubectKey(role);
    return allowed ? this.allow(roleKey, 'write') : this.deny(roleKey, 'write');
  }

  /**
   * Get whether users belonging to the given role are allowed to write. Even if this returns false,
   * the role may still be able to write it if a parent role has write access.
   *
   * @since 5.0.0
   */
  getRoleWriteAccess(role: RoleObject | string): boolean {
    return this.can(ACL._getRoleSubectKey(role), 'write');
  }
}

import 'should';
import { ACL } from '../../src/storage/acl';
import { UserObjectRef, UserObject } from '../../src/storage/user';
import { RoleObject } from '../../src/storage/role';
import { use } from '../../src/app/plugin';

describe('ACL', function () {
  describe('.fromJSON', function () {
    it('should create ACL from JSON', function () {
      const acl = ACL.fromJSON({
        key1: { read: true, write: false },
        key2: { read: false, write: true },
      });
      acl.can('key1', 'read').should.true();
      acl.can('key1', 'write').should.false();
      acl.can('key2', 'read').should.false();
      acl.can('key2', 'write').should.true();
    });
  });

  describe('#allow', function () {
    it('should allow string id to read/write', function () {
      const acl = new ACL();
      acl.allow('key', 'read');
      acl.allow('key', 'write');
      acl.can('key', 'read').should.true();
      acl.can('key', 'write').should.true();
    });

    it('should allow user reference to read/write', function () {
      const acl = new ACL();
      const userRef = new UserObjectRef(null, 'user-id');
      acl.allow(userRef, 'read');
      acl.allow(userRef, 'write');
      acl.can(userRef, 'read').should.true();
      acl.can(userRef, 'write').should.true();
    });

    it('should allow user to read/write', function () {
      const acl = new ACL();
      const user = new UserObject(null, 'user-id');
      acl.allow(user, 'read');
      acl.allow(user, 'write');
      acl.can(user, 'read').should.true();
      acl.can(user, 'write').should.true();
    });

    it('should allow role to read/write', function () {
      const acl = new ACL();
      const role = new RoleObject(null, '');
      role.data = { name: 'role-name', ACL: null };
      acl.allow(role, 'read');
      acl.allow(role, 'write');
      acl.can(role, 'read').should.true();
      acl.can(role, 'write').should.true();
    });
  });

  describe('#deny', function () {
    it('should deny string id to read/write', function () {
      const acl = new ACL();
      acl.allow('key', 'read');
      acl.allow('key', 'write');
      acl.deny('key', 'read');
      acl.can('key', 'read').should.false();
      acl.deny('key', 'write');
      acl.can('key', 'write').should.false();
    });

    it('should deny user reference to read/write', function () {
      const acl = new ACL();
      const userRef = new UserObjectRef(null, 'user-id');
      acl.allow(userRef, 'read');
      acl.allow(userRef, 'write');
      acl.deny(userRef, 'read');
      acl.can(userRef, 'read').should.false();
      acl.deny(userRef, 'write');
      acl.can(userRef, 'write').should.false();
    });

    it('should deny user to read/write', function () {
      const acl = new ACL();
      const user = new UserObject(null, 'user-id');
      acl.allow(user, 'read');
      acl.allow(user, 'write');
      acl.deny(user, 'read');
      acl.can(user, 'read').should.false();
      acl.deny(user, 'write');
      acl.can(user, 'write').should.false();
    });

    it('should deny role to read/write', function () {
      const acl = new ACL();
      const role = new RoleObject(null, '');
      role.data = { name: 'role-name', ACL: null };
      acl.allow(role, 'read');
      acl.allow(role, 'write');
      acl.deny(role, 'read');
      acl.can(role, 'read').should.false();
      acl.deny(role, 'write');
      acl.can(role, 'write').should.false();
    });
  });

  describe('#can', function () {
    it('should check string id can read/write', function () {
      const acl = new ACL();
      acl.can('key', 'read').should.false();
      acl.can('key', 'write').should.false();
      acl.allow('key', 'read');
      acl.allow('key', 'write');
      acl.can('key', 'read').should.true();
      acl.can('key', 'write').should.true();
    });

    it('should check user reference can read/write', function () {
      const acl = new ACL();
      const userRef = new UserObjectRef(null, 'user-id');
      acl.can(userRef, 'read').should.false();
      acl.can(userRef, 'write').should.false();
      acl.allow(userRef, 'read');
      acl.allow(userRef, 'write');
      acl.can(userRef, 'read').should.true();
      acl.can(userRef, 'write').should.true();
    });

    it('should check user can read/write', function () {
      const acl = new ACL();
      const user = new UserObject(null, 'user-id');
      acl.can(user, 'read').should.false();
      acl.can(user, 'write').should.false();
      acl.allow(user, 'read');
      acl.allow(user, 'write');
      acl.can(user, 'read').should.true();
      acl.can(user, 'write').should.true();
    });

    it('should check role can read/write', function () {
      const acl = new ACL();
      const role = new RoleObject(null, 'role-id');
      role.data = { name: 'role-name', ACL: null };
      acl.can(role, 'read').should.false();
      acl.can(role, 'write').should.false();
      acl.allow(role, 'read');
      acl.allow(role, 'write');
      acl.can(role, 'read').should.true();
      acl.can(role, 'write').should.true();
    });
  });

  describe('#toJSON', function () {
    it('should generate correct JSON object', function () {
      const acl = new ACL();
      acl.allow('key1', 'read');
      acl.allow('key2', 'write');
      acl.toJSON().should.eql({
        key1: { read: true },
        key2: { write: true },
      });
    });
  });
});

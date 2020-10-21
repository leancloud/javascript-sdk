import 'should';
import { adapters } from '../../../src/utils/test-adapters';
import { App } from '../../../src/app';
import { RoleObjectRef, RoleObject } from '../../../src/role';
import { UserObjectRef, UserObject } from '../../../src/user';
import { API_VERSION } from '../../../src/const';

const app = new App({
  appId: 'test-app-id',
  appKey: 'test-app-key',
  serverURL: 'test-server-url',
});

describe('RoleObjectRef', function () {
  const ref = new RoleObjectRef(app, 'test-role-id');

  describe('#addUser', function () {
    it('should send PUT request to /roles/${objectId}', async function () {
      await ref.addUser(new UserObject(null, 'test-user-id'));
      const req = adapters.requests.pop();
      req.method.should.eql('PUT');
      req.path.should.eql(`${API_VERSION}/roles/test-role-id`);
    });

    it('should add relation with UserObject | UserObjectRef', async function () {
      const body = {
        users: {
          __op: 'AddRelation',
          objects: [{ __type: 'Pointer', className: '_User', objectId: 'test-user-id' }],
        },
      };

      await ref.addUser(new UserObject(null, 'test-user-id'));
      let req = adapters.requests.pop();
      req.body.should.eql(body);

      await ref.addUser(new UserObjectRef(null, 'test-user-id'));
      req = adapters.requests.pop();
      req.body.should.eql(body);
    });

    it('should add relation with Array<User | UserReference>', async function () {
      await ref.addUser([
        new UserObject(null, 'test-user-1'),
        new UserObjectRef(null, 'test-user-2'),
      ]);
      const req = adapters.requests.pop();
      req.body.should.eql({
        users: {
          __op: 'AddRelation',
          objects: [
            { __type: 'Pointer', className: '_User', objectId: 'test-user-1' },
            { __type: 'Pointer', className: '_User', objectId: 'test-user-2' },
          ],
        },
      });
    });
  });

  describe('#addRole', function () {
    it('should send PUT request to /roles/${objectId}', async function () {
      await ref.addRole(new RoleObject(null, 'test-role-id'));
      const req = adapters.requests.pop();
      req.method.should.eql('PUT');
      req.path.should.eql(`${API_VERSION}/roles/test-role-id`);
    });

    it('should add relation with RoleObject | RoleObjectRef', async function () {
      const body = {
        roles: {
          __op: 'AddRelation',
          objects: [{ __type: 'Pointer', className: '_Role', objectId: 'test-role-id' }],
        },
      };

      await ref.addRole(new RoleObject(null, 'test-role-id'));
      let req = adapters.requests.pop();
      req.body.should.eql(body);

      await ref.addRole(new RoleObjectRef(null, 'test-role-id'));
      req = adapters.requests.pop();
      req.body.should.eql(body);
    });

    it('should add relation with Array<RoleObject | RoleObjectRef>', async function () {
      await ref.addRole([
        new RoleObject(null, 'test-role-1'),
        new RoleObjectRef(null, 'test-role-2'),
      ]);
      const req = adapters.requests.pop();
      req.body.should.eql({
        roles: {
          __op: 'AddRelation',
          objects: [
            { __type: 'Pointer', className: '_Role', objectId: 'test-role-1' },
            { __type: 'Pointer', className: '_Role', objectId: 'test-role-2' },
          ],
        },
      });
    });
  });

  describe('#removeUser', function () {
    it('should send PUT request to /roles/${objectId}', async function () {
      await ref.removeUser(new UserObject(null, 'test-user-id'));
      const req = adapters.requests.pop();
      req.method.should.eql('PUT');
      req.path.should.eql(`${API_VERSION}/roles/test-role-id`);
    });

    it('should remove relation with UserObject | UserObjectRef', async function () {
      const body = {
        users: {
          __op: 'RemoveRelation',
          objects: [{ __type: 'Pointer', className: '_User', objectId: 'test-user-id' }],
        },
      };

      await ref.removeUser(new UserObject(null, 'test-user-id'));
      let req = adapters.requests.pop();
      req.body.should.eql(body);

      await ref.removeUser(new UserObjectRef(null, 'test-user-id'));
      req = adapters.requests.pop();
      req.body.should.eql(body);
    });

    it('should remove relation with Array<UserObject | UserObjectRef>', async function () {
      await ref.removeUser([
        new UserObject(null, 'test-user-1'),
        new UserObjectRef(null, 'test-user-2'),
      ]);
      const req = adapters.requests.pop();
      req.body.should.eql({
        users: {
          __op: 'RemoveRelation',
          objects: [
            { __type: 'Pointer', className: '_User', objectId: 'test-user-1' },
            { __type: 'Pointer', className: '_User', objectId: 'test-user-2' },
          ],
        },
      });
    });
  });

  describe('#removeRole', function () {
    it('should send PUT request to /roles/${objectId}', async function () {
      await ref.removeRole(new RoleObject(null, 'test-role-id'));
      const req = adapters.requests.pop();
      req.method.should.eql('PUT');
      req.path.should.eql(`${API_VERSION}/roles/test-role-id`);
    });

    it('should remove relation with RoleObject | RoleObjectRef', async function () {
      const body = {
        roles: {
          __op: 'RemoveRelation',
          objects: [{ __type: 'Pointer', className: '_Role', objectId: 'test-role-id' }],
        },
      };

      await ref.removeRole(new RoleObject(null, 'test-role-id'));
      let req = adapters.requests.pop();
      req.body.should.eql(body);

      await ref.removeRole(new RoleObjectRef(null, 'test-role-id'));
      req = adapters.requests.pop();
      req.body.should.eql(body);
    });

    it('should remove relation with Array<RoleObject | RoleObjectRef>', async function () {
      await ref.removeRole([
        new RoleObject(null, 'test-role-1'),
        new RoleObjectRef(null, 'test-role-2'),
      ]);
      const req = adapters.requests.pop();
      req.body.should.eql({
        roles: {
          __op: 'RemoveRelation',
          objects: [
            { __type: 'Pointer', className: '_Role', objectId: 'test-role-1' },
            { __type: 'Pointer', className: '_Role', objectId: 'test-role-2' },
          ],
        },
      });
    });
  });

  describe('#getUsers', function () {
    it('should query relation with users', async function () {
      adapters.responses.push({ body: { results: [] } });
      await ref.getUsers();
      const req = adapters.requests.pop();
      req.path.should.eql(`${API_VERSION}/classes/_User`);
      JSON.parse(req.query.where as string).should.eql({
        $relatedTo: {
          key: 'users',
          object: { __type: 'Pointer', className: '_Role', objectId: 'test-role-id' },
        },
      });
    });
  });

  describe('#getRoles', function () {
    it('should query relation with roles', async function () {
      adapters.responses.push({ body: { results: [] } });
      await ref.getRoles();
      const req = adapters.requests.pop();
      req.path.should.eql(`${API_VERSION}/classes/_Role`);
      JSON.parse(req.query.where as string).should.eql({
        $relatedTo: {
          key: 'roles',
          object: { __type: 'Pointer', className: '_Role', objectId: 'test-role-id' },
        },
      });
    });
  });
});

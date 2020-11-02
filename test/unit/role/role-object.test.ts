import 'should';
import { adapters } from '../../test-adapters';
import { App } from '../../../src/app';
import { RoleObjectRef, RoleObject } from '../../../src/role';
import { UserObjectRef, UserObject } from '../../../src/user';

const app = new App({
  appId: 'test-app-id',
  appKey: 'test-app-key',
  serverURL: 'test-server-url',
});

describe('RoleObjectRef', () => {
  const ref = new RoleObjectRef(app, 'test-role-id');

  describe('#addUser', () => {
    it('should send PUT request to /roles/${objectId}', async () => {
      await ref.addUser(new UserObject(null, 'test-user-id'));
      const req = adapters.requests.pop();
      req.method.should.eql('PUT');
      req.url.should.endWith('/roles/test-role-id');
    });

    it('should add relation with UserObject | UserObjectRef', async () => {
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

    it('should add relation with Array<User | UserReference>', async () => {
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

  describe('#addRole', () => {
    it('should send PUT request to /roles/${objectId}', async () => {
      await ref.addRole(new RoleObject(null, 'test-role-id'));
      const req = adapters.requests.pop();
      req.method.should.eql('PUT');
      req.url.should.endWith('/roles/test-role-id');
    });

    it('should add relation with RoleObject | RoleObjectRef', async () => {
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

    it('should add relation with Array<RoleObject | RoleObjectRef>', async () => {
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

  describe('#removeUser', () => {
    it('should send PUT request to /roles/${objectId}', async () => {
      await ref.removeUser(new UserObject(null, 'test-user-id'));
      const req = adapters.requests.pop();
      req.method.should.eql('PUT');
      req.url.should.endWith('/roles/test-role-id');
    });

    it('should remove relation with UserObject | UserObjectRef', async () => {
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

    it('should remove relation with Array<UserObject | UserObjectRef>', async () => {
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

  describe('#removeRole', () => {
    it('should send PUT request to /roles/${objectId}', async () => {
      await ref.removeRole(new RoleObject(null, 'test-role-id'));
      const req = adapters.requests.pop();
      req.method.should.eql('PUT');
      req.url.should.endWith('/roles/test-role-id');
    });

    it('should remove relation with RoleObject | RoleObjectRef', async () => {
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

    it('should remove relation with Array<RoleObject | RoleObjectRef>', async () => {
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

  describe('#getUsers', () => {
    it('should query relation with users', async () => {
      adapters.responses.push({ body: { results: [] } });
      await ref.getUsers();
      const req = adapters.requests.pop();
      req.url.should.endWith('/classes/_User');
      JSON.parse(req.query.where as string).should.eql({
        $relatedTo: {
          key: 'users',
          object: { __type: 'Pointer', className: '_Role', objectId: 'test-role-id' },
        },
      });
    });
  });

  describe('#getRoles', () => {
    it('should query relation with roles', async () => {
      adapters.responses.push({ body: { results: [] } });
      await ref.getRoles();
      const req = adapters.requests.pop();
      req.url.should.endWith('/classes/_Role');
      JSON.parse(req.query.where as string).should.eql({
        $relatedTo: {
          key: 'roles',
          object: { __type: 'Pointer', className: '_Role', objectId: 'test-role-id' },
        },
      });
    });
  });
});

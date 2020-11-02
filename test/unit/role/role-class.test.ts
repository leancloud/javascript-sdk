import 'should';
import { adapters } from '../../test-adapters';
import { App } from '../../../src/app';
import { RoleClass, RoleObjectRef } from '../../../src/role';

describe('RoleClass', () => {
  const app = new App({
    appId: 'test-app-id',
    appKey: 'test-app-key',
    serverURL: 'test-server-url',
  });
  const Role = new RoleClass(app);

  describe('#object', () => {
    it('should return a RoleObjectRef', () => {
      const ref = Role.object('test-role-id');
      ref.should.instanceOf(RoleObjectRef);
    });

    it('check app/className/objectId', () => {
      const ref = Role.object('test-role-id');
      ref.app.should.eql(app);
      ref.className.should.eql('_Role');
      ref.objectId.should.eql('test-role-id');
    });
  });

  describe('#add', () => {
    it('should send POST request to /roles', async () => {
      adapters.responses.push({ body: { objectId: 'test-role-id' } });
      await Role.add({ name: 'test-role-name', ACL: null });
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.url.should.endWith('/roles');
    });
  });
});

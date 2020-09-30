import 'should';
import { adapters } from '../../src/utils/test-adapters';
import { App } from '../../src/app/app';
import { RoleObjectRef } from '../../src/storage/role';
import { RoleClass } from '../../src/storage/role-class';
import { API_VERSION } from '../../src/const';

describe('RoleClass', function () {
  const app = new App({
    appId: 'test-app-id',
    appKey: 'test-app-key',
    serverURL: 'test-server-url',
  });
  const Role = new RoleClass(app);

  describe('#object', function () {
    it('should return a RoleObjectRef', function () {
      const ref = Role.object('test-role-id');
      ref.should.instanceOf(RoleObjectRef);
    });

    it('check app/className/objectId', function () {
      const ref = Role.object('test-role-id');
      ref.app.should.eql(app);
      ref.className.should.eql('_Role');
      ref.objectId.should.eql('test-role-id');
    });
  });

  describe('#add', function () {
    it('should send POST request to /roles', async function () {
      adapters.responses.push({ body: { objectId: 'test-role-id' } });
      await Role.add({ name: 'test-role-name', ACL: null });
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/roles`);
    });
  });
});

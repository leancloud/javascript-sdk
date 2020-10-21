import 'should';
import { adapters } from '../../src/utils/test-adapters';
import { App } from '../../src/app/app';
import { AuthedUser, UserObject } from '../../src/user';
import { KEY_CURRENT_USER } from '../../src/const';
import { LCObject } from '../../src/object';

describe('App', function () {
  const app = new App({
    appId: 'test-app-id',
    appKey: 'test-app-key',
    serverURL: 'test-server-url',
    masterKey: 'test-master-key',
  });

  describe('constructor', function () {
    it('should set appId/appKey/serverURL/masterKey', function () {
      app.appId.should.eql('test-app-id');
      app.appKey.should.eql('test-app-key');
      app.serverURL.should.eql('test-server-url');
      app.masterKey.should.eql('test-master-key');
    });
  });

  describe('#request', function () {
    it('basic request', async function () {
      await app.request({
        method: 'POST',
        path: '/test-path',
        header: { testHeaderKey: 'testHeaderValue' },
        query: { num: 123, str: '456', bool: true },
        body: { testBodyKey: 'testBodyValue' },
      });
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.endWith('/test-path');
      req.header.testHeaderKey.should.eql('testHeaderValue');
      req.query.should.containEql({ num: '123', str: '456', bool: 'true' });
    });

    it('should set X-LC-Id and X-LC-Key headers', async function () {
      await app.request({ method: 'GET' });
      const req = adapters.requests.pop();
      req.header.should.containEql({
        'X-LC-Id': app.appId,
        'X-LC-Key': app.appKey,
      });
    });

    it('should use the masterKey when app#useMasterKey is true', async function () {
      app.useMasterKey = true;
      await app.request({ method: 'GET' });
      app.useMasterKey = false;
      const req = adapters.requests.pop();
      req.header['X-LC-Key'].should.eql(app.masterKey + ',master');
    });

    it('should use the masterKey when options.useMasterKey is true', async function () {
      await app.request({
        method: 'GET',
        options: { useMasterKey: true },
      });
      const req = adapters.requests.pop();
      req.header['X-LC-Key'].should.eql(app.masterKey + ',master');
    });

    it("should use currentUser's sessionToken", async function () {
      app.currentUser = new AuthedUser(app, '');
      app.currentUser.data = { sessionToken: 'current-user-session' };
      await app.request({ method: 'GET' });
      const req = adapters.requests.pop();
      req.header['X-LC-Session'].should.eql(app.currentUser.sessionToken);
      app.currentUser = null;
    });

    it('should use sessionToken in localStorage', async function () {
      app.storage.set(KEY_CURRENT_USER, '{"sessionToken":"stored-session"}');
      await app.request({ method: 'GET' });
      const req = adapters.requests.pop();
      req.header['X-LC-Session'].should.eql('stored-session');
      app.storage.delete(KEY_CURRENT_USER);
    });

    it('should use the sessionToken specified in options first', async function () {
      app.currentUser = new AuthedUser(app, '');
      app.currentUser.data = { sessionToken: 'current-user-session' };
      await app.request({
        method: 'GET',
        options: { sessionToken: 'high-prioirty-session' },
      });
      const req = adapters.requests.pop();
      req.header['X-LC-Session'].should.eql('high-prioirty-session');
      app.currentUser = null;
    });

    it('should throw error when status is not ok', function () {
      adapters.responses.push({
        status: 400,
        body: {
          code: 123,
          error: 'error message',
        },
      });
      return app.request({ method: 'GET' }).should.rejectedWith({
        code: 123,
        error: 'error message',
      });
    });
  });

  describe('#decode', function () {
    describe('.decode', function () {
      it('should decode Pointer', function () {
        const data = {
          __type: 'Pointer',
          className: 'Test',
          objectId: 'test-object-id',
          key: 'value',
        };
        const obj = app.decode(data) as LCObject;
        obj.should.instanceOf(LCObject);
        obj.app.should.eql(app);
        obj.className.should.eql(data.className);
        obj.objectId.should.eql(data.objectId);
        obj.data.should.eql({ key: 'value' });
      });

      it('should decode Object', function () {
        const data = {
          __type: 'Object',
          className: 'Test',
          objectId: 'test-object-id',
          key: 'value',
        };
        const obj = app.decode(data) as LCObject;
        obj.should.instanceOf(LCObject);
        obj.app.should.eql(app);
        obj.className.should.eql(data.className);
        obj.objectId.should.eql(data.objectId);
        obj.data.should.eql({ key: 'value' });
      });

      it('should decode Date', function () {
        const data = { __type: 'Date', iso: '2020-09-02T09:09:09.244Z' };
        const date = app.decode(data) as Date;
        date.should.instanceOf(Date);
        date.toISOString().should.eql(data.iso);
      });

      it('should decode Date in an array', function () {
        const data = { __type: 'Date', iso: '2020-09-02T09:09:09.244Z' };
        const [date] = app.decode([data]) as [Date];
        date.should.instanceOf(Date);
        date.toISOString().should.eql(data.iso);
      });

      it('should decode Date in a object', function () {
        const data = { __type: 'Date', iso: '2020-09-02T09:09:09.244Z' };
        const { date } = app.decode({ date: data }) as { date: Date };
        date.should.instanceOf(Date);
        date.toISOString().should.eql(data.iso);
      });
    });
  });
});

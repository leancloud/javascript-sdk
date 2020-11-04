import 'should';
import { adapters } from '../../test-adapters';
import { App } from '../../../src/app';
import { AuthedUser } from '../../../src/user';
import { KEY_CURRENT_USER } from '../../../src/const';

describe('App', () => {
  const app = new App({
    appId: 'test-app-id',
    appKey: 'test-app-key',
    serverURL: 'test-server-url',
    masterKey: 'test-master-key',
  });

  describe('constructor', () => {
    it('should set accept config', () => {
      const app = new App({
        appId: 'test-app-id',
        appKey: 'test-app-key',
        serverURL: 'test-server-url',
        masterKey: 'test-master-key',
        useMasterKey: true,
        production: false,
      });
      app.appId.should.eql('test-app-id');
      app.appKey.should.eql('test-app-key');
      app.serverURL.should.eql('test-server-url');
      app.masterKey.should.eql('test-master-key');
      app.useMasterKey.should.true();
      app.production.should.false();
    });
  });

  describe('#request', () => {
    it('should set X-LC-{Id,Key} headers', async () => {
      await app.request({ method: 'GET', path: '' });
      const req = adapters.requests.pop();
      req.header.should.containEql({
        'X-LC-Id': app.appId,
        'X-LC-Key': app.appKey,
      });
    });

    it('should use the masterKey', async () => {
      app.useMasterKey = true;
      await app.request({ method: 'GET', path: '' });
      let req = adapters.requests.pop();
      req.header['X-LC-Key'].should.eql(app.masterKey + ',master');
      app.useMasterKey = false;

      await app.request({
        method: 'GET',
        path: '',
        options: { useMasterKey: true },
      });
      req = adapters.requests.pop();
      req.header['X-LC-Key'].should.eql(app.masterKey + ',master');
    });

    describe('X-LC-Session header', () => {
      it('from options', async () => {
        await app.request({
          method: 'GET',
          path: '',
          options: { sessionToken: 'option-session' },
        });
        let req = adapters.requests.pop();
        req.header['X-LC-Session'].should.eql('option-session');
      });

      it('from #currentUser', async () => {
        app.currentUser = new AuthedUser(null, '');
        app.currentUser.data = { sessionToken: 'current-user-session' };
        await app.request({ method: 'GET', path: '' });
        const req = adapters.requests.pop();
        req.header['X-LC-Session'].should.eql(app.currentUser.sessionToken);
        app.currentUser = null;
      });

      it('from #storage', async function () {
        app.storage.set(KEY_CURRENT_USER, '{"sessionToken":"storage-session"}');
        await app.request({ method: 'GET', path: '' });
        const req = adapters.requests.pop();
        req.header['X-LC-Session'].should.eql('storage-session');
        app.storage.delete(KEY_CURRENT_USER);
      });

      it('priority should be given to options', async () => {
        app.currentUser = new AuthedUser(null, '');
        app.currentUser.data = { sessionToken: 'current-user-session' };
        app.storage.set(KEY_CURRENT_USER, '{"sessionToken":"stored-session"}');
        await app.request({
          method: 'GET',
          path: '',
          options: { sessionToken: 'option-session' },
        });
        const req = adapters.requests.pop();
        req.header['X-LC-Session'].should.eql('option-session');
        app.currentUser = null;
        app.storage.delete(KEY_CURRENT_USER);
      });
    });

    it('should set X-LC-Prod header', async () => {
      app.production = false;
      await app.request({ method: 'GET', path: '' });
      const req = adapters.requests.pop();
      req.header['X-LC-Prod'].should.eql('0');
      app.production = true;
    });

    it('should throw error when status is not ok', () => {
      adapters.responses.push({
        status: 400,
        body: {
          code: 123,
          error: 'error message',
        },
      });
      return app
        .request({
          method: 'GET',
          path: '',
        })
        .should.rejectedWith({
          code: 123,
          error: 'error message',
        });
    });
  });
});

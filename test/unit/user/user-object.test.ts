import 'should';
import { adapters } from '../../test-adapters';
import { App } from '../../../src/app';
import { UserObject, UserObjectRef, CurrentUserManager, AuthedUser } from '../../../src/user';
import { API_VERSION, KEY_CURRENT_USER } from '../../../src/const';
import { lcEncode } from '../../../src/object';

const app = new App({
  appId: 'test-app-id',
  appKey: 'test-app-key',
  serverURL: 'test-server-url',
});

describe('CurrentUser', function () {
  describe('.set', function () {
    it("should set current user's data into localStorage", function () {
      const user = new AuthedUser(app, 'test-user-id');
      user.data = { key: 'value' };
      CurrentUserManager.set(app, user);
      const userKV = app.storage.get(KEY_CURRENT_USER);
      JSON.parse(userKV).should.containEql({
        objectId: user.objectId,
        key: 'value',
      });
    });
  });

  describe('.get', function () {
    it('should get user data from localStorage', function () {
      app.storage.delete(KEY_CURRENT_USER);
      app.currentUser = null;
      const user = new AuthedUser(app, 'test-user-id');
      user.data = { key: 'value' };
      app.storage.set(KEY_CURRENT_USER, JSON.stringify(lcEncode(user, { full: true })));
      CurrentUserManager.get(app).data.should.eql(user.data);
    });

    it('should get user data into app#currentUser', function () {
      app.storage.delete(KEY_CURRENT_USER);
      app.currentUser = null;
      const user = new AuthedUser(app, 'test-user-id');
      user.data = { key: 'value' };
      app.currentUser = user;
      CurrentUserManager.get(app).should.eql(user);
    });
  });

  describe('.remove', function () {
    it('should remove user data from localStorage', function () {
      app.storage.set(KEY_CURRENT_USER, 'data');
      CurrentUserManager.remove(app);
      (!app.storage.get(KEY_CURRENT_USER)).should.true();
    });

    it('should set app#currentUser null', function () {
      const user = new AuthedUser(app, 'test-user-id');
      app.currentUser = user;
      CurrentUserManager.remove(app);
      (app.currentUser === null).should.true();
    });
  });

  describe('.syncData', function () {
    it('should modify user data in localStorage', function () {
      const user = new UserObject(app, 'test-user-id');
      user.data = { key: 'value' };
      CurrentUserManager.set(app, user);
      CurrentUserManager.syncData(app, (data) => (data.key = 'modified'));
      CurrentUserManager.get(app).data.key.should.eql('modified');
    });

    it('should prevent store password', function () {
      const user = new UserObject(app, 'test-user-id');
      user.data = { key: 'value' };
      CurrentUserManager.set(app, user);
      CurrentUserManager.syncData(app, (userKV) => (userKV.password = 'secret'));
      (!CurrentUserManager.get(app).data.password).should.true();
    });
  });
});

describe('UserReference', function () {
  const ref = new UserObjectRef(app, 'test-user-id');
  describe('#ACLKey', function () {
    it("should return user's objectId", function () {
      ref.aclKey.should.eql(ref.objectId);
    });
  });

  describe('#get', function () {
    it('should return a User', async function () {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      (await ref.get()).should.instanceOf(UserObject);
    });
  });

  describe('#update', function () {
    it('should return a User', async function () {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      (await ref.update({})).should.instanceOf(UserObject);
    });
  });
});

describe('AuthedUser', function () {
  describe('#isAuthenticated', function () {
    it('should send GET request to /users/me', async function () {
      const user = new AuthedUser(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      await user.isAuthenticated();
      const req = adapters.requests.pop();
      req.method.should.eql('GET');
      req.path.should.eql(`${API_VERSION}/users/me`);
    });

    it("should send user's sessionToken", async function () {
      const user = new AuthedUser(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      await user.isAuthenticated();
      const req = adapters.requests.pop();
      req.header['X-LC-Session'].should.eql(user.sessionToken);
    });

    it('should return false when error code is 211', async function () {
      const user = new AuthedUser(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      adapters.responses.push({ status: 400, body: { code: 211, error: '' } });
      (await user.isAuthenticated()).should.false();
    });

    it('should throw error when error code is not 211', function () {
      const user = new AuthedUser(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      adapters.responses.push({ status: 400, body: { code: 123, error: '' } });
      return user.isAuthenticated().should.rejected();
    });
  });

  describe('#updatePassword', function () {
    it('should send PUT request to /users/${objectId}/updatePassword', async function () {
      const user = new AuthedUser(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      await user.updatePassword('old-password', 'new-password');
      const req = adapters.requests.pop();
      req.method.should.eql('PUT');
      req.path.should.eql(`${API_VERSION}/users/test-user-id/updatePassword`);
    });

    it('check password and sessionToken', async function () {
      const user = new AuthedUser(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      await user.updatePassword('old-password', 'new-password');
      const req = adapters.requests.pop();
      req.header['X-LC-Session'].should.eql('test-session-token');
      req.body.should.eql({
        old_password: 'old-password',
        new_password: 'new-password',
      });
    });

    it('should update sessionToken', async function () {
      const user = new AuthedUser(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      adapters.responses.push({ body: { sessionToken: 'new-session-token' } });
      await user.updatePassword('old-password', 'new-password');
      user.sessionToken.should.eql('new-session-token');
    });
  });

  describe('#associateWithAuthData', function () {
    it('should update authData[platform]', async function () {
      const user = new AuthedUser(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await user.associateWithAuthData('platform', { key: 'value' });
      const req = adapters.requests.pop();
      req.body.should.eql({ authData: { platform: { key: 'value' } } });
    });
  });

  describe('#dissociateAuthData', function () {
    it('should send delete operation with authData[platform]', async function () {
      const user = new AuthedUser(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await user.dissociateAuthData('platform');
      const req = adapters.requests.pop();
      req.body.should.eql({
        'authData.platform': { __op: 'Delete' },
      });
    });
  });

  describe('#signUp', function () {
    it('should throw error when user is not anonymous', function () {
      const user = new AuthedUser(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      return user.signUp({}).should.rejected();
    });

    it('should remove anonymous id when user is current', async function () {
      const user = new AuthedUser(app, 'test-user-id');
      user.data = { authData: { anonymous: { id: 'anonymous-id' } } };
      CurrentUserManager.set(app, user);
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await user.signUp({ username: 'name', password: 'secret' });
      CurrentUserManager.get(app).isAnonymous().should.false();
    });
  });

  describe('#refreshSessionToken', function () {
    it('should send PUT request to /users/${objectId}/refreshSessionToken', async function () {
      const user = new AuthedUser(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      await user.refreshSessionToken();
      const req = adapters.requests.pop();
      req.method.should.eql('PUT');
      req.path.should.eql(`${API_VERSION}/users/test-user-id/refreshSessionToken`);
    });

    it('should update sessionToken', async function () {
      const user = new AuthedUser(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      app.currentUser = user;
      adapters.responses.push({ body: { sessionToken: 'new-session-token' } });
      await user.refreshSessionToken();
      user.sessionToken.should.eql('new-session-token');
      app.currentUser = null;
      app.getSessionToken().should.eql('new-session-token');
    });
  });
});

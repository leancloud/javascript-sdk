import 'should';
import { adapters } from '../../src/utils/test-adapters';
import { App } from '../../src/app/app';
import { UserObject, UserObjectRef, CurrentUserManager } from '../../src/storage/user';
import { API_VERSION, KEY_CURRENT_USER } from '../../src/const';
import { Encoder } from '../../src/storage/object';

const app = new App({
  appId: 'test-app-id',
  appKey: 'test-app-key',
  serverURL: 'test-server-url',
});

describe('CurrentUser', function () {
  describe('.set', function () {
    it("should set current user's data into localStorage", function () {
      const user = new UserObject(app, 'test-user-id');
      user.data = { key: 'value' };
      CurrentUserManager.set(app, user);
      const userKV = app.storage.get(KEY_CURRENT_USER);
      JSON.parse(userKV).should.containEql({
        objectId: user.objectId,
        key: 'value',
      });
    });

    it("should set current user' data into app#currentUser", function () {
      app.currentUser = null;
      const user = new UserObject(app, 'test-user-id');
      user.data = { key: 'value' };
      CurrentUserManager.set(app, user);
      app.currentUser.should.eql(user);
    });
  });

  describe('.get', function () {
    it('should get user data from localStorage', function () {
      app.storage.delete(KEY_CURRENT_USER);
      app.currentUser = null;
      const user = new UserObject(app, 'test-user-id');
      user.data = { key: 'value' };
      app.storage.set(KEY_CURRENT_USER, JSON.stringify(Encoder.encode(user, true)));
      CurrentUserManager.get(app).should.eql(user);
    });

    it('should get user data into app#currentUser', function () {
      app.storage.delete(KEY_CURRENT_USER);
      app.currentUser = null;
      const user = new UserObject(app, 'test-user-id');
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
      const user = new UserObject(app, 'test-user-id');
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

describe('UserReferenct', function () {
  const ref = new UserObjectRef(app, 'test-user-id');
  describe('#ACLKey', function () {
    it("should return user's objectId", function () {
      ref.aclKey.should.eql(ref.objectId);
    });
  });

  describe('#isCurrent', function () {
    it('should return true when currentUser#objectId === ref#objectId', function () {
      const user = new UserObject(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      CurrentUserManager.set(app, user);
      ref.isCurrent().should.true();
    });
  });

  describe('#get', function () {
    it('should return a User', async function () {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      (await ref.get()).should.instanceOf(UserObject);
    });

    it('should sync current user when UserReference#isCurrent return true', async function () {
      const user = new UserObject(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token', key: 'value' };
      CurrentUserManager.set(app, user);

      adapters.responses.push({
        body: {
          objectId: 'test-user-id',
          key: 'value2',
        },
      });
      await ref.get();
      CurrentUserManager.get(app).data.key.should.eql('value2');
    });
  });

  describe('#update', function () {
    it('should return a User', async function () {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      (await ref.update({})).should.instanceOf(UserObject);
    });

    it('should sync current user when ref#isCurrent return true', async function () {
      const user = new UserObject(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token', key: 'value' };
      CurrentUserManager.set(app, user);

      adapters.responses.push({
        body: {
          objectId: 'test-user-id',
          key: 'value2',
        },
      });
      await ref.update({});
      CurrentUserManager.get(app).data.key.should.eql('value2');
    });
  });

  describe('#delete', function () {
    it('should remove current user when UserReference#isCurrent return true', async function () {
      const user = new UserObject(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token', key: 'value' };
      CurrentUserManager.set(app, user);

      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await ref.delete();
      (!CurrentUserManager.get(app)).should.true();
    });
  });
});

describe('User', function () {
  describe('#isCurrent', function () {
    it("should return true when User#_anonymousId is equal to current user's", function () {
      const currentUser = new UserObject(app, null);
      currentUser.data = { authData: { anonymous: { id: 'test-anonymous-id' } } };
      CurrentUserManager.set(app, currentUser);

      const user = new UserObject(app, null);
      user.data = { authData: { anonymous: { id: 'test-anonymous-id' } } };
      user.isCurrent().should.true();
    });
  });

  describe('#isAuthenticated', function () {
    it('should send GET request to /users/me', async function () {
      const user = new UserObject(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      await user.isAuthenticated();
      const req = adapters.requests.pop();
      req.method.should.eql('GET');
      req.path.should.eql(`${API_VERSION}/users/me`);
    });

    it("should send user's sessionToken", async function () {
      const user = new UserObject(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      await user.isAuthenticated();
      const req = adapters.requests.pop();
      req.header['X-LC-Session'].should.eql(user.sessionToken);
    });

    it('should return false when error code is 211', async function () {
      const user = new UserObject(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      adapters.responses.push({ status: 400, body: { code: 211, error: '' } });
      (await user.isAuthenticated()).should.false();
    });

    it('should throw error when error code is not 211', function () {
      const user = new UserObject(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      adapters.responses.push({ status: 400, body: { code: 123, error: '' } });
      return user.isAuthenticated().should.rejected();
    });
  });

  describe('#updatePassword', function () {
    it('should send PUT request to /users/${objectId}/updatePassword', async function () {
      const user = new UserObject(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      await user.updatePassword('old-password', 'new-password');
      const req = adapters.requests.pop();
      req.method.should.eql('PUT');
      req.path.should.eql(`${API_VERSION}/users/test-user-id/updatePassword`);
    });

    it('check password and sessionToken', async function () {
      const user = new UserObject(app, 'test-user-id');
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
      const user = new UserObject(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      adapters.responses.push({ body: { sessionToken: 'new-session-token' } });
      await user.updatePassword('old-password', 'new-password');
      user.sessionToken.should.eql('new-session-token');
    });

    it("should update currentUser's sessionToken when user is current", async function () {
      const currentUser = new UserObject(app, 'test-user-id');
      currentUser.data = { sessionToken: 'test-session-token' };
      CurrentUserManager.set(app, currentUser);

      adapters.responses.push({ body: { sessionToken: 'new-session-token' } });
      const user = new UserObject(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      await user.updatePassword('old-password', 'new-password');

      CurrentUserManager.get(app).sessionToken.should.eql('new-session-token');
    });
  });

  describe('#associateWithAuthData', function () {
    it('should update authData[platform]', async function () {
      const user = new UserObject(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await user.associateWithAuthData('platform', { key: 'value' });
      const req = adapters.requests.pop();
      req.body.should.eql({ authData: { platform: { key: 'value' } } });
    });
  });

  describe('#dissociateAuthData', function () {
    it('should send delete operation with authData[platform]', async function () {
      const user = new UserObject(app, 'test-user-id');
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
      const user = new UserObject(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      return user.signUp({}).should.rejected();
    });

    it('should remove anonymous id when user is current', async function () {
      const user = new UserObject(app, 'test-user-id');
      user.data = { authData: { anonymous: { id: 'anonymous-id' } } };
      CurrentUserManager.set(app, user);
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await user.signUp({ username: 'name', password: 'secret' });
      CurrentUserManager.get(app).isAnonymous().should.false();
    });
  });

  describe('#refreshSessionToken', function () {
    it('should send PUT request to /users/${objectId}/refreshSessionToken', async function () {
      const user = new UserObject(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      await user.refreshSessionToken();
      const req = adapters.requests.pop();
      req.method.should.eql('PUT');
      req.path.should.eql(`${API_VERSION}/users/test-user-id/refreshSessionToken`);
    });

    it('should update sessionToken', async function () {
      const user = new UserObject(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      adapters.responses.push({ body: { sessionToken: 'new-session-token' } });
      await user.refreshSessionToken();
      user.sessionToken.should.eql('new-session-token');
    });

    it("should update currentUser's sessionToken when user is current", async function () {
      const currentUser = new UserObject(app, 'test-user-id');
      currentUser.data = { sessionToken: 'test-session-token' };
      CurrentUserManager.set(app, currentUser);

      adapters.responses.push({ body: { sessionToken: 'new-session-token' } });
      const user = new UserObject(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      await user.refreshSessionToken();

      CurrentUserManager.get(app).sessionToken.should.eql('new-session-token');
    });
  });

  describe('#follow', function () {
    it('should send POST request to /users/${userId}/friendship/${targetId}', async function () {
      const user = new UserObject(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      await user.follow('target-id');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/users/test-user-id/friendship/target-id`);
    });
  });

  describe('#unfollow', function () {
    it('should send DELETE request to /users/${userId}/friendship/${targetId}', async function () {
      const user = new UserObject(app, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      await user.unfollow('target-id');
      const req = adapters.requests.pop();
      req.method.should.eql('DELETE');
      req.path.should.eql(`${API_VERSION}/users/test-user-id/friendship/target-id`);
    });
  });
});

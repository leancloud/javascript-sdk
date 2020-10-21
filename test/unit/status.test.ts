import * as should from 'should';
import { adapters } from '../test-adapters';
import { App } from '../../src/app';
import { StatusQuery, StatusClass } from '../../src/status';
import { CurrentUserManager, UserObject, UserObjectRef } from '../../src/user';
import { API_VERSION } from '../../src/const';

const app = new App({
  appId: 'test-app-id',
  appKey: 'test-app-key',
  serverURL: 'test-server-url',
});

describe('StatusQuery', function () {
  const query = new StatusQuery(app);

  describe('#whereStatusOwner', function () {
    it('should accept string id param', async function () {
      await query.whereStatusOwner('test-user-id').find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({
        source: { __type: 'Pointer', className: '_User', objectId: 'test-user-id' },
      });
    });

    it('should accept UserObject', async function () {
      await query.whereStatusOwner(new UserObject(null, 'test-user-id')).find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({
        source: { __type: 'Pointer', className: '_User', objectId: 'test-user-id' },
      });
    });

    it('should accept UserObjectRef', async function () {
      await query.whereStatusOwner(new UserObjectRef(null, 'test-user-id')).find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({
        source: { __type: 'Pointer', className: '_User', objectId: 'test-user-id' },
      });
    });
  });

  describe('#whereInboxOwner', function () {
    it('should throw error when user has no sessionToken', function () {
      should.throws(() => query.whereInboxOwner(new UserObject(null, 'test-user-id')));
    });

    it('check query condition', async function () {
      const user = new UserObject(null, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      await query.whereInboxOwner(user).find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.owner as string).should.eql({
        __type: 'Pointer',
        className: '_User',
        objectId: 'test-user-id',
      });
    });
  });

  it('#whereInboxType', async function () {
    const user = new UserObject(null, 'test-user-id');
    user.data = { sessionToken: 'test-session-token' };
    await query.whereInboxOwner(user).whereInboxType('test-inbox-type').find();
    const req = adapters.requests.pop();
    req.query.inboxType.should.eql('test-inbox-type');
  });

  it('#whereSinceId', async function () {
    const user = new UserObject(null, 'test-user-id');
    user.data = { sessionToken: 'test-session-token' };
    await query.whereInboxOwner(user).whereSinceId(123).find();
    const req = adapters.requests.pop();
    req.query.sinceId.should.eql('123');
  });

  it('#whereMaxId', async function () {
    const user = new UserObject(null, 'test-user-id');
    user.data = { sessionToken: 'test-session-token' };
    await query.whereInboxOwner(user).whereMaxId(456).find();
    const req = adapters.requests.pop();
    req.query.maxId.should.eql('456');
  });

  describe('#find', function () {
    it('should send GET request to /subscribe/statuses when inboxOwner is set', async function () {
      const user = new UserObject(null, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      await query.whereInboxOwner(user).find();
      const req = adapters.requests.pop();
      req.method.should.eql('GET');
      req.path.should.eql(`${API_VERSION}/subscribe/statuses`);
    });

    it('should throw error when set both statusOwner and inboxOwner', function () {
      const user = new UserObject(null, 'test-user-id');
      user.data = { sessionToken: 'test-session-token' };
      return query.whereInboxOwner(user).whereStatusOwner(user).find().should.rejected();
    });
  });
});

describe('StatusClass', function () {
  const Status = new StatusClass(app);

  beforeEach(() => {
    const currentUser = new UserObject(app, 'test-user-id');
    currentUser.data = { sessionToken: 'test-session-token' };
    CurrentUserManager.set(app, currentUser);
  });

  describe('#sendToFollowers', function () {
    it('should throw error when no current user', function () {
      CurrentUserManager.remove(app);
      return Status.sendToFollowers({}).should.rejected();
    });

    it('should send POST requests to /statuses', async function () {
      adapters.responses.push({ body: { objectId: 'test-status-id' } });
      await Status.sendToFollowers({});
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/statuses`);
    });

    it('should add "source" to the status data', async function () {
      adapters.responses.push({ body: { objectId: 'test-status-id' } });
      await Status.sendToFollowers({});
      const req = adapters.requests.pop();
      req.body['data'].should.containEql({
        source: app.currentUser.toPointer(),
      });
    });

    it('should send to all followers', async function () {
      adapters.responses.push({ body: { objectId: 'test-status-id' } });
      await Status.sendToFollowers({});
      const req = adapters.requests.pop();
      req.body['query'].should.containEql({
        className: '_Follower',
        keys: 'follower',
        where: { user: app.currentUser.toPointer() },
      });
    });

    it('check options', async function () {
      adapters.responses.push({ body: { objectId: 'test-status-id' } });
      await Status.sendToFollowers({}, { inboxType: 'test-inbox-type' });
      const req = adapters.requests.pop();
      req.body['inboxType'].should.eql('test-inbox-type');
    });
  });

  describe('#sendToUser', async function () {
    it('should throw error when no current user', function () {
      CurrentUserManager.remove(app);
      const target = new UserObject(null, 'test-user-2');
      return Status.sendToUser(target, {}).should.rejected();
    });

    it('should send POST requests to /statuses', async function () {
      const target = new UserObject(null, 'test-user-2');
      adapters.responses.push({ body: { objectId: 'test-status-id' } });
      await Status.sendToUser(target, {});
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/statuses`);
    });

    it('should add "source" to the status data', async function () {
      const target = new UserObject(null, 'test-user-2');
      adapters.responses.push({ body: { objectId: 'test-status-id' } });
      await Status.sendToUser(target, {});
      const req = adapters.requests.pop();
      req.body['data'].should.containEql({
        source: app.currentUser.toPointer(),
      });
    });

    it('should send to specified user', async function () {
      const target = new UserObject(null, 'test-user-2');
      adapters.responses.push({ body: { objectId: 'test-status-id' } });
      await Status.sendToUser(target, {});
      const req = adapters.requests.pop();
      req.body['query'].should.containEql({
        className: '_User',
        where: { objectId: target.objectId },
      });
    });

    it('check options', async function () {
      const target = new UserObject(null, 'test-user-2');
      adapters.responses.push({ body: { objectId: 'test-status-id' } });
      await Status.sendToUser(target, {}, { inboxType: 'test-inbox-type' });
      const req = adapters.requests.pop();
      req.body['inboxType'].should.eql('test-inbox-type');
    });
  });

  describe('#deleteInboxStatus', function () {
    it('should throw error when no current user', function () {
      CurrentUserManager.remove(app);
      return Status.deleteInboxStatus(123).should.rejected();
    });

    it('should send DELETE request to /subscribe/statuses/inbox', async function () {
      await Status.deleteInboxStatus(123);
      const req = adapters.requests.pop();
      req.method.should.eql('DELETE');
      req.path.should.eql(`${API_VERSION}/subscribe/statuses/inbox`);
    });

    it('check owner and messageId', async function () {
      await Status.deleteInboxStatus(123);
      const req = adapters.requests.pop();
      req.query.should.containEql({
        owner: JSON.stringify(app.currentUser.toPointer()),
        messageId: '123',
      });
    });

    it('check options', async function () {
      await Status.deleteInboxStatus(123, { inboxType: 'test-inbox-type' });
      const req = adapters.requests.pop();
      req.query.should.containEql({
        inboxType: 'test-inbox-type',
      });
    });
  });

  describe('#getUnreadCount', function () {
    it('should throw error when no current user', function () {
      CurrentUserManager.remove(app);
      return Status.getUnreadCount().should.rejected();
    });

    it('should send GET request to /subscribe/statuses/count', async function () {
      await Status.getUnreadCount();
      const req = adapters.requests.pop();
      req.method.should.eql('GET');
      req.path.should.eql(`${API_VERSION}/subscribe/statuses/count`);
    });

    it('check owner', async function () {
      await Status.deleteInboxStatus(123);
      const req = adapters.requests.pop();
      req.query.should.containEql({
        owner: JSON.stringify(app.currentUser.toPointer()),
        messageId: '123',
      });
    });

    it('check options', async function () {
      await Status.deleteInboxStatus(123, { inboxType: 'test-inbox-type' });
      const req = adapters.requests.pop();
      req.query.should.containEql({ inboxType: 'test-inbox-type' });
    });
  });

  describe('#resetUnreadCount', function () {
    it('should throw error when no current user', function () {
      CurrentUserManager.remove(app);
      return Status.resetUnreadCount().should.rejected();
    });

    it('should send POST request to /subscribe/statuses/resetUnreadCount', async function () {
      const owner = new UserObject(null, 'test-user-id');
      owner.data = { sessionToken: 'test-session-token' };
      await Status.resetUnreadCount(owner);
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/subscribe/statuses/resetUnreadCount`);
    });

    it('check owner', async function () {
      const owner = new UserObject(null, 'test-user-id');
      owner.data = { sessionToken: 'test-session-token' };
      await Status.resetUnreadCount(owner);
      const req = adapters.requests.pop();
      req.query.owner.should.eql(JSON.stringify(owner.toPointer()));
      req.header['X-LC-Session'].should.eql(owner.sessionToken);
    });

    it('check options', async function () {
      await Status.resetUnreadCount({ inboxType: 'test-inbox-type' });
      const req = adapters.requests.pop();
      req.query.should.containEql({ inboxType: 'test-inbox-type' });
    });
  });
});

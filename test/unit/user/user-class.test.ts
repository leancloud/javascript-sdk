import 'should';
import { adapters } from '../../../src/utils/test-adapters';
import { App } from '../../../src/app';
import { UserClass, UserObject, UserObjectRef } from '../../../src/user';
import { API_VERSION } from '../../../src/const';

describe('UserClass', function () {
  const app = new App({
    appId: 'test-app-id',
    appKey: 'test-app-key',
    serverURL: 'test-server-url',
  });
  const _User = new UserClass(app);

  describe('#object', function () {
    it('should return a UserObjectRef', function () {
      const userRef = _User.object('test-user-id');
      userRef.should.instanceOf(UserObjectRef);
      userRef.objectId.should.eql('test-user-id');
      userRef.app.should.eql(app);
    });
  });

  describe('#become', function () {
    it('should send GET request to /users/me', async function () {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await _User.become('test-session-token');
      const req = adapters.requests.pop();
      req.method.should.eql('GET');
      req.path.should.eql(`${API_VERSION}/users/me`);
    });

    it('should use specified sessionToken', async function () {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await _User.become('test-session-token');
      const req = adapters.requests.pop();
      req.header['X-LC-Session'].should.eql('test-session-token');
    });

    it('should decode response to a UserObject', async function () {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      const user = await _User.become('test-session-token');
      user.should.instanceOf(UserObject);
      user.objectId.should.eql('test-user-id');
      user.app.should.eql(_User.app);
    });

    it('should set currentUser', async function () {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      const user = await _User.become('test-session-token');
      user.should.eql(_User.current());
    });
  });

  describe('#signUp', function () {
    it('should send POST request to /users', async function () {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await _User.signUp({});
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/users`);
    });

    it('should remove reserved keys', async function () {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await _User.signUp({
        objectId: '-',
        createdAt: '-',
        updatedAt: '-',
      });
      const req = adapters.requests.pop();
      req.body.should.eql({});
    });
  });

  describe('#signUpOrLoginWithMobilePhone', function () {
    it('should send POST request to /usersByMobilePhone', async function () {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await _User.signUpOrLoginWithMobilePhone({
        mobilePhoneNumber: 'test-phone',
        smsCode: 'test-sms-code',
      });
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/usersByMobilePhone`);
    });

    it('should remove reserved keys', async function () {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await _User.signUpOrLoginWithMobilePhone({
        mobilePhoneNumber: 'test-phone',
        smsCode: 'test-sms-code',
        objectId: '-',
        createdAt: '-',
        updatedAt: '-',
      });
      const req = adapters.requests.pop();
      req.body.should.eql({ mobilePhoneNumber: 'test-phone', smsCode: 'test-sms-code' });
    });
  });

  describe('#logInWithData', function () {
    it('should send POST request to /login', async function () {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await _User.loginWithData({});
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/login`);
    });

    it('should remove reserved keys', async function () {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await _User.loginWithData({});
      const req = adapters.requests.pop();
      req.body.should.eql({});
    });
  });

  describe('#logInWithAuthData', function () {
    it('should send POST request to /users', async function () {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await _User.loginWithAuthData('test-platform', { key: 'value' });
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/users`);
    });

    it('check data and options', async function () {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await _User.loginWithAuthData('test-platform', { key: 'value' }, { failOnNotExist: true });
      const req = adapters.requests.pop();
      req.body.should.eql({
        authData: { 'test-platform': { key: 'value' } },
      });
      req.query.failOnNotExist.should.eql('true');
    });
  });

  describe('#requestEmailVerify', function () {
    it('should send POST request to /requestEmailVerify', async function () {
      await _User.requestEmailVerify('test-email');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/requestEmailVerify`);
    });

    it('check email', async function () {
      await _User.requestEmailVerify('test-email');
      const req = adapters.requests.pop();
      req.body.should.eql({ email: 'test-email' });
    });
  });

  describe('#requestLoginSMSCode', function () {
    it('should send POST request to /requestLoginSmsCode', async function () {
      await _User.requestLoginSMSCode('test-phone-number');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/requestLoginSmsCode`);
    });

    it('check phone number and options', async function () {
      await _User.requestLoginSMSCode('test-phone-number', { validateToken: 'test-token' });
      const req = adapters.requests.pop();
      req.body.should.eql({
        mobilePhoneNumber: 'test-phone-number',
        validate_token: 'test-token',
      });
    });
  });

  describe('#requestMobilePhoneVerify', function () {
    it('should send POST request to /requestMobilePhoneVerify', async function () {
      await _User.requestMobilePhoneVerify('test-phone-number');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/requestMobilePhoneVerify`);
    });

    it('check phone number and options', async function () {
      await _User.requestMobilePhoneVerify('test-phone-number', { validateToken: 'test-token' });
      const req = adapters.requests.pop();
      req.body.should.eql({
        mobilePhoneNumber: 'test-phone-number',
        validate_token: 'test-token',
      });
    });
  });

  describe('#requestPasswordReset', function () {
    it('should send POST request to /requestPasswordReset', async function () {
      await _User.requestPasswordReset('test-email');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/requestPasswordReset`);
    });

    it('check email', async function () {
      await _User.requestPasswordReset('test-email');
      const req = adapters.requests.pop();
      req.body.should.eql({ email: 'test-email' });
    });
  });

  describe('#requestPasswordResetBySMSCode', function () {
    it('should send POST request to /requestPasswordResetBySmsCode', async function () {
      await _User.requestPasswordResetBySMSCode('test-phone-number');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/requestPasswordResetBySmsCode`);
    });

    it('check phone number and options', async function () {
      await _User.requestPasswordResetBySMSCode('test-phone-number', {
        validateToken: 'test-token',
      });
      const req = adapters.requests.pop();
      req.body.should.eql({
        mobilePhoneNumber: 'test-phone-number',
        validate_token: 'test-token',
      });
    });
  });

  describe('#resetPasswordBySMSCode', function () {
    it('should send PUT request to /resetPasswordBySmsCode/${code}', async function () {
      await _User.resetPasswordBySMSCode('test-code', 'test-password');
      const req = adapters.requests.pop();
      req.method.should.eql('PUT');
      req.path.should.eql(`${API_VERSION}/resetPasswordBySmsCode/test-code`);
    });

    it('check password', async function () {
      await _User.resetPasswordBySMSCode('test-code', 'test-password');
      const req = adapters.requests.pop();
      req.body.should.eql({ password: 'test-password' });
    });
  });

  describe('#verifyMobilePhone', function () {
    it('should send POST request to /verifyMobilePhone/${code}', async function () {
      await _User.verifyMobilePhone('test-code');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/verifyMobilePhone/test-code`);
    });
  });

  describe('#requestChangePhoneNumber', function () {
    it('should send POST request to /requestChangePhoneNumber', async function () {
      await _User.requestChangePhoneNumber('test-phone-number');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/requestChangePhoneNumber`);
    });

    it('check phone number and options', async function () {
      await _User.requestChangePhoneNumber('test-phone-number', { ttl: 123 });
      const req = adapters.requests.pop();
      req.body.should.eql({
        mobilePhoneNumber: 'test-phone-number',
        ttl: 123,
      });
    });
  });

  describe('#changePhoneNumber', async function () {
    it('should send POST request to /changePhoneNumber', async function () {
      await _User.changePhoneNumber('test-phone-number', 'test-code');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/changePhoneNumber`);
    });

    it('check phone number and code', async function () {
      await _User.changePhoneNumber('test-phone-number', 'test-code');
      const req = adapters.requests.pop();
      req.body.should.eql({
        mobilePhoneNumber: 'test-phone-number',
        code: 'test-code',
      });
    });
  });
});

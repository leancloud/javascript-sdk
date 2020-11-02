import 'should';
import { adapters } from '../../test-adapters';
import { App } from '../../../src/app';
import { UserClass, UserObject, UserObjectRef } from '../../../src/user';

describe('UserClass', () => {
  const app = new App({
    appId: 'test-app-id',
    appKey: 'test-app-key',
    serverURL: 'test-server-url',
  });
  const _User = new UserClass(app);

  describe('#object', () => {
    it('should return a UserObjectRef', () => {
      const userRef = _User.object('test-user-id');
      userRef.should.instanceOf(UserObjectRef);
      userRef.objectId.should.eql('test-user-id');
      userRef.app.should.eql(app);
    });
  });

  describe('#become', () => {
    it('should send GET request to /users/me', async () => {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await _User.become('test-session-token');
      const req = adapters.requests.pop();
      req.method.should.eql('GET');
      req.url.should.endWith('/users/me');
    });

    it('should use specified sessionToken', async () => {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await _User.become('test-session-token');
      const req = adapters.requests.pop();
      req.header['X-LC-Session'].should.eql('test-session-token');
    });

    it('should decode response to a UserObject', async () => {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      const user = await _User.become('test-session-token');
      user.should.instanceOf(UserObject);
      user.objectId.should.eql('test-user-id');
      user.app.should.eql(_User.app);
    });

    it('should set currentUser', async () => {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      const user = await _User.become('test-session-token');
      user.should.eql(_User.current());
    });
  });

  describe('#signUp', () => {
    it('should send POST request to /users', async () => {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await _User.signUp({});
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.url.should.endWith('/users');
    });

    it('should remove reserved keys', async () => {
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

  describe('#signUpOrLoginWithMobilePhone', () => {
    it('should send POST request to /usersByMobilePhone', async () => {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await _User.signUpOrLoginWithMobilePhone({
        mobilePhoneNumber: 'test-phone',
        smsCode: 'test-sms-code',
      });
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.url.should.endWith('/usersByMobilePhone');
    });

    it('should remove reserved keys', async () => {
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

  describe('#logInWithData', () => {
    it('should send POST request to /login', async () => {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await _User.loginWithData({});
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.url.should.endWith('/login');
    });

    it('should remove reserved keys', async () => {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await _User.loginWithData({});
      const req = adapters.requests.pop();
      req.body.should.eql({});
    });
  });

  describe('#logInWithAuthData', () => {
    it('should send POST request to /users', async () => {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await _User.loginWithAuthData('test-platform', { key: 'value' });
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.url.should.endWith('/users');
    });

    it('check data and options', async () => {
      adapters.responses.push({ body: { objectId: 'test-user-id' } });
      await _User.loginWithAuthData('test-platform', { key: 'value' }, { failOnNotExist: true });
      const req = adapters.requests.pop();
      req.body.should.eql({
        authData: { 'test-platform': { key: 'value' } },
      });
      req.query.failOnNotExist.should.eql('true');
    });
  });

  describe('#requestEmailVerify', () => {
    it('should send POST request to /requestEmailVerify', async () => {
      await _User.requestEmailVerify('test-email');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.url.should.endWith('/requestEmailVerify');
    });

    it('check email', async () => {
      await _User.requestEmailVerify('test-email');
      const req = adapters.requests.pop();
      req.body.should.eql({ email: 'test-email' });
    });
  });

  describe('#requestLoginSMSCode', () => {
    it('should send POST request to /requestLoginSmsCode', async () => {
      await _User.requestLoginSMSCode('test-phone-number');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.url.should.endWith('/requestLoginSmsCode');
    });

    it('check phone number and options', async () => {
      await _User.requestLoginSMSCode('test-phone-number', { validateToken: 'test-token' });
      const req = adapters.requests.pop();
      req.body.should.eql({
        mobilePhoneNumber: 'test-phone-number',
        validate_token: 'test-token',
      });
    });
  });

  describe('#requestMobilePhoneVerify', () => {
    it('should send POST request to /requestMobilePhoneVerify', async () => {
      await _User.requestMobilePhoneVerify('test-phone-number');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.url.should.endWith('/requestMobilePhoneVerify');
    });

    it('check phone number and options', async () => {
      await _User.requestMobilePhoneVerify('test-phone-number', { validateToken: 'test-token' });
      const req = adapters.requests.pop();
      req.body.should.eql({
        mobilePhoneNumber: 'test-phone-number',
        validate_token: 'test-token',
      });
    });
  });

  describe('#requestPasswordReset', () => {
    it('should send POST request to /requestPasswordReset', async () => {
      await _User.requestPasswordReset('test-email');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.url.should.endWith('/requestPasswordReset');
    });

    it('check email', async () => {
      await _User.requestPasswordReset('test-email');
      const req = adapters.requests.pop();
      req.body.should.eql({ email: 'test-email' });
    });
  });

  describe('#requestPasswordResetBySMSCode', () => {
    it('should send POST request to /requestPasswordResetBySmsCode', async () => {
      await _User.requestPasswordResetBySMSCode('test-phone-number');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.url.should.endWith('/requestPasswordResetBySmsCode');
    });

    it('check phone number and options', async () => {
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

  describe('#resetPasswordBySMSCode', () => {
    it('should send PUT request to /resetPasswordBySmsCode/${code}', async function () {
      await _User.resetPasswordBySMSCode('test-code', 'test-password');
      const req = adapters.requests.pop();
      req.method.should.eql('PUT');
      req.url.should.endWith('/resetPasswordBySmsCode/test-code');
    });

    it('check password', async () => {
      await _User.resetPasswordBySMSCode('test-code', 'test-password');
      const req = adapters.requests.pop();
      req.body.should.eql({ password: 'test-password' });
    });
  });

  describe('#verifyMobilePhone', () => {
    it('should send POST request to /verifyMobilePhone/${code}', async () => {
      await _User.verifyMobilePhone('test-code');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.url.should.endWith('/verifyMobilePhone/test-code');
    });
  });

  describe('#requestChangePhoneNumber', () => {
    it('should send POST request to /requestChangePhoneNumber', async () => {
      await _User.requestChangePhoneNumber('test-phone-number');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.url.should.endWith('/requestChangePhoneNumber');
    });

    it('check phone number and options', async () => {
      await _User.requestChangePhoneNumber('test-phone-number', { ttl: 123 });
      const req = adapters.requests.pop();
      req.body.should.eql({
        mobilePhoneNumber: 'test-phone-number',
        ttl: 123,
      });
    });
  });

  describe('#changePhoneNumber', async () => {
    it('should send POST request to /changePhoneNumber', async () => {
      await _User.changePhoneNumber('test-phone-number', 'test-code');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.url.should.endWith('/changePhoneNumber');
    });

    it('check phone number and code', async () => {
      await _User.changePhoneNumber('test-phone-number', 'test-code');
      const req = adapters.requests.pop();
      req.body.should.eql({
        mobilePhoneNumber: 'test-phone-number',
        code: 'test-code',
      });
    });
  });
});

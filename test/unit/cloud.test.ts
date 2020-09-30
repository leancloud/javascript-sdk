import 'should';
import { adapters } from '../../src/utils/test-adapters';
import { App } from '../../src/app/app';
import { Cloud } from '../../src/cloud/cloud';
import { LCObject } from '../../src/storage/object';
import { API_VERSION } from '../../src/const';

describe('Cloud', function () {
  const app = new App({
    appId: 'test-app-id',
    appKey: 'test-app-key',
    serverURL: 'test-server-url',
  });
  const cloud = new Cloud(app);

  describe('#requestSMSCode', async function () {
    it('should send POST request to /requestSmsCode', async function () {
      await cloud.requestSMSCode('test-phone-number');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/requestSmsCode`);
    });

    it('check phone number and parameters', async function () {
      await cloud.requestSMSCode('test-phone-number', {
        smsType: 'test-sms-type',
        ttl: 123,
        name: 'test-name',
        op: 'test-op',
        template: 'test-template',
        sign: 'test-sign',
        validateToken: 'test-validate-token',
        variables: { key: 'value' },
      });
      const req = adapters.requests.pop();
      req.body.should.containEql({
        mobilePhoneNumber: 'test-phone-number',
        smsType: 'test-sms-type',
        ttl: 123,
        name: 'test-name',
        op: 'test-op',
        template: 'test-template',
        sign: 'test-sign',
        validate_token: 'test-validate-token',
        key: 'value',
      });
    });
  });

  describe('#verifySMSCode', function () {
    it('should send POST request to /verifySmsCode/${code}', async function () {
      await cloud.verifySMSCode('test-phone-number', 'test-code');
      const req = adapters.requests.pop();
      req.path.should.eql(`${API_VERSION}/verifySmsCode/test-code`);
    });

    it('check phone number', async function () {
      await cloud.verifySMSCode('test-phone-number', 'test-code');
      const req = adapters.requests.pop();
      req.body.should.containEql({
        mobilePhoneNumber: 'test-phone-number',
      });
    });
  });

  describe('#run', function () {
    it('should send POST request to /functions/${name}', async function () {
      await cloud.run('test-function');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/functions/test-function`);
    });

    it('check data', async function () {
      await cloud.run('test-function', 'test-data');
      const req = adapters.requests.pop();
      req.body.should.eql('test-data');
    });

    it('check result', async function () {
      adapters.responses.push({
        status: 200,
        body: {
          result: 'test-result',
        },
      });
      const result = await cloud.run('test-function');
      result.should.eql('test-result');
    });
  });

  describe('#rpc', function () {
    it('should send POST request to /call/${name}', async function () {
      await cloud.rpc('test-rpc-name');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/call/test-rpc-name`);
    });

    it('should encode data', async function () {
      const obj = new LCObject(app, 'test-class-name', 'test-object-id');
      obj.data = { key: 'value' };
      await cloud.rpc('test-rpc-name', obj);
      const req = adapters.requests.pop();
      req.body.should.eql({
        __type: 'Object',
        className: 'test-class-name',
        objectId: 'test-object-id',
        key: 'value',
      });
    });

    it('should decode result', async function () {
      adapters.responses.push({
        status: 200,
        body: {
          result: {
            __type: 'Object',
            className: 'test-class',
            objectId: 'test-id',
            key: 'value',
          },
        },
      });
      const result = (await cloud.rpc('test-rpc-name')) as LCObject;
      result.should.instanceOf(LCObject);
      result.data.should.eql({ key: 'value' });
    });
  });
});

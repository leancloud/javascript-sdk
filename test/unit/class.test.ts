import 'should';
import { adapters } from '../../src/utils/test-adapters';
import { App } from '../../src/app/app';
import { Class } from '../../src/storage/class';
import { LCObject, LCObjectRef } from '../../src/storage/object';
import { API_VERSION } from '../../src/const';

describe('Class', function () {
  const app = new App({
    appId: 'test-app-id',
    appKey: 'test-app-key',
    serverURL: 'test-server-url',
  });
  const Test = new Class('Test', app);

  describe('#object', function () {
    it('should return a LCObjectRef', function () {
      Test.object('id').should.instanceOf(LCObjectRef);
    });

    it('check app/className/objectId', function () {
      const obj = Test.object('test-object-id');
      obj.app.appId.should.eql(Test.app.appId);
      obj.className.should.eql(Test.className);
      obj.objectId.should.eql('test-object-id');
    });
  });

  describe('#add', function () {
    it('should send POST request to /classes/${className}', async function () {
      adapters.responses.push({ status: 201, body: { objectId: 'test-object-id' } });
      await Test.add({});
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/classes/Test`);
    });

    it('should encode data', async function () {
      adapters.responses.push({ status: 201, body: { objectId: 'test-object-id' } });
      const date = new Date();
      await Test.add({ date });
      const req = adapters.requests.pop();
      req.body.should.eql({ date: { __type: 'Date', iso: date.toISOString() } });
    });

    it('should remove reserved keys', async function () {
      adapters.responses.push({ status: 201, body: { objectId: 'test-object-id' } });
      await Test.add({
        objectId: '-',
        createdAt: '-',
        updatedAt: '-',
      });
      const req = adapters.requests.pop();
      req.body.should.empty();
    });

    it('check data and options', async function () {
      adapters.responses.push({ status: 201, body: { objectId: 'test-object-id' } });
      await Test.add({ key: 'value' }, { fetch: true });
      const req = adapters.requests.pop();
      req.query.fetchWhenSave.should.eql('true');
      req.body.should.eql({ key: 'value' });
    });

    it('should decode response', async function () {
      adapters.responses.push({
        status: 201,
        body: {
          objectId: 'test-object-id',
          key: 'value',
        },
      });
      const obj = await Test.add({});
      obj.should.instanceOf(LCObject);
      obj.className.should.eql('Test');
      obj.objectId.should.eql('test-object-id');
      obj.data.should.eql({ key: 'value' });
    });
  });
});

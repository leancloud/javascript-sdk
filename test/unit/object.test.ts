import 'should';
import { adapters } from '../test-adapters';
import { App } from '../../src/app';
import { Query } from '../../src/query';
import { ACL } from '../../src/acl';
import { LCObjectRef, LCObject, lcEncode } from '../../src/object';
import { API_VERSION } from '../../src/const';

const app = new App({
  appId: 'test-app-id',
  appKey: 'test-app-key',
  serverURL: 'test-server-url',
});

describe('LCObjectRef', function () {
  const ref = new LCObjectRef(app, 'Test', 'test-object-id');

  describe('#toPointer', function () {
    it('should return a Pointer', function () {
      ref.toPointer().should.eql({
        __type: 'Pointer',
        className: 'Test',
        objectId: 'test-object-id',
      });
    });
  });

  describe('#get', function () {
    it('should sent GET request to /classes/${className}/${objectId}', async function () {
      adapters.responses.push({ body: { objectId: 'test-object-id' } });
      await ref.get();
      const req = adapters.requests.pop();
      req.method.should.eql('GET');
      req.path.should.eql(`${API_VERSION}/classes/Test/test-object-id`);
    });

    it('check options', async function () {
      adapters.responses.push({ body: { objectId: 'test-object-id' } });
      await ref.get({
        keys: ['key1', 'key2'],
        include: ['key3', 'key4'],
        returnACL: true,
      });
      const req = adapters.requests.pop();
      req.query.should.eql({
        keys: 'key1,key2',
        include: 'key3,key4',
        returnACL: 'true',
      });
    });

    it('should throw error when response is an empty object', function () {
      adapters.responses.push({ body: {} });
      return ref.get().should.rejected();
    });

    it('should decode response', async function () {
      adapters.responses.push({
        status: 200,
        body: { objectId: 'test-object-id', key: 'value' },
      });
      const obj = await ref.get();
      obj.should.instanceOf(LCObject);
      obj.objectId.should.eql('test-object-id');
      obj.data.should.eql({ key: 'value' });
    });
  });

  describe('#update', function () {
    it('should send PUT request to /classes/${className}/${objectId}', async function () {
      adapters.responses.push({ body: { objectId: 'test-object-id' } });
      await ref.update({});
      const req = adapters.requests.pop();
      req.method.should.eql('PUT');
      req.path.should.eql(`${API_VERSION}/classes/Test/test-object-id`);
    });

    it('check options', async function () {
      adapters.responses.push({ body: { objectId: 'test-object-id' } });
      await ref.update(
        {},
        {
          fetch: true,
          query: new Query('', null).where('key', '==', 'value'),
        }
      );
      const req = adapters.requests.pop();
      req.query.should.eql({
        fetchWhenSave: 'true',
        where: JSON.stringify({ key: 'value' }),
      });
    });

    it('should decode response', async function () {
      adapters.responses.push({
        status: 200,
        body: { objectId: 'test-object-id', key: 'value' },
      });
      const obj = await ref.update({});
      obj.should.instanceOf(LCObject);
      obj.objectId.should.eql('test-object-id');
      obj.data.should.eql({ key: 'value' });
    });
  });

  describe('#delete', function () {
    it('should sent DELETE request to /classes/${className}/${objectId}', async function () {
      await ref.delete();
      const req = adapters.requests.pop();
      req.method.should.eql('DELETE');
      req.path.should.eql(`${API_VERSION}/classes/Test/test-object-id`);
    });
  });
});

describe('LCObject', function () {
  describe('#toJSON', function () {
    it('should extract data in sub LCObject', function () {
      const obj1 = new LCObject(app, 'Test', 'test-object-1');
      const obj2 = new LCObject(app, 'Test', 'test-object-2');
      const obj3 = new LCObject(app, 'Test', 'test-object-3');
      obj3.data = { key3: 'value' };
      obj2.data = { key2: 'value', arr: [obj3] };
      obj1.data = { key1: 'value', obj2 };
      obj1.toJSON().should.containEql({
        key1: 'value',
        obj2: {
          key2: 'value',
          arr: [{ key3: 'value' }],
        },
      });
    });
  });
});

describe('lcEncode', function () {
  describe('.encode', function () {
    it('should encode LCObjectRef', function () {
      const ref = new LCObjectRef(null, 'Test', 'test-object-id');
      lcEncode(ref).should.eql({
        __type: 'Pointer',
        className: 'Test',
        objectId: 'test-object-id',
      });
    });

    it('should encode LCObject', function () {
      const obj = new LCObject(null, 'Test', 'test-object-id');
      obj.data = { key: 'value' };
      lcEncode(obj).should.eql({
        __type: 'Pointer',
        className: 'Test',
        objectId: 'test-object-id',
      });
      lcEncode(obj, { full: true }).should.eql({
        __type: 'Object',
        className: 'Test',
        objectId: 'test-object-id',
        key: 'value',
      });
    });

    it('should encode ACL in LCObject', function () {
      const obj = new LCObject(null, 'Test', 'test-object-id');
      const acl = new ACL();
      acl.allow('user1', 'read');
      acl.allow('user2', 'write');
      obj.data = { ACL: acl };
      lcEncode(obj, { full: true }).should.eql({
        __type: 'Object',
        className: 'Test',
        objectId: 'test-object-id',
        ACL: {
          user1: { read: true },
          user2: { write: true },
        },
      });
    });

    it('should encode Date', function () {
      const date = new Date();
      lcEncode(date).should.eql({ __type: 'Date', iso: date.toISOString() });
    });

    it('should encode Date in an array', function () {
      const date = new Date();
      lcEncode([date]).should.eql([
        {
          __type: 'Date',
          iso: date.toISOString(),
        },
      ]);
    });

    it('encode encode Date in a object', function () {
      const date = new Date();
      lcEncode({ date }).should.eql({
        date: { __type: 'Date', iso: date.toISOString() },
      });
    });
  });
});

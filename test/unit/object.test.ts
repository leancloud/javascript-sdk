import 'should';
import { adapters } from '../test-adapters';
import { App } from '../../src/app';
import { Query } from '../../src/query';
import { ACL } from '../../src/acl';
import { LCObjectRef, LCObject, LCEncode, LCDecode } from '../../src/object';

const app = new App({
  appId: 'test-app-id',
  appKey: 'test-app-key',
  serverURL: 'test-server-url',
});

describe('LCObjectRef', () => {
  const ref = new LCObjectRef(app, 'Test', 'test-object-id');

  describe('#toPointer', () => {
    it('should return a Pointer', () => {
      ref.toPointer().should.eql({
        __type: 'Pointer',
        className: 'Test',
        objectId: 'test-object-id',
      });
    });
  });

  describe('#get', () => {
    it('should sent GET request to /classes/${className}/${objectId}', async () => {
      adapters.responses.push({ body: { objectId: 'test-object-id' } });
      await ref.get();
      const req = adapters.requests.pop();
      req.method.should.eql('GET');
      req.url.should.endWith('/classes/Test/test-object-id');
    });

    it('check options', async () => {
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

    it('should throw error when response is an empty object', () => {
      adapters.responses.push({ body: {} });
      return ref.get().should.rejected();
    });

    it('should decode response', async () => {
      adapters.responses.push({
        status: 200,
        body: { objectId: 'test-object-id', key: 'value' },
      });
      const obj = await ref.get();
      obj.should.instanceOf(LCObject);
      obj.objectId.should.eql('test-object-id');
      obj.data.should.eql({ objectId: 'test-object-id', key: 'value' });
    });
  });

  describe('#update', () => {
    it('should send PUT request to /classes/${className}/${objectId}', async () => {
      adapters.responses.push({ body: { objectId: 'test-object-id' } });
      await ref.update({});
      const req = adapters.requests.pop();
      req.method.should.eql('PUT');
      req.url.should.endWith('/classes/Test/test-object-id');
    });

    it('check options', async function () {
      adapters.responses.push({ body: { objectId: 'test-object-id' } });
      await ref.update(
        {},
        {
          fetch: true,
          query: new Query(app, '').where('key', '==', 'value'),
        }
      );
      const req = adapters.requests.pop();
      req.query.should.eql({
        fetchWhenSave: 'true',
        where: JSON.stringify({ key: 'value' }),
      });
    });

    it('should decode response', async () => {
      adapters.responses.push({
        status: 200,
        body: { objectId: 'test-object-id', key: 'value' },
      });
      const obj = await ref.update({});
      obj.should.instanceOf(LCObject);
      obj.objectId.should.eql('test-object-id');
      obj.data.should.eql({ objectId: 'test-object-id', key: 'value' });
    });
  });

  describe('#delete', () => {
    it('should sent DELETE request to /classes/${className}/${objectId}', async () => {
      await ref.delete();
      const req = adapters.requests.pop();
      req.method.should.eql('DELETE');
      req.url.should.endWith('/classes/Test/test-object-id');
    });
  });
});

describe('LCObject', () => {
  describe('.fromJSON', () => {
    it('Pointer', () => {
      const data = {
        __type: 'Pointer',
        className: 'Test',
        objectId: 'test-object-id',
        key: 'value',
        createdAt: '2020-10-21T08:45:34.937Z',
        updatedAt: '2020-10-22T08:45:34.937Z',
      };
      const obj = LCObject.fromJSON(app, data);
      obj.should.instanceOf(LCObject);
      obj.app.should.eql(app);
      obj.className.should.eql(data.className);
      obj.objectId.should.eql(data.objectId);
      obj.data.should.containEql({
        objectId: data.objectId,
        key: 'value',
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      });
    });
  });

  describe('#toJSON', () => {
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

describe('LCEncode', () => {
  describe('.encode', () => {
    it('should encode LCObjectRef', () => {
      const ref = new LCObjectRef(null, 'Test', 'test-object-id');
      LCEncode(ref).should.eql({
        __type: 'Pointer',
        className: 'Test',
        objectId: 'test-object-id',
      });
    });

    it('should encode LCObject', () => {
      const obj = new LCObject(null, 'Test', 'test-object-id');
      obj.data = { key: 'value' };
      LCEncode(obj).should.eql({
        __type: 'Pointer',
        className: 'Test',
        objectId: 'test-object-id',
      });
      LCEncode(obj, { full: true }).should.eql({
        __type: 'Object',
        className: 'Test',
        objectId: 'test-object-id',
        key: 'value',
      });
    });

    it('should encode ACL in LCObject', () => {
      const obj = new LCObject(null, 'Test', 'test-object-id');
      const acl = new ACL();
      acl.allow('user1', 'read');
      acl.allow('user2', 'write');
      obj.data = { ACL: acl };
      LCEncode(obj, { full: true }).should.eql({
        __type: 'Object',
        className: 'Test',
        objectId: 'test-object-id',
        ACL: {
          user1: { read: true },
          user2: { write: true },
        },
      });
    });

    it('should encode Date', () => {
      const date = new Date();
      LCEncode(date).should.eql({ __type: 'Date', iso: date.toISOString() });
    });

    it('should encode Date in an array', () => {
      const date = new Date();
      LCEncode([date]).should.eql([
        {
          __type: 'Date',
          iso: date.toISOString(),
        },
      ]);
    });

    it('encode encode Date in a object', () => {
      const date = new Date();
      LCEncode({ date }).should.eql({
        date: { __type: 'Date', iso: date.toISOString() },
      });
    });
  });
});

describe('LCDecode', () => {
  it('should decode Date', () => {
    const data = { __type: 'Date', iso: '2020-09-02T09:09:09.244Z' };
    const date = LCDecode(app, data);
    date.should.instanceOf(Date);
    date.toISOString().should.eql(data.iso);
  });

  it('should decode data in an array', () => {
    const data = { __type: 'Date', iso: '2020-09-02T09:09:09.244Z' };
    const [date1, [date2]] = LCDecode(app, [data, [data]]) as [Date, [Date]];
    [date1, date2].forEach((date) => {
      date.should.instanceOf(Date);
      date.toISOString().should.eql(data.iso);
    });
  });

  it('should decode data in a object', () => {
    const data = { __type: 'Date', iso: '2020-09-02T09:09:09.244Z' };
    const {
      date1,
      obj: { date2 },
    } = LCDecode(app, { date1: data, obj: { date2: data } }) as {
      date1: Date;
      obj: { date2: Date };
    };
    [date1, date2].forEach((date) => {
      date.should.instanceOf(Date);
      date.toISOString().should.eql(data.iso);
    });
  });
});

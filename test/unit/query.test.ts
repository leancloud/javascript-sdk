import 'should';
import { adapters } from '../test-adapters';
import { App } from '../../src/app';
import { GeoPoint } from '../../src/geo-point';
import { Query } from '../../src/query';

describe('Query', function () {
  const app = new App({
    appId: 'test-app-id',
    appKey: 'test-app-key',
    serverURL: 'test-server-url',
  });
  const Test = new Query('Test', app);

  it('#select', async function () {
    await Test.select('key1', 'key2').find();
    const req = adapters.requests.pop();
    req.query.keys.should.eql('key1,key2');
  });

  it('#except', async function () {
    await Test.except('key1', 'key2').find();
    const req = adapters.requests.pop();
    req.query.keys.should.eql('-key1,-key2');
  });

  it('#orderBy', async function () {
    await Test.orderBy('key1').orderBy('key2', 'asc').orderBy('key3', 'desc').find();
    const req = adapters.requests.pop();
    req.query.order.should.eql('key1,key2,-key3');
  });

  it('#skip', async function () {
    await Test.skip(123).find();
    const req = adapters.requests.pop();
    req.query.skip.should.eql('123');
  });

  it('#limit', async function () {
    await Test.limit(123).find();
    const req = adapters.requests.pop();
    req.query.limit.should.eql('123');
  });

  it('#include', async function () {
    await Test.include('key1', 'key2').find();
    const req = adapters.requests.pop();
    req.query.include.should.eql('key1,key2');
  });

  it('#returnACL', async function () {
    await Test.returnACL(true).find();
    const req = adapters.requests.pop();
    req.query.returnACL.should.eql('true');
  });

  it('#find', async function () {
    // TODO
  });

  it('#count', async function () {
    await Test.count();
    const req = adapters.requests.pop();
    req.query.count.should.eql('1');
    req.query.limit.should.eql('0');
  });

  describe('#where', function () {
    it('#where(key, "==", value)', async function () {
      await Test.where('key', '==', 'value').find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({ key: 'value' });
    });

    it('#where(key, "!=", value)', async function () {
      await Test.where('key', '!=', 'value').find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({ key: { $ne: 'value' } });
    });

    it('#where(key, ">", value)', async function () {
      await Test.where('key', '>', 'value').find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({ key: { $gt: 'value' } });
    });

    it('#where(key, ">=", value)', async function () {
      await Test.where('key', '>=', 'value').find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({ key: { $gte: 'value' } });
    });

    it('#where(key, "<", value)', async function () {
      await Test.where('key', '<', 'value').find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({ key: { $lt: 'value' } });
    });

    it('#where(key, "<=", value)', async function () {
      await Test.where('key', '<=', 'value').find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({ key: { $lte: 'value' } });
    });

    it('#where(key, "exists")', async function () {
      await Test.where('key', 'exists').find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({ key: { $exists: true } });
    });

    it('#where(key, "not-exists")', async function () {
      await Test.where('key', 'not-exists').find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({ key: { $exists: false } });
    });

    it('#where(key, "size-is", value)', async function () {
      await Test.where('key', 'size-is', 123).find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({ key: { $size: 123 } });
    });

    describe('#where(key, "in", value)', function () {
      it('value is a query with select', async function () {
        adapters.responses.push({ body: { results: [] } });
        await Test.where('author', 'in', Test.where('key', '==', 'value').select('user')).find();
        const req = adapters.requests.pop();
        JSON.parse(req.query.where as string).should.eql({
          author: {
            $select: {
              key: 'user',
              query: {
                className: Test.className,
                where: { key: 'value' },
              },
            },
          },
        });
      });

      it('value is a query without select', async function () {
        await Test.where('post', 'in', Test.where('key', '==', 'value')).find();
        const req = adapters.requests.pop();
        JSON.parse(req.query.where as string).should.eql({
          post: {
            $inQuery: {
              className: Test.className,
              where: { key: 'value' },
            },
          },
        });
      });
    });

    describe('#where(key, "not-in", value)', function () {
      it('value is a query with select', async function () {
        await Test.where(
          'author',
          'not-in',
          Test.where('key', '==', 'value').select('user')
        ).find();
        const req = adapters.requests.pop();
        JSON.parse(req.query.where as string).should.eql({
          author: {
            $dontSelect: {
              key: 'user',
              query: {
                className: Test.className,
                where: { key: 'value' },
              },
            },
          },
        });
      });

      it('value is a query without select', async function () {
        await Test.where('post', 'not-in', Test.where('key', '==', 'value')).find();
        const req = adapters.requests.pop();
        JSON.parse(req.query.where as string).should.eql({
          post: {
            $notInQuery: {
              className: Test.className,
              where: { key: 'value' },
            },
          },
        });
      });
    });

    describe('#where(key, "matches", value)', function () {
      it('value is a string', async function () {
        await Test.where('key', 'matches', 'value').find();
        const req = adapters.requests.pop();
        JSON.parse(req.query.where as string).should.eql({
          key: { $regex: 'value' },
        });
      });

      it('value is a string with options', async function () {
        await Test.where('key', 'matches', {
          regexp: 'value',
          ignoreCase: true,
          ignoreBlank: true,
          multiline: true,
          dotAll: true,
        }).find();
        const req = adapters.requests.pop();
        JSON.parse(req.query.where as string).should.eql({
          key: { $regex: 'value', $options: 'xims' },
        });
      });

      it('value is RegExp', async function () {
        await Test.where('key', 'matches', /value/ims).find();
        const req = adapters.requests.pop();
        JSON.parse(req.query.where as string).should.eql({
          key: { $regex: 'value', $options: 'ims' },
        });
      });
    });

    it('#where(key, "starts-with", value)', async function () {
      await Test.where('key', 'starts-with', 'prefix').find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({
        key: { $regex: '^\\Qprefix\\E' },
      });
    });

    it('#where(key, "ends-with", value)', async function () {
      await Test.where('key', 'ends-with', 'suffix').find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({
        key: { $regex: '\\Qsuffix\\E$' },
      });
    });

    describe('#where(key, "contains", value)', function () {
      it('value is a string', async function () {
        await Test.where('key', 'contains', 'value').find();
        const req = adapters.requests.pop();
        JSON.parse(req.query.where as string).should.eql({
          key: { $regex: '\\Qvalue\\E' },
        });
      });
    });

    it('#where(key, "contains-all", items)', async function () {
      await Test.where('key', 'contains-all', ['item']).find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({
        key: { $all: ['item'] },
      });
    });

    it('#where(key, "contains-any", items)', async function () {
      await Test.where('key', 'contained-in', ['item']).find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({
        key: { $in: ['item'] },
      });
    });

    it('#where(key, "not-contains-any", items)', async function () {
      await Test.where('key', 'not-contained-in', ['item']).find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({
        key: { $nin: ['item'] },
      });
    });

    it('#where(key, "near", point)', async function () {
      await Test.where('key', 'near', new GeoPoint(12, 34)).find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({
        key: { $nearSphere: { __type: 'GeoPoint', latitude: 12, longitude: 34 } },
      });
    });

    it('#where(key, "within", area)', async function () {
      await Test.where('key', 'within', {
        southwest: new GeoPoint(12, 34),
        northeast: new GeoPoint(34, 12),
      }).find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({
        key: {
          $within: {
            $box: [
              { __type: 'GeoPoint', latitude: 12, longitude: 34 },
              { __type: 'GeoPoint', latitude: 34, longitude: 12 },
            ],
          },
        },
      });
    });

    it('#where(key, "within-miles", point', async function () {
      await Test.where('key', 'within-miles', {
        point: new GeoPoint(12, 34),
        max: 100,
        min: 10,
      }).find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({
        key: {
          $nearSphere: { __type: 'GeoPoint', latitude: 12, longitude: 34 },
          $maxDistanceInMiles: 100,
          $minDistanceInMiles: 10,
        },
      });
    });

    it('#where(key, "within-kilometers", point', async function () {
      await Test.where('key', 'within-kilometers', {
        point: new GeoPoint(12, 34),
        max: 100,
        min: 10,
      }).find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({
        key: {
          $nearSphere: { __type: 'GeoPoint', latitude: 12, longitude: 34 },
          $maxDistanceInKilometers: 100,
          $minDistanceInKilometers: 10,
        },
      });
    });

    it('#where(key, "within-radians", point', async function () {
      await Test.where('key', 'within-radians', {
        point: new GeoPoint(12, 34),
        max: 100,
        min: 10,
      }).find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.where as string).should.eql({
        key: {
          $nearSphere: { __type: 'GeoPoint', latitude: 12, longitude: 34 },
          $maxDistanceInRadians: 100,
          $minDistanceInRadians: 10,
        },
      });
    });
  });
});

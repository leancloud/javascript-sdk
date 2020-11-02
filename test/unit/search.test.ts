import 'should';
import { adapters } from '../test-adapters';
import { App } from '../../src/app';
import { SearchQuery, SearchSortBuilder } from '../../src/search';
import { GeoPoint } from '../../src/geo-point';
import { LCObject } from '../../src/object';

const app = new App({
  appId: 'test-app-id',
  appKey: 'test-app-key',
  serverURL: 'test-server-url',
});
const query = new SearchQuery(app, 'Test');

describe('SearchSortBuilder', () => {
  describe('#orderBy', () => {
    it('check order direction', async () => {
      const ssb = new SearchSortBuilder();
      ssb.orderBy('key1', 'asc');
      ssb.orderBy('key2', 'desc');
      await query.sortBy(ssb).find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.sort as string).should.eql([
        { key1: { order: 'asc' } },
        { key2: { order: 'desc' } },
      ]);
    });

    it('check options', async () => {
      await query
        .sortBy(
          new SearchSortBuilder().orderBy('key', 'asc', {
            mode: 'avg',
            missing: 'first',
          })
        )
        .find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.sort as string).should.eql([
        { key: { order: 'asc', mode: 'avg', missing: '_first' } },
      ]);
    });
  });

  describe('#whereNear', () => {
    it('check options', async () => {
      const ssb = new SearchSortBuilder();
      ssb.whereNear('key1', new GeoPoint(1, 2), {
        order: 'asc',
        mode: 'avg',
        unit: 'm',
      });
      ssb.whereNear('key2', new GeoPoint(3, 4), {
        order: 'desc',
        mode: 'max',
        unit: 'km',
      });
      await query.sortBy(ssb).find();
      const req = adapters.requests.pop();
      JSON.parse(req.query.sort as string).should.eql([
        {
          _geo_distance: {
            key1: { lat: 1, lon: 2 },
            order: 'asc',
            mode: 'avg',
            unit: 'm',
          },
        },
        {
          _geo_distance: {
            key2: { lat: 3, lon: 4 },
            order: 'desc',
            mode: 'max',
            unit: 'km',
          },
        },
      ]);
    });
  });
});

describe('SearchQuery', () => {
  it('#queryString', async () => {
    await query.queryString('test-query-string').find();
    const req = adapters.requests.pop();
    req.query.q.should.eql('test-query-string');
  });

  it('#skip', async () => {
    await query.skip(123).find();
    const req = adapters.requests.pop();
    req.query.skip.should.eql('123');
  });

  it('#limit', async () => {
    await query.limit(123).find();
    const req = adapters.requests.pop();
    req.query.limit.should.eql('123');
  });

  it('#sid', async () => {
    await query.sid('test-sid').find();
    const req = adapters.requests.pop();
    req.query.sid.should.eql('test-sid');
  });

  it('#fields', async () => {
    await query.fields('key1', 'key2').find();
    const req = adapters.requests.pop();
    req.query.fields.should.eql('key1,key2');
  });

  it('#include', async () => {
    await query.include('key1', 'key2').find();
    const req = adapters.requests.pop();
    req.query.include.should.eql('key1,key2');
  });

  it('#orderBy', async () => {
    await query.orderBy('key1').orderBy('key2', 'asc').orderBy('key3', 'desc').find();
    const req = adapters.requests.pop();
    req.query.order.should.eql('key1,key2,-key3');
  });

  describe('#find', () => {
    it('should send GET request to /search/select', async () => {
      await query.find();
      const req = adapters.requests.pop();
      req.method.should.eql('GET');
      req.url.should.endWith('/search/select');
    });

    it('check result', async () => {
      adapters.responses.push({
        status: 200,
        body: {
          hits: 123,
          sid: 'test-sid',
          results: [
            {
              className: 'Test',
              objectId: 'test-object-id',
            },
          ],
        },
      });
      const result = await query.find();
      result.hits.should.Number();
      result.sid.should.String();
      const obj = result.data[0];
      obj.should.instanceOf(LCObject);
      obj.className.should.eql('Test');
      obj.objectId.should.eql('test-object-id');

      await result.next();
      const req = adapters.requests.pop();
      req.method.should.eql('GET');
      req.url.should.endWith('/search/select');
    });
  });
});

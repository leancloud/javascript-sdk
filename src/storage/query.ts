import { App, AuthOptions, AdvancedHTTPRequest } from '../app/app';
import { GeoPoint } from './geo-point';
import { LCObject } from './object';
import { isEmptyObject, assert, isRegExp } from '../utils';
import { Encoder } from './object';
import { API_VERSION } from '../const';
import { PluginManager } from '../app/plugin';
import type { LiveQuery } from '../live-query/live-query';

interface RegExpWithString {
  regexp: string;
  ignoreCase?: boolean;
  ignoreBlank?: boolean;
  multiline?: boolean;
  dotAll?: boolean;
}

interface GeoBox {
  southwest: GeoPoint;
  northeast: GeoPoint;
}

interface GeoDistance {
  point: GeoPoint;
  max: number;
  min?: number;
}

interface QueryCondition {
  [key: string]: Record<string, unknown> | QueryCondition[];
  $and?: QueryCondition[];
  $or?: QueryCondition[];
}

export class Query {
  private _where: QueryCondition = {};
  private _keys: string[] = [];
  private _order: string[] = [];
  private _include: string[] = [];
  private _skip: number;
  private _limit: number;
  private _returnACL: boolean;
  private _danglingOr: Query;

  constructor(public app: App, public className: string) {}

  static and(...queries: Query[]): Query {
    assert(queries.length > 1, 'The and method require at least 2 queries');
    for (let i = 1; i < queries.length; ++i) {
      assert(
        queries[i].className === queries[0].className,
        'All queries must belongs to same Class'
      );
      assert(queries[i].app.appId === queries[0].app.appId, 'All queries must belongs to same App');
    }

    const query = new Query(queries[0].app, queries[0].className);
    query._where = { $and: queries.map((query) => query.toJSON()) };
    return query;
  }

  static or(...queries: Query[]): Query {
    assert(queries.length > 1, 'The or method require at least 2 queries');
    const query = Query.and(...queries);
    query._where.$or = query._where.$and;
    delete query._where.$and;
    return query;
  }

  get or(): Query {
    if (isEmptyObject(this._where)) {
      return this;
    }
    const query = new Query(this.app, this.className);
    query._danglingOr = this;
    return query;
  }

  select(...keys: string[]): Query {
    const query = this._clone();
    query._keys = keys;
    return query;
  }

  except(...keys: string[]): Query {
    const query = this._clone();
    query._keys = keys.map((key) => '-' + key);
    return query;
  }

  orderBy(key: string, direction?: 'asc' | 'desc'): Query {
    const query = this._clone();
    if (direction === 'desc') {
      query._order.push('-' + key);
    } else {
      query._order.push(key);
    }
    return query;
  }

  skip(count: number): Query {
    const query = this._clone();
    query._skip = count;
    return query;
  }

  limit(count: number): Query {
    const query = this._clone();
    query._limit = count;
    return query;
  }

  include(...keys: string[]): Query {
    const query = this._clone();
    query._include = keys;
    return query;
  }

  returnACL(enable: boolean): Query {
    const query = this._clone();
    query._returnACL = enable;
    return query;
  }

  async find(options?: AuthOptions): Promise<LCObject[]> {
    const res = await this.app.request(this._makeRequest(options));
    const { results } = res.body as { results: Record<string, unknown>[] };
    return results?.map((result) => Encoder.decodeObject(this.app, result, this.className));
  }

  async first(options?: AuthOptions): Promise<LCObject> {
    const results = await this.limit(1).find(options);
    return results.length ? results[0] : null;
  }

  async count(options?: AuthOptions): Promise<number> {
    const req = this._makeRequest(options);
    req.query.count = 1;
    req.query.limit = 0;
    const res = await this.app.request(req);
    return (res.body as { count: number }).count;
  }

  where(key: string, cond: '==' | '!=' | '>' | '>=' | '<' | '<=', value: unknown): Query;
  where(key: string, cond: 'exists' | 'not-exists'): Query;
  where(key: string, cond: 'size-is', value: number): Query;
  where(key: string, cond: 'in' | 'not-in', value: Query): Query;
  where(key: string, cond: 'matches', value: string | RegExpWithString | RegExp): Query;
  where(key: string, cond: 'starts-with' | 'ends-with' | 'contains', value: string): Query;
  where(
    key: string,
    cond: 'contains' | 'contained-in' | 'not-contained-in',
    values: unknown[]
  ): Query;
  where(key: string, cond: 'near', point: GeoPoint): Query;
  where(key: string, cond: 'within', box: GeoBox): Query;
  where(
    key: string,
    cond: 'within-miles' | 'within-kilometers' | 'within-radians',
    value: GeoDistance
  ): Query;
  where(key: string, cond: string, value?: unknown): Query {
    const query = this._clone();
    switch (cond) {
      case '==':
        query._whereEqualTo(key, value);
        break;
      case '!=':
        query._whereNotEqualTo(key, value);
        break;
      case '>':
        query._whereGreaterThan(key, value);
        break;
      case '>=':
        query._whereGreaterThanOrEqualTo(key, value);
        break;
      case '<':
        query._whereLessThan(key, value);
        break;
      case '<=':
        query._whereLessThanOrEqualTo(key, value);
        break;
      case 'exists':
        query._whereExists(key);
        break;
      case 'not-exists':
        query._whereNotExists(key);
        break;
      case 'size-is':
        assertIsNumber(value);
        query._whereSizeEqual(key, value);
        break;
      case 'in':
        assertIsQuery(value);
        if (value._keys.length == 0) {
          query._whereMachesQuery(key, value);
        } else {
          assert(value._keys.length === 1, 'The sub-query expect select only one key');
          query._whereMatchesKeyInQuery(key, value._keys[0], value);
        }
        break;
      case 'not-in':
        assertIsQuery(value);
        if (value._keys.length == 0) {
          query._whereDoesNotMatchQuery(key, value);
        } else {
          assert(value._keys.length === 1, 'The sub-query expect select only one key');
          query._whereDoesNotMatcheKeyInQuery(key, value._keys[0], value);
        }
        break;
      case 'matches':
        query._whereMatches(key, value as string | RegExpWithString | RegExp);
        break;
      case 'starts-with':
        assertIsString(value);
        query._whereStartsWith(key, value);
        break;
      case 'ends-with':
        assertIsString(value);
        query._whereEndsWith(key, value);
        break;
      case 'contains':
        if (typeof value === 'string') {
          query._whereContains(key, value);
        } else if (Array.isArray(value)) {
          query._whereContainsAll(key, value);
        } else {
          throw new TypeError(`Condition '${cond}' accepts only string or array value`);
        }
        break;
      case 'contained-in':
        assertIsArray(value);
        query._whereContainedIn(key, value);
        break;
      case 'not-contained-in':
        assertIsArray(value);
        query._whereNotContainedIn(key, value);
        break;
      case 'near':
        assertIsGeoPoint(value);
        query._whereNear(key, value);
        break;
      case 'within':
        assertIsGeoBox(value);
        query._whereWithinGeoBox(key, value.southwest, value.northeast);
        break;
      case 'within-radians':
        assertIsGeoDistance(value);
        query._whereWithinRadians(key, value.point, value.max, value.min);
        break;
      case 'within-miles': {
        assertIsGeoDistance(value);
        query._whereWithinMiles(key, value.point, value.max, value.min);
        break;
      }
      case 'within-kilometers': {
        assertIsGeoDistance(value);
        query._whereWithinKilometers(key, value.point, value.max, value.min);
        break;
      }
      default:
        throw new TypeError(`Unsupported condition '${cond}'`);
    }
    return query;
  }

  toJSON(): QueryCondition {
    if (this._danglingOr) {
      if (isEmptyObject(this._where)) {
        return this._danglingOr.toJSON();
      }
      const or = this._danglingOr;
      this._danglingOr = null;
      const json = Query.or(or, this).toJSON();
      this._danglingOr = or;
      return json;
    }
    const where = { ...this._where };
    Object.entries(where).forEach(([key, value]) => {
      if (value['$eq'] !== undefined) {
        where[key] = value['$eq'];
      }
    });
    return where;
  }

  toString(): string {
    return JSON.stringify(this);
  }

  subscribe(): Promise<LiveQuery> {
    const liveQuery = PluginManager.plugins['LiveQuery'] as typeof LiveQuery;
    assert(liveQuery, 'Query#subscribe need the LiveQuery plugin');
    return liveQuery.subscribe(this);
  }

  protected _clone(query?: Query): Query {
    if (!query) {
      query = new Query(this.app, this.className);
    }
    Object.entries(this._where).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        query._where[key] = [...value];
      } else {
        query._where[key] = { ...value };
      }
    });
    query._keys = [...this._keys];
    query._order = [...this._order];
    query._include = [...this._include];
    query._skip = this._skip;
    query._limit = this._limit;
    query._returnACL = this._returnACL;
    query._danglingOr = this._danglingOr;
    return query;
  }

  protected _makeRequest(options?: AuthOptions): AdvancedHTTPRequest {
    const req: AdvancedHTTPRequest = {
      path: `${API_VERSION}/classes/${this.className}`,
      query: {
        limit: this._limit,
        skip: this._skip,
        returnACL: this._returnACL,
      },
      options,
    };
    const where = this.toString();
    if (where !== '{}') {
      req.query.where = where;
    }
    if (this._include.length) {
      req.query.include = this._include.join(',');
    }
    if (this._order.length) {
      req.query.order = this._order.join(',');
    }
    if (this._keys.length) {
      req.query.keys = this._keys.join(',');
    }
    return req;
  }

  private _addCondition(key: string, cond: string, value: unknown) {
    if (!this._where[key]) {
      this._where[key] = {};
    }
    this._where[key][cond] = Encoder.encode(value);
  }

  private _clearAllCondition(key: string) {
    if (this._where[key]) {
      this._where[key] = {};
    }
  }

  protected _whereEqualTo(key: string, value: unknown): void {
    this._clearAllCondition(key);
    // ATTENTION: the '$eq' is a dummy condition, do not send it to backend.
    this._addCondition(key, '$eq', value);
  }

  private _whereNotEqualTo(key: string, value: unknown) {
    this._addCondition(key, '$ne', value);
  }

  private _whereGreaterThan(key: string, value: unknown) {
    this._addCondition(key, '$gt', value);
  }

  private _whereGreaterThanOrEqualTo(key: string, value: unknown) {
    this._addCondition(key, '$gte', value);
  }

  private _whereLessThan(key: string, value: unknown) {
    this._addCondition(key, '$lt', value);
  }

  private _whereLessThanOrEqualTo(key: string, value: unknown) {
    this._addCondition(key, '$lte', value);
  }

  private _whereExists(key: string) {
    this._addCondition(key, '$exists', true);
  }

  private _whereNotExists(key: string) {
    this._addCondition(key, '$exists', false);
  }

  private _whereSizeEqual(key: string, value: number) {
    this._addCondition(key, '$size', value);
  }

  private _whereMatchesKeyInQuery(key: string, queryKey: string, query: Query) {
    this._addCondition(key, '$select', {
      key: queryKey,
      query: {
        className: query.className,
        where: query.toJSON(),
      },
    });
  }

  private _whereDoesNotMatcheKeyInQuery(key: string, queryKey: string, query: Query) {
    this._addCondition(key, '$dontSelect', {
      key: queryKey,
      query: {
        className: query.className,
        where: query.toJSON(),
      },
    });
  }

  private _whereMachesQuery(key: string, query: Query) {
    this._addCondition(key, '$inQuery', {
      className: query.className,
      where: query.toJSON(),
    });
  }

  private _whereDoesNotMatchQuery(key: string, query: Query) {
    this._addCondition(key, '$notInQuery', {
      className: query.className,
      where: query.toJSON(),
    });
  }

  private _whereMatches(key: string, value: string | RegExpWithString | RegExp) {
    let $regex: string;
    let $options = '';
    if (typeof value === 'string') {
      $regex = value;
    } else {
      if (isRegExp(value)) {
        $regex = value.source;
      } else {
        $regex = value.regexp;
        if (value.ignoreBlank) {
          $options += 'x';
        }
      }
      if (value.ignoreCase) {
        $options += 'i';
      }
      if (value.multiline) {
        $options += 'm';
      }
      if (value.dotAll) {
        $options += 's';
      }
    }
    this._addCondition(key, '$regex', $regex);
    if ($options) {
      this._addCondition(key, '$options', $options);
    }
  }

  private _whereStartsWith(key: string, value: string) {
    this._whereMatches(key, '^' + quote(value));
  }

  private _whereEndsWith(key: string, value: string) {
    this._whereMatches(key, quote(value) + '$');
  }

  private _whereContains(key: string, value: string) {
    this._whereMatches(key, quote(value));
  }

  private _whereContainsAll(key: string, values: unknown[]) {
    this._addCondition(key, '$all', values);
  }

  private _whereContainedIn(key: string, values: unknown[]) {
    this._addCondition(key, '$in', values);
  }

  private _whereNotContainedIn(key: string, values: unknown[]) {
    this._addCondition(key, '$nin', values);
  }

  private _whereNear(key: string, point: GeoPoint) {
    this._addCondition(key, '$nearSphere', point);
  }

  private _whereWithinGeoBox(key: string, southwest: GeoPoint, northeast: GeoPoint) {
    this._addCondition(key, '$within', { $box: [southwest, northeast] });
  }

  private _whereWithinRadians(
    key: string,
    point: GeoPoint,
    maxDistance: number,
    minDistance?: number
  ) {
    this._whereNear(key, point);
    this._addCondition(key, '$maxDistanceInRadians', maxDistance);
    if (minDistance !== undefined) {
      this._addCondition(key, '$minDistanceInRadians', minDistance);
    }
  }

  private _whereWithinMiles(
    key: string,
    point: GeoPoint,
    maxDistance: number,
    minDistance?: number
  ) {
    this._whereNear(key, point);
    this._addCondition(key, '$maxDistanceInMiles', maxDistance);
    if (minDistance !== undefined) {
      this._addCondition(key, '$minDistanceInMiles', minDistance);
    }
  }

  private _whereWithinKilometers(
    key: string,
    point: GeoPoint,
    maxDistance: number,
    minDistance?: number
  ) {
    this._whereNear(key, point);
    this._addCondition(key, '$maxDistanceInKilometers', maxDistance);
    if (minDistance !== undefined) {
      this._addCondition(key, '$minDistanceInKilometers', minDistance);
    }
  }
}

function quote(s: string): string {
  return '\\Q' + s.replace('\\E', '\\E\\\\E\\Q') + '\\E';
}

function assertIsString(value: unknown): asserts value is string {
  assert(typeof value === 'string', `Need string, got ${value}`);
}

function assertIsNumber(value: unknown): asserts value is number {
  assert(typeof value === 'number', `Need number, got ${value}`);
}

function assertIsArray(value: unknown): asserts value is unknown[] {
  assert(Array.isArray(value), `Need array, got ${value}`);
}

function assertIsGeoPoint(value: unknown): asserts value is GeoPoint {
  assert(value instanceof GeoPoint, `Need GeoPoint, got ${value}`);
}

function assertIsQuery(value: unknown): asserts value is Query {
  assert(value instanceof Query, `Need Query, got ${value}`);
}

function assertIsGeoBox(value: unknown): asserts value is GeoBox {
  const box = value as GeoBox;
  if (typeof box === 'object') {
    if (box.northeast instanceof GeoPoint && box.southwest instanceof GeoPoint) {
      return;
    }
  }
  throw new TypeError(`Need GeoBox, got ${value}`);
}

function assertIsGeoDistance(value: unknown): asserts value is GeoDistance {
  const geo = value as GeoDistance;
  if (typeof geo === 'object') {
    if (geo.point instanceof GeoPoint && typeof geo.max === 'number') {
      if (typeof geo.min === 'undefined' || typeof geo.min === 'number') {
        return;
      }
    }
  }
  throw new TypeError(`Need GeoDistance, got ${value}`);
}

import type { App, AppRequest, AuthOptions } from '../app';
import type { LiveQuery } from '../live-query';
import { GeoPoint } from '../geo-point';
import { LCDecode, LCObject } from '../object';
import { assert } from '../utils';
import { PluginManager } from '../plugin';
import { ConditionBuilder, Condition, RegExpLike } from './condition-builder';
import { cloneDeep } from 'lodash';

interface GeoBox {
  southwest: GeoPoint;
  northeast: GeoPoint;
}

interface GeoDistance {
  point: GeoPoint;
  max: number;
  min?: number;
}

interface QueryOptions {
  select?: string[];
  except?: string[];
  order?: string[];
  include?: string[];
  skip?: number;
  limit?: number;
  returnACL?: boolean;
}

export class Query {
  protected _condBuilder = new ConditionBuilder();

  private _options: QueryOptions = {};
  private _siblingOr: Query;

  constructor(public readonly app: App, public readonly className: string) {}

  /**
   * Constructs a {@link Query} that is the AND of the passed in queries.
   *
   * For example:
   * ```js
   * // will create a compoundQuery that is an 'and' of the query1, query2, and query3.
   * const compoundQuery = Query.and(query1, query2, query3);
   * ```
   *
   * @since 5.0.0
   */
  static and(...queries: Query[]): Query;
  static and(queries: Query[]): Query;
  static and(query: Query | Query[], ...queries: Query[]): Query {
    if (Array.isArray(query)) {
      queries = query;
    } else {
      queries = [query, ...queries];
    }

    assert(queries.length > 1, 'Query.and require at least 2 queries');
    for (let i = 1; i < queries.length; ++i) {
      assert(queries[i].app.appId === queries[0].app.appId, 'All queries must belongs to same App');
      assert(
        queries[i].className === queries[0].className,
        'All queries must belongs to same Class'
      );
    }

    const newQuery = new Query(queries[0].app, queries[0].className);
    newQuery._condBuilder = ConditionBuilder.and(queries.map((q) => q.toJSON()));
    return newQuery;
  }

  /**
   * Constructs a {@link Query} that is the OR of the passed in queries.
   *
   * For example:
   * ```js
   * // will create a compoundQuery that is an or of the query1, query2, and query3.
   * const compoundQuery = Query.or(query1, query2, query3);
   * ```
   *
   * @since 5.0.0
   */
  static or(...queries: Query[]): Query;
  static or(queries: Query[]): Query;
  static or(query: Query | Query[], ...queries: Query[]): Query {
    if (Array.isArray(query)) {
      queries = query;
    } else {
      queries = [query, ...queries];
    }

    assert(queries.length > 1, 'Query.or require at least 2 queries');
    for (let i = 1; i < queries.length; ++i) {
      assert(queries[i].app.appId === queries[0].app.appId, 'All queries must belongs to same App');
      assert(
        queries[i].className === queries[0].className,
        'All queries must belongs to same Class'
      );
    }

    const newQuery = new Query(queries[0].app, queries[0].className);
    newQuery._condBuilder = ConditionBuilder.or(queries.map((q) => q.toJSON()));
    return newQuery;
  }

  get or(): Query {
    if (this._condBuilder.isEmpty()) {
      return this;
    }
    const query = new Query(this.app, this.className);
    query._siblingOr = this;
    return query;
  }

  select(keys: string[]): Query;
  select(...keys: string[]): Query;
  select(key: string | string[], ...keys: string[]): Query {
    const query = this._clone();
    if (typeof key === 'string') {
      query._options.select = [key, ...keys];
    } else {
      query._options.select = key;
    }
    return query;
  }

  except(keys: string[]): Query;
  except(...keys: string[]): Query;
  except(key: string | string[], ...keys: string[]): Query {
    const query = this._clone();
    if (typeof key === 'string') {
      query._options.except = ['-' + key, ...keys.map((key) => '-' + key)];
    } else {
      query._options.except = key.map((key) => '-' + key);
    }
    return query;
  }

  orderBy(key: string, direction?: 'asc' | 'desc'): Query {
    const query = this._clone();
    if (!query._options.order) {
      query._options.order = [];
    }
    if (direction === 'desc') {
      query._options.order.push('-' + key);
    } else {
      query._options.order.push(key);
    }
    return query;
  }

  skip(count: number): Query {
    const query = this._clone();
    query._options.skip = count;
    return query;
  }

  limit(count: number): Query {
    const query = this._clone();
    query._options.limit = count;
    return query;
  }

  include(keys: string[]): Query;
  include(...keys: string[]): Query;
  include(key: string | string[], ...keys: string[]): Query {
    const query = this._clone();
    if (typeof key === 'string') {
      query._options.include = [key, ...keys];
    } else {
      query._options.include = key;
    }
    return query;
  }

  returnACL(enable: boolean): Query {
    const query = this._clone();
    query._options.returnACL = enable;
    return query;
  }

  async find(options?: AuthOptions): Promise<LCObject[]> {
    const { results = [] } = (await this.app.request(this._makeRequest(options))) as {
      results: Record<string, any>[];
    };
    return LCDecode(this.app, results);
  }

  async first(options?: AuthOptions): Promise<LCObject | null> {
    const objects = await this.limit(1).find(options);
    return objects.length ? objects[0] : null;
  }

  async count(options?: AuthOptions): Promise<number> {
    const req = this._makeRequest(options);
    req.query.count = 1;
    req.query.limit = 0;
    const { count } = (await this.app.request(req)) as { count: number };
    return count;
  }

  /**
   * Add a constraint to the query that requires a particular key's value to be equal to the provided value.
   *
   * @since 5.0.0
   */
  where(key: string, condition: '==', value: unknown): Query;

  /**
   * Add a constraint to the query that requires a particular key's value to be not equal to the provided value.
   *
   * @since 5.0.0
   */
  where(key: string, condition: '!=', value: unknown): Query;

  /**
   * Add a constraint to the query that requires a particular key's value to be greater than the provided value.
   *
   * @since 5.0.0
   */
  where(key: string, condition: '>', value: unknown): Query;

  /**
   * Add a constraint to the query that requires a particular key's value to be greater than or equal to the provided value.
   *
   * @since 5.0.0
   */
  where(key: string, condition: '>=', value: unknown): Query;

  /**
   * Add a constraint to the query that requires a particular key's value to be less than the provided value.
   *
   * @since 5.0.0
   */
  where(key: string, condition: '<', value: unknown): Query;

  /**
   * Add a constraint to the query that requires a particular key's value to be less than or equal to the provided value.
   *
   * @since 5.0.0
   */
  where(key: string, condition: '<=', value: unknown): Query;

  /**
   * Add a constraint for finding objects that contain the given key.
   *
   * @since 5.0.0
   */
  where(key: string, condition: 'exists'): Query;

  /**
   * Add a constraint for finding objects that do not contain a given key.
   *
   * @since 5.0.0
   */
  where(key: string, condition: 'not-exists'): Query;

  /**
   * Add a constraint to the query that requires a particular **array** key's length to be equal to the provided value.
   *
   * @since 5.0.0
   */
  where(key: string, condition: 'size-is', value: number): Query;

  /**
   * Add a constraint that requires that a key's value matches a {@link Query} constraint. If `query`
   * specified {@link Query.select selected} keys, add a constraint that requires that a key's value
   * matches a value in an object returned by a different {@link Query}.
   *
   * @since 5.0.0
   */
  where(key: string, condition: 'in', query: Query): Query;

  /**
   * Add a constraint that requires that a key's value not matches a {@link Query} constraint. If `query`
   * specified {@link Query.select selected} keys, add a constraint that requires that a key's value
   * not match a value in an object returned by a different {@link Query}.
   *
   * @since 5.0.0
   */
  where(key: string, condition: 'not-in', query: Query): Query;

  /**
   * Add a regular expression constraint for finding string values that match the provided regular
   * expression. This may be slow for large datasets.
   *
   * @since 5.0.0
   */
  where(key: string, condition: 'matches', value: string | RegExpLike): Query;

  /**
   * Add a constraint for finding string values that start with a provided string. This query will
   * use the backend index, so it will be fast even for large datasets.
   *
   * @since 5.0.0
   */
  where(key: string, condition: 'starts-with', value: string): Query;

  /**
   * Add a constraint for finding string values that end with a provided string. This will be slow for large datasets.
   *
   * @since 5.0.0
   */
  where(key: string, condition: 'ends-with', value: string): Query;

  /**
   * Add a constraint for finding string values that contain a provided string. This may be slow for large datasets.
   *
   * @since 5.0.0
   */
  where(key: string, condition: 'contains', value: string): Query;

  /**
   * Add a constraint to the query that requires a particular key's value to contain each one of the provided list of values.
   *
   * @since 5.0.0
   */
  where(key: string, condition: 'contains-all', values: unknown[]): Query;

  where(key: string, condition: 'contained-in', values: unknown[]): Query;

  where(key: string, condition: 'not-contained-in', values: unknown[]): Query;

  where(key: string, condition: 'near', point: GeoPoint): Query;

  where(key: string, condition: 'within', box: GeoBox): Query;

  where(key: string, condition: 'within-miles', distance: GeoDistance): Query;

  where(key: string, condition: 'within-kilometers', distance: GeoDistance): Query;

  where(key: string, condition: 'within-radians', distance: GeoDistance): Query;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  where(key: string, condition: string, value?: any): Query {
    const query = this._clone();
    switch (condition) {
      case '==':
        query._condBuilder.whereEqualTo(key, value);
        break;
      case '!=':
        query._condBuilder.whereNotEqualTo(key, value);
        break;
      case '>':
        query._condBuilder.whereGreaterThan(key, value);
        break;
      case '>=':
        query._condBuilder.whereGreaterThanOrEqualTo(key, value);
        break;
      case '<':
        query._condBuilder.whereLessThan(key, value);
        break;
      case '<=':
        query._condBuilder.whereLessThanOrEqualTo(key, value);
        break;
      case 'exists':
        query._condBuilder.whereExists(key);
        break;
      case 'not-exists':
        query._condBuilder.whereNotExists(key);
        break;
      case 'size-is':
        if (typeof value !== 'number') {
          throw new TypeError('Expected number value');
        }
        query._condBuilder.whereSizeEqual(key, value);
        break;
      case 'in':
        if (!(value instanceof Query)) {
          throw new TypeError('Expected Query value');
        }
        if (value._options.select) {
          if (value._options.select.length !== 1) {
            throw new Error('Expected the sub-query select only one key');
          }
          query._condBuilder.whereMatchesKeyInQuery(
            key,
            value.className,
            value._options.select[0],
            value.toJSON()
          );
        } else {
          query._condBuilder.whereMachesQuery(key, value.className, value.toJSON());
        }
        break;
      case 'not-in':
        if (!(value instanceof Query)) {
          throw new TypeError('Expected Query value');
        }
        if (value._options.select) {
          if (value._options.select.length !== 1) {
            throw new Error('Expected the sub-query select only one key');
          }
          query._condBuilder.whereDoesNotMatcheKeyInQuery(
            key,
            value.className,
            value._options.select[0],
            value.toJSON()
          );
        } else {
          query._condBuilder.whereDoesNotMatchQuery(key, value.className, value.toJSON());
        }
        break;
      case 'matches':
        query._condBuilder.whereMatches(key, value);
        break;
      case 'starts-with':
        query._condBuilder.whereStartsWith(key, value);
        break;
      case 'ends-with':
        query._condBuilder.whereEndsWith(key, value);
        break;
      case 'contains':
        query._condBuilder.whereContains(key, value);
        break;
      case 'contains-all':
        query._condBuilder.whereContainsAll(key, value);
        break;
      case 'contained-in':
        query._condBuilder.whereContainedIn(key, value);
        break;
      case 'not-contained-in':
        query._condBuilder.whereNotContainedIn(key, value);
        break;
      case 'near':
        query._condBuilder.whereNear(key, value);
        break;
      case 'within':
        query._condBuilder.whereWithinGeoBox(key, value.southwest, value.northeast);
        break;
      case 'within-radians':
        query._condBuilder.whereWithinRadians(key, value.point, value.max, value.min);
        break;
      case 'within-miles':
        query._condBuilder.whereWithinMiles(key, value.point, value.max, value.min);
        break;
      case 'within-kilometers':
        query._condBuilder.whereWithinKilometers(key, value.point, value.max, value.min);
        break;
      default:
        throw new TypeError('Unsupported query condition: ' + condition);
    }
    return query;
  }

  toJSON(): Condition {
    if (this._siblingOr) {
      if (this._condBuilder.isEmpty()) {
        return this._siblingOr.toJSON();
      }
      const or = this._siblingOr;
      this._siblingOr = null;
      const json = Query.or(or, this).toJSON();
      this._siblingOr = or;
      return json;
    }
    return this._condBuilder.build();
  }

  toString(): string {
    return JSON.stringify(this);
  }

  subscribe(options?: AuthOptions): Promise<LiveQuery> {
    const liveQuery = PluginManager.plugins['LiveQuery'] as typeof LiveQuery;
    assert(liveQuery, 'Query#subscribe needs the LiveQuery plugin');
    return liveQuery.subscribe(this, options);
  }

  protected _clone(): Query {
    const query = new Query(this.app, this.className);
    this._fill(query);
    return query;
  }

  protected _fill(query: Query): void {
    query._condBuilder = this._condBuilder.clone();
    query._options = cloneDeep(this._options);
    query._siblingOr = this._siblingOr;
  }

  protected _makeRequest(options?: AuthOptions): AppRequest {
    const req: AppRequest = {
      method: 'GET',
      path: `/classes/${this.className}`,
      query: {
        where: this.toString(),
        limit: this._options.limit,
        skip: this._options.skip,
        returnACL: this._options.returnACL,
        include: this._options.include?.join(','),
        order: this._options.order?.join(','),
      },
      options,
    };
    const keys = [this._options.select || [], this._options.except || []].flat();
    if (keys.length) {
      req.query.keys = keys.join(',');
    }
    return req;
  }
}

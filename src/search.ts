import { App, AuthOptions, AppRequest } from './app';
import { LCObject } from './object';
import { GeoPoint } from './geo-point';
import { mustGetDefaultApp } from './app/default-app';

interface SearchSortOrderOptions {
  mode?: 'min' | 'max' | 'sum' | 'avg';
  missing?: 'first' | 'last';
}

interface SearchSortNearOptions {
  order?: 'asc' | 'desc';
  mode?: SearchSortOrderOptions['mode'];
  unit?: 'cm' | 'm' | 'km';
}

/**
 * @internal
 */
interface SearchResultRaw {
  sid: number;
  hits: number;
  results: Record<string, unknown>[];
}

class SearchResult {
  sid?: number;
  hits?: number;
  data?: LCObject[];

  constructor(private _app: App, raw: SearchResultRaw) {
    this.sid = raw.sid;
    this.hits = raw.hits ?? 0;
    this.data = raw.results?.map((result) => this._app.decode(result, { type: 'Object' }));
  }

  async next(options?: AuthOptions): Promise<SearchResult> {
    if (this.data.length === 0) {
      return this;
    }
    const json = await this._app.request({
      method: 'GET',
      path: `/search/select`,
      query: { sid: this.sid },
      options,
    });
    return new SearchResult(this._app, json as SearchResultRaw);
  }
}

export class SearchSortBuilder {
  private _sortFields: Record<string, unknown>[] = [];

  orderBy(key: string, order: 'asc' | 'desc', options?: SearchSortOrderOptions): this {
    const field: Record<string, unknown> = { order };
    if (options?.mode) {
      field.mode = options.mode;
    }
    if (options?.missing) {
      field.missing = '_' + options.missing;
    }
    this._sortFields.push({ [key]: field });
    return this;
  }

  whereNear(key: string, point: GeoPoint, options?: SearchSortNearOptions): this {
    const field = {
      ...options,
      [key]: { lat: point.latitude, lon: point.longitude },
    };
    this._sortFields.push({ _geo_distance: field });
    return this;
  }

  toString(): string {
    return JSON.stringify(this._sortFields);
  }
}

export class SearchQuery {
  app: App;
  className: string;

  private _q: string;
  private _skip: number;
  private _limit: number;
  private _sid: string;
  private _fields: string[];
  private _highlights: string[];
  private _include: string[];
  private _order: string[] = [];
  private _sort: string;

  constructor();
  constructor(app: App);
  constructor(className: string);
  constructor(app: App, className: string);
  constructor(arg1?: App | string, arg2?: string) {
    if (arg1 instanceof App) {
      this.app = arg1;
    }
    if (typeof arg1 === 'string') {
      this.className = arg1;
    }
    if (this.app === undefined) {
      this.app = mustGetDefaultApp();
    }
    if (this.className === undefined) {
      this.className = arg2;
    }
  }

  queryString(q: string): SearchQuery {
    const query = this._clone();
    query._q = q;
    return query;
  }

  skip(count: number): SearchQuery {
    const query = this._clone();
    query._skip = count;
    return query;
  }

  limit(count: number): SearchQuery {
    const query = this._clone();
    query._limit = count;
    return query;
  }

  sid(sid: string): SearchQuery {
    const query = this._clone();
    query._sid = sid;
    return query;
  }

  fields(...fields: string[]): SearchQuery {
    const query = this._clone();
    query._fields = fields;
    return query;
  }

  highlights(...highlights: string[]): SearchQuery {
    const query = this._clone();
    query._highlights = highlights;
    return query;
  }

  include(...keys: string[]): SearchQuery {
    const query = this._clone();
    query._include = keys;
    return query;
  }

  async find(options?: AuthOptions): Promise<SearchResult> {
    const json = await this.app.request(this._makeRequest(options));
    return new SearchResult(this.app, json as SearchResultRaw);
  }

  orderBy(key: string, direction?: 'asc' | 'desc'): SearchQuery {
    const query = this._clone();
    if (direction === 'desc') {
      query._order.push('-' + key);
    } else {
      query._order.push(key);
    }
    return query;
  }

  sortBy(builder: SearchSortBuilder): SearchQuery {
    const query = this._clone();
    query._sort = builder.toString();
    return query;
  }

  private _makeRequest(options?: AuthOptions): AppRequest {
    const req: AppRequest = {
      method: 'GET',
      path: `/search/select`,
      query: {
        q: this._q,
        skip: this._skip,
        limit: this._limit,
        sid: this._sid,
        clazz: this.className,
        sort: this._sort,
      },
      options,
    };
    if (this._fields) {
      req.query.fields = this._fields.join(',');
    }
    if (this._highlights) {
      req.query.highlights = this._highlights.join(',');
    }
    if (this._include) {
      req.query.include = this._include.join(',');
    }
    if (this._order.length) {
      req.query.order = this._order?.join(',');
    }
    return req;
  }

  private _clone(): SearchQuery {
    const query = new SearchQuery(this.app, this.className);
    query._q = this._q;
    query._skip = this._skip;
    query._limit = this._limit;
    query._sid = this._sid;
    query._fields = this._fields;
    query._highlights = this._highlights;
    query._sort = this._sort;
    query._include = this._include;
    query._order = [...this._order];
    return query;
  }
}

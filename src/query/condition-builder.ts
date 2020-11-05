import { isEmpty, cloneDeep } from 'lodash';
import { GeoPoint, GeoPointLike } from '../geo-point';
import { LCEncode } from '../object';

export interface RegExpLike {
  source: string;
  ignoreCase?: boolean;
  ignoreBlank?: boolean;
  multiline?: boolean;
  dotAll?: boolean;
}

export interface Condition extends Record<string, any> {
  $and?: Condition[];
  $or?: Condition[];
}

function quote(s: string): string {
  return '\\Q' + s.replace('\\E', '\\E\\\\E\\Q') + '\\E';
}

export class ConditionBuilder {
  protected _where: Condition = {};

  static and(conditions: Condition[]): ConditionBuilder {
    const builder = new ConditionBuilder();
    builder._where = { $and: conditions };
    return builder;
  }

  static or(conditions: Condition[]): ConditionBuilder {
    const builder = new ConditionBuilder();
    builder._where = { $or: conditions };
    return builder;
  }

  isEmpty(): boolean {
    return isEmpty(this._where);
  }

  build(): Condition {
    const where = { ...this._where };
    Object.keys(where).forEach((key) => {
      if (where[key].$eq !== undefined) {
        where[key] = where[key].$eq;
      }
    });
    return where;
  }

  toJSON(): Condition {
    return this.build();
  }

  clone(): ConditionBuilder {
    const builder = new ConditionBuilder();
    builder._where = cloneDeep(this._where);
    return builder;
  }

  protected _addCondition(key: string, condition: string, value: any): void {
    if (!this._where[key]) {
      this._where[key] = {};
    }
    delete this._where[key].$eq;
    this._where[key][condition] = LCEncode(value);
  }

  whereEqualTo(key: string, value: any): void {
    // ATTENTION: '$eq' is a dummy condition, do not send it to the backend.
    this._addCondition(key, '$eq', value);
  }

  whereNotEqualTo(key: string, value: any): void {
    this._addCondition(key, '$ne', value);
  }

  whereGreaterThan(key: string, value: any): void {
    this._addCondition(key, '$gt', value);
  }

  whereGreaterThanOrEqualTo(key: string, value: any): void {
    this._addCondition(key, '$gte', value);
  }

  whereLessThan(key: string, value: any): void {
    this._addCondition(key, '$lt', value);
  }

  whereLessThanOrEqualTo(key: string, value: any): void {
    this._addCondition(key, '$lte', value);
  }

  whereExists(key: string): void {
    this._addCondition(key, '$exists', true);
  }

  whereNotExists(key: string): void {
    this._addCondition(key, '$exists', false);
  }

  whereSizeEqual(key: string, value: number): void {
    this._addCondition(key, '$size', value);
  }

  whereMatchesKeyInQuery(
    key: string,
    className: string,
    queryKey: string,
    condition: Condition
  ): void {
    this._addCondition(key, '$select', {
      key: queryKey,
      query: {
        className,
        where: condition,
      },
    });
  }

  whereDoesNotMatcheKeyInQuery(
    key: string,
    className: string,
    queryKey: string,
    condition: Condition
  ): void {
    this._addCondition(key, '$dontSelect', {
      key: queryKey,
      query: {
        className,
        where: condition,
      },
    });
  }

  whereMachesQuery(key: string, className: string, condition: Condition): void {
    this._addCondition(key, '$inQuery', {
      className,
      where: condition,
    });
  }

  whereDoesNotMatchQuery(key: string, className: string, condition: Condition): void {
    this._addCondition(key, '$notInQuery', {
      className,
      where: condition,
    });
  }

  whereMatches(key: string, value: string | RegExpLike): void {
    let $regex: string;
    let $options = '';
    if (typeof value === 'string') {
      $regex = value;
    } else {
      $regex = value.source;
      if (value.ignoreCase) {
        $options += 'i';
      }
      if (value.multiline) {
        $options += 'm';
      }
      if (value.ignoreBlank) {
        $options += 'x';
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

  whereStartsWith(key: string, value: string): void {
    this.whereMatches(key, '^' + quote(value));
  }

  whereEndsWith(key: string, value: string): void {
    this.whereMatches(key, quote(value) + '$');
  }

  whereContains(key: string, value: string): void {
    this.whereMatches(key, quote(value));
  }

  whereContainsAll(key: string, values: any[]): void {
    this._addCondition(key, '$all', values);
  }

  whereContainedIn(key: string, values: any[]): void {
    this._addCondition(key, '$in', values);
  }

  whereNotContainedIn(key: string, values: any[]): void {
    this._addCondition(key, '$nin', values);
  }

  whereNear(key: string, point: GeoPointLike): void {
    this._addCondition(key, '$nearSphere', new GeoPoint(point));
  }

  whereWithinGeoBox(key: string, southwest: GeoPointLike, northeast: GeoPointLike): void {
    this._addCondition(key, '$within', {
      $box: [new GeoPoint(southwest), new GeoPoint(northeast)],
    });
  }

  whereWithinRadians(key: string, point: GeoPointLike, maxDistance: number, minDistance?: number) {
    this.whereNear(key, point);
    this._addCondition(key, '$maxDistanceInRadians', maxDistance);
    if (minDistance !== undefined) {
      this._addCondition(key, '$minDistanceInRadians', minDistance);
    }
  }

  whereWithinMiles(key: string, point: GeoPointLike, maxDistance: number, minDistance?: number) {
    this.whereNear(key, point);
    this._addCondition(key, '$maxDistanceInMiles', maxDistance);
    if (minDistance !== undefined) {
      this._addCondition(key, '$minDistanceInMiles', minDistance);
    }
  }

  whereWithinKilometers(
    key: string,
    point: GeoPointLike,
    maxDistance: number,
    minDistance?: number
  ) {
    this.whereNear(key, point);
    this._addCondition(key, '$maxDistanceInKilometers', maxDistance);
    if (minDistance !== undefined) {
      this._addCondition(key, '$minDistanceInKilometers', minDistance);
    }
  }
}

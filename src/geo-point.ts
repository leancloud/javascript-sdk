export interface GeoPointLike {
  latitude: number;
  longitude: number;
}

export class GeoPoint {
  __type = 'GeoPoint';
  latitude: number;
  longitude: number;

  constructor(latitude: number, longitude: number);
  constructor(point: GeoPointLike);
  constructor(arg: number | GeoPointLike, longitude?: number) {
    if (typeof arg === 'number') {
      this.latitude = arg;
      if (!longitude) {
        throw new Error('The longitude is required');
      }
      this.longitude = longitude;
    } else {
      this.latitude = arg.latitude;
      this.longitude = arg.longitude;
    }
  }
}

export function isGeoPointLike(value: any): value is GeoPointLike {
  return (
    value &&
    value.__type === 'GeoPoint' &&
    typeof value.latitude === 'number' &&
    typeof value.longitude === 'number'
  );
}

interface Point {
  latitude: number;
  longitude: number;
}

export class GeoPoint {
  __type = 'GeoPoint';
  latitude: number;
  longitude: number;

  constructor(latitude: number, longitude: number);
  constructor(point: Point);
  constructor(arg: Point | number, longitude?: number) {
    if (typeof arg === 'number') {
      this.latitude = arg;
      this.longitude = longitude;
    } else {
      this.latitude = arg.latitude;
      this.longitude = arg.longitude;
    }
  }
}

import 'should';
import { GeoPoint } from '../../src/geo-point';

describe('GeoPoint', function () {
  describe('constructor', function () {
    it('can be created by latitude and longitude', function () {
      const gp = new GeoPoint(12, 34);
      gp.latitude.should.eql(12);
      gp.longitude.should.eql(34);
    });

    it('can be created by a point', function () {
      const gp = new GeoPoint({ latitude: 12, longitude: 34 });
      gp.latitude.should.eql(12);
      gp.longitude.should.eql(34);
    });
  });

  it('check JSON string', function () {
    JSON.stringify(new GeoPoint(12, 34)).should.eql(
      JSON.stringify({
        __type: 'GeoPoint',
        latitude: 12,
        longitude: 34,
      })
    );
  });
});

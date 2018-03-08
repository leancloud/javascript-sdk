'use strict';

describe.skip('App Searching', function() {
  describe('#AV.SearchSortBuilder', function() {
    it('should build sort string.', function() {
      var builder = new AV.SearchSortBuilder();
      var s = builder
        .ascending('a')
        .descending('b', 'max')
        .whereNear('location', new AV.GeoPoint(10, 20), {
          order: 'desc',
        })
        .build();
      expect(s).to.be(
        '[{"a":{"order":"asc","mode":"avg","missing":"_last"}},{"b":{"order":"desc","mode":"max","missing":"_last"}},{"_geo_distance":{"order":"desc","mode":"avg","unit":"km","location":{"lat":10,"lon":20}}}]'
      );
    });
  });

  describe('#AV.SearchQuery', function() {
    it('should find something.', function() {
      var q = new AV.SearchQuery('GameScore');
      q.queryString('*');
      return q.find().then(function(results) {
        expect(q.hits()).to.be.greaterThan(0);
        expect(results[0]).to.be.an(AV.Object);
      });
    });

    it('should sort by score.', function() {
      var q = new AV.SearchQuery('GameScore');
      q.descending('score');
      q.queryString('*');
      return q.find().then(function(results) {
        expect(q.hits()).to.be.greaterThan(0);
        console.dir(results);
        expect(results[0].appURL).to.be.ok();
        expect(results[0].get('score') >= results[1].get('score')).to.be.ok();
      });
    });

    it('should sort by score with sort builder.', function() {
      var q = new AV.SearchQuery('GameScore');
      q.sortBy(new AV.SearchSortBuilder().descending('score'));
      q.queryString('*');
      return q.find().then(function(results) {
        expect(q.hits()).to.be.greaterThan(0);
        console.dir(results);
        expect(results[0].get('score') >= results[1].get('score')).to.be.ok();
      });
    });
  });
});

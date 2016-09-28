'use strict';

var GameScore = AV.Object.extend('GameScore');
var ES5Person = AV.Object.extend('Person');
var TestClass = AV.Object.extend('TestClass');
var query = new AV.Query(GameScore);

describe('Queries', function () {
  describe('#Basic Queries', function () {
    it('should return Class Array', function () {

      query = new AV.Query(GameScore);
      //query.equalTo('playerName', 'testname');
      query.exists('objectId');
      //query.equalTo('arr','arr1');
      return query.find().then(function(results) {
        debug(results);
        expect(results).to.be.an('array');
      });
    });

    it('should return TestClass', function() {
      return new TestClass({
        name: 'hjiang',
        phone: '123123123'
      }).save().then(function() {
        return new AV.Query(TestClass).equalTo('name', 'hjiang').find();
      }).then(function(testObjects) {
        expect(testObjects[0].get('name')).to.be('hjiang');
      });
    });

    it('should throw when get null', function () {

      query = new AV.Query(GameScore);
      expect(function() {
        query.get(null);
      }).to.throwError();
      expect(function() {
        query.get(undefined);
      }).to.throwError();

    });

  });

  describe('#cloudQuery', function () {
    it('should return results.', function () {
      return AV.Query.doCloudQuery('select * from GameScore').then(function (result) {
        debug(result);
        var results = result.results;
        expect(results[0].className).to.be('GameScore');
        expect(result.count).to.be(undefined);
        expect(result.className).to.be('GameScore');
      });
    });
    it('should return limited results.', function () {
      return AV.Query.doCloudQuery('select * from GameScore limit 10').then(function (result) {
        debug(result);
        var results = result.results;
        expect(results.length).to.be(10);
        expect(results[0].className).to.be('GameScore');
        expect(result.count).to.be(undefined);
        expect(result.className).to.be('GameScore');
      });
    });
    it('should return count value.', function () {
      return AV.Query.doCloudQuery('select *,count(objectId) from GameScore limit 10').then(function (result) {
        debug(result);
        var results = result.results;
        expect(results.length).to.be(10);
        expect(results[0].className).to.be('GameScore');
        expect(result.count).to.be.an('number');
        expect(result.className).to.be('GameScore');
      });
    });
    it('should return count value too.', function () {
      return AV.Query.doCloudQuery('select *,count(objectId) from GameScore limit ?', [5]).then(function (result) {
        debug(result);
        var results = result.results;
        expect(results.length).to.be(5);
        expect(results[0].className).to.be('GameScore');
        expect(result.count).to.be.an('number');
        expect(result.className).to.be('GameScore');
      });
    });
    it('should return syntax error.', function () {
      return AV.Query.doCloudQuery('select * GameScore limit 10').should.be.rejectedWith({
        code: 300,
      });
    });
  });

  describe('#save&query()', function () {
    it.skip('should length + 1', function () {
      query = new AV.Query(GameScore);
      query.limit(1000);
      var l = 0;
      return query.find().then(function (results) {
        debug(results);
        expect(results).to.be.an('array');
        l = results.length;
        var gameScore = new GameScore();
        return gameScore.save().then(function (result) {
          expect(result.id).to.be.ok();
          return query.find();
        }).then(function (results) {
          expect(results).to.be.an('array');
          expect(results.length).to.be(l + 1);
          return gameScore.destroy();
        });
      });
    });
  });

  describe('Query Constraints', function () {
    before(function() {
      return new GameScore({
        playerName: 'testname',
      }).save().then(gameScore => this.gameScore = gameScore);
    });

    after(function() {
      return this.gameScore.destroy();
    });

    it('basic', function () {
      query = new AV.Query(GameScore);
      query.equalTo('playerName', 'testname');
      return query.first().then(gameScore => {
        expect(gameScore.get('playerName')).to.be('testname');
      });
    });

    it('param check', () => {
      const query = new AV.Query(GameScore);
      expect(() => query.equalTo('playerName', undefined)).to.throwError();
      expect(() => query.contains('playerName', undefined)).to.throwError();
      expect(() => query.limit(undefined)).to.throwError();
      expect(() => query.addAscending(undefined)).to.throwError();
    });

    it('sizeEqualTo', function () {
      var gameScore = new GameScore();
      return gameScore.save({
        players: ['a', 'b']
      }).then(function () {
        query = new AV.Query(GameScore);
        query.sizeEqualTo('players', 2);
        return query.first();
      }).then(function (object) {
        expect(object.get('players').length).to.be(2);
        return gameScore.destroy();
      });
    });
  });

  describe('Query with different condtions', function () {

    it('query doncition with array', function () {
      query = new AV.Query(GameScore);
      query.equalTo('arr', 'arr1');
      return query.first();
    });

    /*
       it('query doncition with string',function(done){
       query = new AV.Query(GameScore);
       query.startsWith('playerName', 'test');
       query.first({
       success: function(object) {
       expect(object.id).to.be.ok();
       done();
       },
       error: function(error) {
       throw error;
       }
       });
       });

*/
  });

  var Post = AV.Object.extend('Post');
  var Comment = AV.Object.extend('Comment');

  describe('Relational Queries', function () {
    // it('should return comments of one post',function(done){
    // 	query = new AV.Query(Post);
    // 	query.equalTo('title','post1');
    // 	query.first({
    // 		success:function(post){

    // 			query = new AV.Query(Comment);

    // 			query.equalTo('parent', post);
    // 			query.find({
    // 			  success: function(comments) {
    // 			    // comments now contains the comments for myPost
    // 			    done();
    // 			  }
    // 			});
    // 		}
    // 	})
    // })


    it('should return relation count', function () {


      // userQ.count(function(c){
      // 	debug(c)
      // })

      var userQ = new AV.Query('Person');

      return userQ.get('52f9bea1e4b035debf88b730').then(function (p) {
        p.relation('likes').query();
        // p.relation('likes').query().count().then(function(c){
        // 	debug(c)
        // })
        debug(p);
      });

      // userQ.first().then(function(p){

      // 	debug(p)
      // 	return p.relation('likes').query().count()
      // }).then(function(count){
      // 	debug(count);
      // 	done();
      // })
    });



  });

  describe('destroyAll', function () {
    it('should be deleted', function () {
      // save some objects
      var promises = [];
      for (var i = 0; i < 10; i++) {
        var test = new AV.Object('deletedAll');
        test.set('number', i);
        promises.unshift(test.save());
      }
      return AV.Promise.all(promises).then(function () {
        return new AV.Query('deletedAll').limit(300).destroyAll();
      }).then(function() {
        return new AV.Query('deletedAll').count();
      }).then(function(count) {
        expect(count).to.be(0);
      });
    });
  });

  describe('Counts', function () {
    it('should return num', function () {
      query = new AV.Query(ES5Person);
      query.startsWith('pname', 'p');
      return query.count().then(function (count) {
        expect(count).to.be.a('number');
      });
    });
  });

  describe('Compound Query', function () {
    it('should satisfy on \'or\' conditions', function () {
      var lotsOfWins = new AV.Query('GameScore');
      lotsOfWins.greaterThan('score', 150);

      var fewWins = new AV.Query('GameScore');
      fewWins.equalTo('cheatMode', true);

      var mainQuery = AV.Query.or(lotsOfWins, fewWins);
      return mainQuery.find().then(function (results) {
        results.forEach(function (gs) {
          expect(gs.get('score') > 150 || gs.get('cheatMode')).to.be.ok();
        });
        // results contains a list of players that either have won a lot of games or won only a few games.
      });
    });
    it('should satisfy on \'and\' conditions', function () {
      var lotsOfWins = new AV.Query('GameScore');
      lotsOfWins.greaterThan('score', 150);

      var fewWins = new AV.Query('GameScore');
      fewWins.equalTo('cheatMode', true);

      var mainQuery = AV.Query.and(lotsOfWins, fewWins);
      return mainQuery.find().then(function (results) {
        results.forEach(function (gs) {
          expect(gs.get('score') > 150 && gs.get('cheatMode')).to.be.ok();
        });
        // results contains a list of players that either have won a lot of games or won only a few games.
      });
    });
  });

  describe('All Files', function () {
    it('should return AV.File Object list', function () {
      query = new AV.Query(AV.File);
      return query.find().then(function(results) {
        expect(results.length > 0).to.be.ok();
        expect(results[0].get('metaData')).to.be.ok();
      });
    });
  });

  describe('All User', function () {
    it('should return AV.User Object list', function () {
      query = new AV.Query(AV.User);
      return query.find().then(function(results) {
        expect(results.length > 0).to.be.ok();
        expect(results[0].get('username')).to.be.ok();
      });
    });
  });

});

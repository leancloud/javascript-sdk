'use strict';

import { setupPolly } from './polly';

var GameScore = AV.Object.extend('GameScore');
var ES5Person = AV.Object.extend('Person');
var TestClass = AV.Object.extend('TestClass');
var query = new AV.Query(GameScore);

describe('Queries', function() {
  setupPolly();

  it('serialize and parse', () => {
    const json = new AV.Query(GameScore)
      .equalTo('a', 1)
      .lessThan('b', 2)
      .contains('c', 'c')
      .limit(1)
      .select('z')
      .select('y')
      .include('z')
      .includeACL(true)
      .addAscending('a')
      .addAscending('b')
      .toJSON();
    const newQuery = AV.Query.fromJSON(json);
    newQuery.toJSON().should.eql(json);
  });

  describe('#Basic Queries', function() {
    it('should return Class Array', function() {
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
        phone: '123123123',
      })
        .save()
        .then(function() {
          return new AV.Query(TestClass).equalTo('name', 'hjiang').find();
        })
        .then(function(testObjects) {
          expect(testObjects[0].get('name')).to.be('hjiang');
        });
    });

    it('should throw when get null', function() {
      query = new AV.Query(GameScore);
      expect(function() {
        query.get(null);
      }).to.throwError();
      expect(function() {
        query.get(undefined);
      }).to.throwError();
    });
    it('should throw when object not exists', function() {
      query = new AV.Query(GameScore);
      return query.get('123').should.be.rejectedWith(/Object not found/);
    });
  });

  it('#File Query', () => {
    const fileId = process.env.FILE_ID || '52f9dd5ae4b019816c865985';
    query = new AV.Query(AV.File);
    query.equalTo('objectId', fileId);
    return query.find().then(([file]) => {
      expect(file).to.be.a(AV.File);
      expect(file.id).to.be(fileId);
      expect(file.name()).to.be('myfile.txt');
      expect(file.get('mime_type')).to.be('text/plain');
      expect(typeof file.url()).to.be('string');
    });
  });

  describe('#cloudQuery', function() {
    it('should return results.', function() {
      return AV.Query.doCloudQuery('select * from GameScore').then(function(
        result
      ) {
        debug(result);
        var results = result.results;
        expect(results[0].className).to.be('GameScore');
        expect(result.count).to.be(undefined);
        expect(result.className).to.be('GameScore');
      });
    });
    it('should return limited results.', function() {
      return AV.Query.doCloudQuery('select * from GameScore limit 10').then(
        function(result) {
          debug(result);
          var results = result.results;
          expect(results.length).to.be(10);
          expect(results[0].className).to.be('GameScore');
          expect(result.count).to.be(undefined);
          expect(result.className).to.be('GameScore');
        }
      );
    });
    it('should return count value.', function() {
      return AV.Query.doCloudQuery(
        'select *,count(objectId) from GameScore limit 10'
      ).then(function(result) {
        debug(result);
        var results = result.results;
        expect(results.length).to.be(10);
        expect(results[0].className).to.be('GameScore');
        expect(result.count).to.be.an('number');
        expect(result.className).to.be('GameScore');
      });
    });
    it('should return count value too.', function() {
      return AV.Query.doCloudQuery(
        'select *,count(objectId) from GameScore limit ?',
        [5]
      ).then(function(result) {
        debug(result);
        var results = result.results;
        expect(results.length).to.be(5);
        expect(results[0].className).to.be('GameScore');
        expect(result.count).to.be.an('number');
        expect(result.className).to.be('GameScore');
      });
    });
    it('should return syntax error.', function() {
      return AV.Query.doCloudQuery(
        'select * GameScore limit 10'
      ).should.be.rejectedWith({
        code: 300,
      });
    });
  });

  describe('#save&query()', function() {
    it.skip('should length + 1', function() {
      query = new AV.Query(GameScore);
      query.limit(1000);
      var l = 0;
      return query.find().then(function(results) {
        debug(results);
        expect(results).to.be.an('array');
        l = results.length;
        var gameScore = new GameScore();
        return gameScore
          .save()
          .then(function(result) {
            expect(result.id).to.be.ok();
            return query.find();
          })
          .then(function(results) {
            expect(results).to.be.an('array');
            expect(results.length).to.be(l + 1);
            return gameScore.destroy();
          });
      });
    });
  });

  describe('Query Constraints', function() {
    beforeEach(function() {
      return new GameScore({
        playerName: 'testname',
        score: 1000,
        players: ['a', 'b'],
        test: new TestClass({ foo: 'bar' }),
      })
        .save()
        .then(gameScore => (this.gameScore = gameScore));
    });

    afterEach(function() {
      return this.gameScore.destroy();
    });

    it('basic', function() {
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

    it('sizeEqualTo', function() {
      var gameScore = new GameScore();
      var query = new AV.Query(GameScore);
      query.sizeEqualTo('players', 2);
      return query.first().then(function(object) {
        expect(object.get('players').length).to.be(2);
        return gameScore.destroy();
      });
    });

    it('select with multi params', function() {
      return new AV.Query(GameScore)
        .select('test', 'score')
        .equalTo('objectId', this.gameScore.id)
        .find()
        .then(([gameScore]) => {
          expect(gameScore.get('score')).to.be(1000);
          expect(gameScore.get('playerName')).to.be(undefined);
        });
    });

    it('select', function() {
      return new AV.Query(GameScore)
        .select(['test', 'score'])
        .equalTo('objectId', this.gameScore.id)
        .find()
        .then(([gameScore]) => {
          expect(gameScore.get('score')).to.be(1000);
          expect(gameScore.get('playerName')).to.be(undefined);
        });
    });

    it('include with multi params', function() {
      return new AV.Query(GameScore)
        .include('score', 'test')
        .equalTo('objectId', this.gameScore.id)
        .find()
        .then(([gameScore]) => {
          expect(gameScore.get('test').get('foo')).to.be('bar');
        });
    });

    it('include', function() {
      return new AV.Query(GameScore)
        .include(['score', 'test'])
        .equalTo('objectId', this.gameScore.id)
        .find()
        .then(([gameScore]) => {
          expect(gameScore.get('test').get('foo')).to.be('bar');
        });
    });

    it('includeACL', function() {
      return new AV.Query(GameScore)
        .includeACL()
        .equalTo('objectId', this.gameScore.id)
        .find()
        .then(([gameScore]) => {
          gameScore.getACL().should.be.instanceOf(AV.ACL);
        });
    });

    it('containsAll with an large array should not cause URI too long', () => {
      return new AV.Query(GameScore)
        .containsAll('arr', new Array(200).fill('contains-all-test'))
        .find()
        .then(gameScores => {
          gameScores.should.have.length(1);
        });
    });
  });

  describe('Query with different condtions', function() {
    it('query doncition with array', function() {
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

  describe('Relational Queries', function() {
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

    it('should return relation count', function() {
      // userQ.count(function(c){
      // 	debug(c)
      // })

      var userQ = new AV.Query('Person');

      return userQ.first().then(function(p) {
        return p
          .relation('likes')
          .query()
          .count();
        // p.relation('likes').query().count().then(function(c){
        // 	debug(c)
        // })
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

  describe('destroyAll', function() {
    it('should be deleted', function() {
      // save some objects
      var promises = [];
      for (var i = 0; i < 10; i++) {
        var test = new AV.Object('deletedAll');
        test.set('number', i);
        promises.unshift(test.save());
      }
      return Promise.all(promises)
        .then(function() {
          return new AV.Query('deletedAll').limit(300).destroyAll();
        })
        .then(function() {
          return new AV.Query('deletedAll').count();
        })
        .then(function(count) {
          expect(count).to.be(0);
        });
    });
  });

  describe('Counts', function() {
    it('should return num', function() {
      query = new AV.Query(ES5Person);
      query.startsWith('pname', 'p');
      return query.count().then(function(count) {
        expect(count).to.be.a('number');
      });
    });
  });

  describe('Compound Query', function() {
    it("should satisfy on 'or' conditions", function() {
      var lotsOfWins = new AV.Query('GameScore');
      lotsOfWins.greaterThan('score', 150);

      var fewWins = new AV.Query('GameScore');
      fewWins.equalTo('cheatMode', true);

      var mainQuery = AV.Query.or(lotsOfWins, fewWins);
      return mainQuery.find().then(function(results) {
        results.forEach(function(gs) {
          expect(gs.get('score') > 150 || gs.get('cheatMode')).to.be.ok();
        });
        // results contains a list of players that either have won a lot of games or won only a few games.
      });
    });
    it("should satisfy on 'and' conditions", function() {
      var lotsOfWins = new AV.Query('GameScore');
      lotsOfWins.greaterThan('score', 150);

      var fewWins = new AV.Query('GameScore');
      fewWins.equalTo('cheatMode', true);

      var mainQuery = AV.Query.and(lotsOfWins, fewWins);
      return mainQuery.find().then(function(results) {
        results.forEach(function(gs) {
          expect(gs.get('score') > 150 && gs.get('cheatMode')).to.be.ok();
        });
        // results contains a list of players that either have won a lot of games or won only a few games.
      });
    });
  });

  describe('All Files', function() {
    it('should return AV.File Object list', function() {
      query = new AV.Query(AV.File);
      return query.find().then(function(results) {
        expect(results.length > 0).to.be.ok();
        expect(results[0].get('metaData')).to.be.ok();
      });
    });
  });

  describe('All User', function() {
    it('should return AV.User Object list', function() {
      query = new AV.Query(AV.User);
      return query.find({ useMasterKey: true }).then(function(results) {
        expect(results.length > 0).to.be.ok();
        expect(results[0].get('username')).to.be.ok();
      });
    });
  });

  describe('scan', () => {
    const now = 1568867865073;
    before(function() {
      this.savePromise = AV.Object.saveAll(
        new Array(4).fill(now).map(ts => new TestClass().set('timestamp', ts))
      );
      return this.savePromise;
    });

    after(function() {
      return this.savePromise.then(AV.Object.destroyAll);
    });

    it('should works', () => {
      const scan = new AV.Query(TestClass).equalTo('timestamp', now).scan(
        {
          orderedBy: 'objectId',
          batchSize: 2,
        },
        {
          useMasterKey: true,
        }
      );
      return scan
        .next()
        .then(({ value, done }) => {
          value.should.be.instanceof(TestClass);
          done.should.be.false();
        })
        .then(() => scan.next())
        .then(({ value, done }) => {
          value.should.be.instanceof(TestClass);
          done.should.be.false();
        })
        .then(() => scan.next())
        .then(({ value, done }) => {
          value.should.be.instanceof(TestClass);
          done.should.be.false();
        })
        .then(() => scan.next())
        .then(({ value, done }) => {
          value.should.be.instanceof(TestClass);
          done.should.be.false();
        })
        .then(() => scan.next())
        .then(({ value, done }) => {
          expect(value).to.eql(undefined);
          done.should.be.true();
        });
    });
  });
});

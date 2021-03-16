'use strict';

import { forceDeleteUser } from './util';
import { setupPolly } from './polly';

var GameScore = AV.Object.extend('GameScore');

var Post = AV.Object.extend('Post');

// for #extend test
class Person extends AV.Object {}
class UglifiedClass extends AV.Object {}
var BackbonePerson = AV.Object.extend('Person');

describe('Objects', function() {
  setupPolly();

  var objId;
  var gameScore = GameScore.new();
  after(function() {
    return gameScore.destroy();
  });
  it('getter/setter compatible', function() {
    Object.defineProperty(Post.prototype, 'name', {
      get: function() {
        return this.get('name');
      },
      set: function(value) {
        return this.set('name', value);
      },
    });
    new Post().name;
  });

  it('reserved keys', () => {
    (() =>
      new Person({
        objectId: '0',
      })).should.throwError(/reserved/);
    (() =>
      new Person({
        createdAt: '0',
      })).should.throwError(/reserved/);
    (() =>
      new Person({
        updatedAt: '0',
      })).should.throwError(/reserved/);
    (() => new Person().set('objectId', '1')).should.throwError(/reserved/);
  });

  describe('#extend', () => {
    it('extend for multiple times should not throw', () => {
      let Test;
      for (var i = 100000; i > 0; i--) {
        Test = AV.Object.extend('Test');
      }
      const test = new Test();
      expect(test.className).to.eql('Test');
    });

    it('ES6 extend syntex', () => {
      var backbonePerson = new BackbonePerson();
      backbonePerson.set('name', 'leeyeh');
      var es6Person = new Person();
      es6Person.set('name', 'leeyeh');
      expect(backbonePerson.toJSON()).to.eql(es6Person.toJSON());
      expect(backbonePerson._toFullJSON()).to.eql(es6Person._toFullJSON());
    });

    it('createWithoutData', () => {
      expect(AV.Object.createWithoutData(Person, 'id') instanceof Person).to.be(
        true
      );
      expect(
        AV.Object.createWithoutData('Person', 'id') instanceof BackbonePerson
      ).to.be(true);
    });

    it('#register an ES6 class', () => {
      expect(new AV.Object('Person')).to.be.a(BackbonePerson);
      AV.Object.register(Person);
      expect(new AV.Object('Person')).to.be.a(Person);
      expect(() => AV.Object.register(1)).to.throwError();
      expect(() => AV.Object.register(function() {})).to.throwError();
    });

    it('#register with name', () => {
      AV.Object.register(UglifiedClass, 'RealClass');
      expect(new AV.Object('RealClass')).to.be.a(UglifiedClass);
      expect(AV._encode(new UglifiedClass()).className).to.equal('RealClass');
    });
  });

  describe('#Saving Objects', function() {
    it('should crate a Object', function() {
      //gameScore.set("newcol","sss")
      var myPost = new Post();
      myPost.set('title', 'post1');
      myPost.set('content', 'Where should we go for lunch?');
      var point = new AV.GeoPoint({ latitude: 80.01, longitude: -30.01 });
      myPost.set('geo', point);
      return myPost.save();
    });

    it('should create another Object', function() {
      gameScore.set('score', 1111);
      gameScore.set('playerName', 'dd');
      gameScore.set('cheatMode', false);
      gameScore.set('arr', ['arr1', 'arr2']);
      gameScore.set('id', 'id');
      return gameScore.save().then(function(result) {
        expect(result.id).to.be.ok();
        objId = result.id;
      });
    });

    it('toJSON and parseJSON', () => {
      const json = gameScore.toJSON();
      json.objectId.should.eql(gameScore.id);
      json.id.should.eql(gameScore.get('id'));
      json.score.should.eql(gameScore.get('score'));
      const parsedGameScore = new GameScore(json, { parse: true });
      parsedGameScore.id.should.eql(gameScore.id);
      parsedGameScore.get('id').should.eql(gameScore.get('id'));
      parsedGameScore.get('score').should.eql(gameScore.get('score'));
    });

    it('stringify and parse', () => {
      const text = AV.stringify(gameScore);
      const parsedGameScore = AV.parse(text);
      parsedGameScore.should.be.instanceof(GameScore);
      parsedGameScore.id.should.eql(gameScore.id);
      parsedGameScore.get('id').should.eql(gameScore.get('id'));
      parsedGameScore.get('score').should.eql(gameScore.get('score'));
    });

    it('toJSON and parse (User)', () => {
      const user = new AV.Object.createWithoutData('_User', 'objectId');
      user.set('id', 'id');
      user.set('score', 20);
      const json = user.toJSON();
      json.objectId.should.eql(user.id);
      json.score.should.eql(user.get('score'));
      const parsedUser = new AV.User(json, { parse: true });
      parsedUser.id.should.eql(user.id);
      parsedUser.get('id').should.eql(user.get('id'));
      parsedUser.get('score').should.eql(user.get('score'));
    });

    it('toJSON for nested objects', () => {
      const id = 'fakeObjectId';
      const a = AV.Object.createWithoutData('A', id, true);
      const b = AV.Object.createWithoutData('B', id, true);
      const c = AV.Object.createWithoutData('C', id, true);
      c.set('foo', 'bar');
      c.set('a', a);
      c.set('b', b);
      b.set('c', c);
      a.set('array', [b, c]);

      a.toJSON().should.eql({
        objectId: id,
        array: [
          {
            objectId: id,
            c: {
              objectId: id,
              foo: 'bar',
              a: { __type: 'Pointer', className: 'A', objectId: id },
              b: { __type: 'Pointer', className: 'B', objectId: id },
            },
          },
          {
            objectId: id,
            foo: 'bar',
            a: { __type: 'Pointer', className: 'A', objectId: id },
            b: {
              objectId: id,
              c: { __type: 'Pointer', className: 'C', objectId: id },
            },
          },
        ],
      });

      a.toFullJSON().should.eql({
        __type: 'Object',
        className: 'A',
        objectId: id,
        array: [
          {
            __type: 'Pointer',
            className: 'B',
            objectId: id,
            c: {
              __type: 'Pointer',
              className: 'C',
              objectId: id,
              foo: 'bar',
              a: { __type: 'Pointer', className: 'A', objectId: id },
              b: { __type: 'Pointer', className: 'B', objectId: id },
            },
          },
          {
            __type: 'Pointer',
            className: 'C',
            objectId: id,
            foo: 'bar',
            a: { __type: 'Pointer', className: 'A', objectId: id },
            b: {
              __type: 'Pointer',
              className: 'B',
              objectId: id,
              c: { __type: 'Pointer', className: 'C', objectId: id },
            },
          },
        ],
      });

      const response = {
        __type: 'Object',
        className: 'A',
        foo: 'bar',
        createdAt: '2017-02-15T14:08:39.892Z',
        updatedAt: '2017-02-20T07:31:57.808Z',
        b: {
          a: {
            foo: 'bar',
            createdAt: '2017-02-15T14:08:39.892Z',
            updatedAt: '2017-02-20T07:31:57.808Z',
            b: {
              __type: 'Pointer',
              className: 'B',
              objectId: '58a461118d6d8100580a0c54',
            },
            time: {
              __type: 'Date',
              iso: '2011-11-11T03:11:11.000Z',
            },
            file: {
              __type: 'Pointer',
              className: '_File',
              objectId: '58a42299570c35006cdfdd5c',
            },
            objectId: '58a460e78d6d810057e9f616',
            __type: 'Pointer',
            className: 'A',
          },
          createdAt: '2017-02-15T14:09:21.965Z',
          updatedAt: '2017-02-15T14:09:21.965Z',
          objectId: '58a461118d6d8100580a0c54',
          __type: 'Pointer',
          className: 'B',
        },
        time: {
          __type: 'Date',
          iso: '2011-11-11T03:11:11.000Z',
        },
        file: {
          mime_type: 'image/jpeg',
          updatedAt: '2017-02-15T09:42:49.960Z',
          name: 'file-name.jpg',
          objectId: '58a42299570c35006cdfdd5c',
          createdAt: '2017-02-15T09:42:49.960Z',
          __type: 'File',
          url: 'http://ac-rYAutyUJ.clouddn.com/9a403255e8e55d309d81.jpg',
          metaData: {
            owner: '589aeac3128fe10058fde344',
          },
          bucket: 'rYAutyUJ',
        },
        inlineFile: {
          name: 'README.md',
          url: 'http://ac-rYAutyUJ.clouddn.com/c5e38dfc54ab3db0c051.md',
          mime_type: 'application/octet-stream',
          bucket: 'rYAutyUJ',
          metaData: {
            owner: 'unknown',
            size: 3296,
          },
          objectId: '58aaac378d6d810058b790dd',
          createdAt: '2017-02-20T08:43:35.719Z',
          updatedAt: '2017-02-20T08:43:35.719Z',
          __type: 'File',
        },
        objectId: '58a460e78d6d810057e9f616',
      };

      AV.parseJSON(response)
        .toFullJSON()
        .should.eql(response);

      // should be shallow for backward compatiblity
      a._toFullJSON().should.eql({
        __type: 'Object',
        className: 'A',
        objectId: id,
        array: [
          { __type: 'Pointer', className: 'B', objectId: id },
          { __type: 'Pointer', className: 'C', objectId: id },
        ],
      });
    });

    // TODO: rewrite this to use deterministic data, and clean up saved data.
    it('should create a User', async function() {
      var User = AV.Object.extend('User');
      var u = new User();
      var r = Math.random();
      u.set('username', 'unique_name');
      u.set('password', '11111111');
      u.set('email', 'uique_name@test.com');
      await forceDeleteUser('unique_name');
      await u.save();
      await u.destroy({ useMasterKey: true });
    });

    it('should validate failed.', function() {
      var TestObject = AV.Object.extend('TestObject', {
        validate: function(attrs, options) {
          throw new Error('test');
        },
      });
      var testObject = new TestObject();
      (() => testObject.set('a', 1)).should.throwError({
        message: 'test',
      });
      expect(testObject.get('a')).to.be(undefined);
    });
  });

  describe('set', () => {
    it('should not mutate value', () => {
      const originalValue = {
        name: 'LC',
        objectId: '11111111111',
        className: '_User',
        __type: 'Object',
        avatar: {
          __type: 'File',
          id: '11111111111',
          name: 'avatar',
          url: 'url',
        },
      };
      const originalString = JSON.stringify(originalValue);
      new GameScore().set('user', originalValue);
      JSON.stringify(originalValue).should.be.exactly(originalString);
      originalValue.should.not.be.instanceof(AV.Object);
    });
  });

  describe('revert', () => {
    const data = {
      name: 'AVOSCloud',
      age: 0,
      objectId: '11111111111',
      className: 'Test',
      __type: 'Object',
    };

    it('revert all', () => {
      const object = AV.parseJSON(data);
      object.set({
        name: 'LeanCoud',
        age: 1,
      });
      object.revert();
      object.dirty().should.eql(false);
      object.dirtyKeys().should.eql([]);
      object.get('name').should.eql('AVOSCloud');
      object.get('age').should.eql(0);
      object.toFullJSON().should.eql(data);
    });
    it('revert keys', () => {
      const object = AV.parseJSON(data);
      object.set({
        name: 'LeanCoud',
        age: 1,
      });
      object.revert('name');
      object.dirty().should.eql(true);
      object.dirtyKeys().should.eql(['age']);
      object.get('name').should.eql('AVOSCloud');
      object.get('age').should.eql(1);
    });
  });

  describe('query', () => {
    it('should get AV.Query instance', () => {
      const Foo = AV.Object.extend('Foo');
      expect(Foo.query.className).to.be('Foo');
      const Bar = Foo.extend('Bar');
      expect(Bar.query.className).to.be('Bar');
    });
    it('should get AV.Query instance with ES6 class', () => {
      class Foo extends AV.Object {}
      expect(Foo.query.className).to.be('Foo');
      class Bar extends Foo {}
      expect(Bar.query.className).to.be('Bar');
    });
  });

  describe('Retrieving Objects', function() {
    it('should be the just save Object', function() {
      var GameScore = AV.Object.extend('GameScore');
      debug(objId);
      return GameScore.query.get(objId).then(function(result) {
        expect(gameScore.id).to.be.ok();
        expect(gameScore.get('objectId')).to.be(gameScore.id);
        expect(gameScore.get('id')).to.be('id');
      });
    });
  });

  describe('Updating Objects', function() {
    it('should update prop', function() {
      gameScore.set('score', 10000);
      return gameScore.save().then(function(result) {
        expect(result.id).to.be.ok();
      });
    });
    it('should not update prop when query not match', function() {
      gameScore.set('score', 10000);
      return gameScore
        .save(null, {
          query: new AV.Query(GameScore).equalTo('score', -1),
        })
        .should.be.rejectedWith({
          code: 305,
        });
    });
    it('should update prop when query match', function() {
      gameScore.set('score', 10000);
      return gameScore.save(null, {
        query: new AV.Query(GameScore).notEqualTo('score', -1),
        fetchWhenSave: true,
      });
    });
  });

  describe('Fetching Objects', () => {
    it('fetch', () =>
      AV.Object.createWithoutData('GameScore', gameScore.id)
        .fetch()
        .then(score => {
          expect(score.get('score')).to.be.a('number');
          expect(score.createdAt).to.be.a(Date);
          expect(score.id).to.be.eql(gameScore.id);
        }));
    it('should throws when objectId is empty', () => {
      const object = new AV.Object('GameScore');
      expect(object.fetch).throwError();
    });
    it('fetch should remove deleted keys', () => {
      const getFakedScore = () =>
        AV.parseJSON(
          Object.assign(gameScore.toFullJSON(), {
            fakedDeletedKey: 'value',
          })
        );
      return getFakedScore()
        .fetch()
        .then(fetchedScore => {
          expect(fetchedScore.get('fakedDeletedKey')).to.eql(undefined);
          return getFakedScore().fetch({
            keys: 'fakedDeletedKey',
          });
        })
        .then(fetchedScore => {
          expect(fetchedScore.get('fakedDeletedKey')).to.eql(undefined);
        });
    });
    it('fetchAll', () =>
      AV.Object.fetchAll([
        AV.Object.createWithoutData('GameScore', gameScore.id),
        AV.Object.createWithoutData('GameScore', gameScore.id),
      ]).then(([score1, score2]) => {
        expect(score1.get('score')).to.be.a('number');
        expect(score1.createdAt).to.be.a(Date);
        expect(score1.id).to.be.eql(gameScore.id);
        expect(score2.get('score')).to.be.a('number');
        expect(score2.createdAt).to.be.a(Date);
        expect(score2.id).to.be.eql(gameScore.id);
      }));
    it('fetchAll with non-existed Class/object should fail', () =>
      AV.Object.fetchAll([
        AV.Object.createWithoutData('GameScore', gameScore.id),
        AV.Object.createWithoutData('GameScore', 'fakeId'),
        AV.Object.createWithoutData('FakeClass', gameScore.id),
      ])
        .catch(error => {
          error.message.should.eql('Object not found.');
          error.results.should.be.length(3);
          error.results[0].should.be.instanceof(GameScore);
          error.results[1].should.be.instanceof(Error);
          error.results[2].should.be.instanceof(Error);
          throw new Error('handled error');
        })
        .should.be.rejectedWith('handled error'));
    it('fetchAll with dirty objet should fail', () =>
      AV.Object.fetchAll([
        AV.Object.createWithoutData('GameScore', gameScore.id),
        new GameScore(),
      ]).should.be.rejected());
  });

  describe('Deleting Objects', function() {
    it('should delete object', function() {
      return new GameScore()
        .save()
        .then(gameScore =>
          gameScore
            .destroy()
            .then(() =>
              GameScore.query
                .get(gameScore.id)
                .should.be.rejectedWith('Object not found.')
            )
        );
    });
  });

  describe('Array Data', function() {
    let post;
    beforeEach(function() {
      post = new Post({
        data: [1, 2],
      });
      return post.save();
    });
    afterEach(function() {
      return post.destroy();
    });

    it('add', function() {
      return post
        .add('data', 2)
        .save()
        .then(function() {
          return post.fetch();
        })
        .then(function(post) {
          expect(post.get('data')).to.be.eql([1, 2, 2]);
        });
    });
    it('addUnique', function() {
      return post
        .addUnique('data', 2)
        .save()
        .then(function() {
          return post.fetch();
        })
        .then(function(post) {
          expect(post.get('data')).to.be.eql([1, 2]);
        });
    });
    it('remove', function() {
      return post
        .remove('data', 2)
        .save()
        .then(function() {
          return post.fetch();
        })
        .then(function(post) {
          expect(post.get('data')).to.be.eql([1]);
        });
    });
    it('accept array param', function() {
      return post
        .remove('data', [2])
        .save()
        .then(function() {
          return post.fetch();
        })
        .then(function(post) {
          expect(post.get('data')).to.be.eql([1]);
        });
    });
  });

  describe('Relational Data', function() {
    var commentId, myComment, myPost, relation;
    it('should set relation ', function() {
      // Declare the types.
      var Post = AV.Object.extend('Post');
      var Comment = AV.Object.extend('Comment');

      // Create the post

      myPost = Post.new();
      myPost.set('title', 'post1');
      myPost.set('author', 'author1');
      myPost.set('content', 'Where should we go for lunch?');
      var point = new AV.GeoPoint({ latitude: 80.01, longitude: -30.01 });
      myPost.set('location', point);

      // Create the comment
      myComment = new Comment();
      myComment.set('content', 'comment1');

      // Add a relation between the Post and Comment
      myComment.set('parent', myPost);

      // This will save both myPost and myComment
      return myComment
        .save()
        .then(function(myComment) {
          var query = new AV.Query(Comment);
          query.include('parent');
          return query.get(myComment.id);
        })
        .then(function(obj) {
          expect(obj.get('parent').get('title')).to.be('post1');
        });
    });

    var Person = AV.Object.extend('Person');
    var p;

    it('should create a Person', function() {
      var Person = AV.Object.extend('Person');
      p = new Person();
      p.set('pname', 'person1');
      return p.save();
    });

    it('should create many to many relations', function() {
      return Promise.all([
        new AV.Query(Post).first(),
        new AV.Query(Person).first(),
      ])
        .then(function([post, p]) {
          var relation = p.relation('likes');
          relation.add(post);
          p.set('pname', 'plike1');
          return p.save();
        })
        .then(function() {
          debug(p.toJSON());
          debug(p.get('likes'));
        });
    });

    it('should save all successfully', function() {
      var Person = AV.Object.extend('Person');
      var query = new AV.Query(Person);
      return query
        .first()
        .then(function(result) {
          var person = AV.Object.createWithoutData('Person', result.id);
          person.set('age', 30);
          return AV.Object.saveAll([person]);
        })
        .then(([person]) => {
          person.id.should.be.ok();
          person.get('age').should.eql(30);
        });
    });

    it('should save all partially', function() {
      var Person = AV.Object.extend('Person');
      return AV.Object.saveAll([
        AV.Object.createWithoutData('Person', 'fakeid').set('age', 30),
        new Person({
          age: 40,
        }),
      ]).catch(error => {
        error.results.should.be.length(2);
        const [err, person] = error.results;
        err.should.be.instanceof(Error);
        person.should.be.instanceof(Person);
        person.id.should.be.ok();
        person.get('age').should.eql(40);
      });
    });

    it('should query relational data', function() {
      var Person = AV.Object.extend('Person');
      var query = new AV.Query(Person);
      return query.first().then(function(result) {
        var relation = result.relation('likes');
        return relation.query().find();
      });
    });

    it('should fetch when save', function() {
      var query = new AV.Query(Person);
      return query
        .first()
        .then(function(person) {
          var person2 = new Person();
          person2.id = person.id;
          person2.set('age', 0);
          person2.increment('age', 9);
          return person2.save();
        })
        .then(function(person) {
          person.increment('age', 10);
          return person.save(null, {
            fetchWhenSave: true,
          });
        })
        .then(function(p) {
          expect(p.get('age')).to.be(19);
        });
    });

    // 需要在控制台配置 Person company 默认值为 'leancloud'
    it('should fetch when save when creating new object.', function() {
      var p = new Person();
      p.set('pname', 'dennis');
      return p
        .save(null, {
          fetchWhenSave: true,
        })
        .then(function(person) {
          expect(person.get('company')).to.be('leancloud');
        });
    });

    it('should fetch include authors successfully', function() {
      var myPost = new Post();
      myPost.set('author1', new Person({ name: '1' }));
      myPost.set('author2', new Person({ name: '2' }));
      return myPost.save().then(function() {
        myPost = AV.Object.createWithoutData('Post', myPost.id);
        return myPost
          .fetch({ include: ['author1', 'author2'] }, {})
          .then(function() {
            expect(myPost.get('author1').get('name')).to.be('1');
            expect(myPost.get('author2').get('name')).to.be('2');
          });
      });
    });

    it('should compatible with previous include option of fetch', function() {
      var myPost = new Post();
      myPost.set('author1', new Person({ name: '1' }));
      myPost.set('author2', new Person({ name: '2' }));
      return myPost.save().then(function() {
        myPost = AV.Object.createWithoutData('Post', myPost.id);
        return myPost
          .fetch({ include: 'author1, author2' }, {})
          .then(function() {
            expect(myPost.get('author1').get('name')).to.be('1');
            expect(myPost.get('author2').get('name')).to.be('2');
          });
      });
    });

    it('fetchOptions keys', function() {
      var person = new Person();
      person.set('pname', 'dennis');
      person.set('age', 1);
      return person
        .save()
        .then(() =>
          AV.Object.createWithoutData('Person', person.id).fetch({
            keys: ['pname'],
          })
        )
        .then(function(person) {
          expect(person.get('pname')).to.be('dennis');
          expect(person.get('age')).to.be(undefined);
        });
    });
  });

  describe('Bit operations', function() {
    it('bit and', function() {
      var score = new GameScore();
      score.bitAnd('flags', 0b1);
      expect(score.get('flags')).to.be(0);
      return score
        .save()
        .then(() => {
          expect(score.get('flags')).to.be(0);
          return GameScore.query.get(score.id);
        })
        .then(savedScore => {
          expect(savedScore.get('flags')).to.be(0);
        });
    });

    it('bit or', function() {
      var score = new GameScore();
      score.bitOr('flags', 0b1);
      expect(score.get('flags')).to.be(0b1);
      return score
        .save()
        .then(() => {
          expect(score.get('flags')).to.be(0b1);
          return GameScore.query.get(score.id);
        })
        .then(savedScore => {
          expect(savedScore.get('flags')).to.be(0b1);
        });
    });

    it('bit xor', function() {
      var score = new GameScore();
      score.bitXor('flags', 0b1);
      expect(score.get('flags')).to.be(0b1);
      return score
        .save()
        .then(() => {
          expect(score.get('flags')).to.be(0b1);
          return GameScore.query.get(score.id);
        })
        .then(savedScore => {
          expect(savedScore.get('flags')).to.be(0b1);
        });
    });
  });

  describe('circular referrences', () => {
    it('dirty check', () => {
      const id = 'fake';
      const a = AV.parseJSON({
        __type: 'Object',
        className: 'A',
        objectId: id,
        b: [
          {
            __type: 'Pointer',
            className: 'B',
            objectId: id,
          },
        ],
        c: {
          __type: 'Pointer',
          className: 'C',
          objectId: id,
        },
        d: {
          __type: 'Pointer',
          className: 'C',
          objectId: id,
          objects: [{}],
        },
      });
      const b = a.get('b')[0];
      const c = a.get('c');
      const d = a.get('d');
      b.set({ a });
      a.dirty().should.eql(false);
      b.dirty().should.eql(true);
      c.dirty().should.eql(false);
      d.dirty().should.eql(false);
      d.get('objects')[0].foo = 'bar';
      a.dirty().should.eql(false);
      b.dirty().should.eql(true);
      c.dirty().should.eql(false);
      d.dirty().should.eql(true);
      c.set({ a });
      a.dirty().should.eql(false);
      b.dirty().should.eql(true);
      c.dirty().should.eql(true);
      d.dirty().should.eql(true);
    });
  });
}); //END  RETRIEVING

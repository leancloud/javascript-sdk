'use strict';

var GameScore = AV.Object.extend("GameScore");

var Post=AV.Object.extend("Post");

describe('Objects', function(){
  var objId;
  var gameScore = GameScore.new();
  after(function(done) {
    gameScore.destroy().then(function() {
      done();
    });
  });
  describe('#Saving Objects', function(){
    it('should crate a Object', function(done){
      //gameScore.set("newcol","sss")
      var myPost = new Post();
      myPost.set("title", "post1");
      myPost.set("content", "Where should we go for lunch?");
      var point = new AV.GeoPoint({latitude: 80.01, longitude: -30.01});
      myPost.set("geo",point);
      myPost.save(null, {
        success: function(result) {
          done();
        },
        error: function(gameScore, error) {
          throw error;
        }
      });
    });

    it('should create another Object', function(done) {
      gameScore.set("score", 1111);
      gameScore.set("playerName", "dd");
      gameScore.set("cheatMode", false);
      gameScore.set("arr", ["arr1","arr2"]);
      gameScore.save(null, {
        success: function(result) {
          expect(result.id).to.be.ok();
          objId=result.id;

          done();

        },
        error: function(gameScore, error) {
          throw error;
        }
      });

    });

    it('should create a User',function(done){
      var User = AV.Object.extend("User");
      var u = new User();
      var r=Math.random();
      u.set("username","u"+r);
      u.set("password","11111111");
      u.set("email","u"+r+"@test.com");
      u.save(null,{
        success:function(){
          done();
        }
      });
    });

    it('should validate failed.', function(done){
      var TestObject = AV.Object.extend('TestObject', {
        validate: function (attrs, options){
          return new AV.Error(1, "test");
        }
      });
      var testObject =new TestObject();
      testObject.set('a',1, {
        success: function(){
          throw "should not be here.";
        },
        error: function(obj, err){
          debug(err);
          expect(obj.get('a')).to.be(undefined);
          expect(err.message).to.be('test');
          done();
        }
      });
    });
  });



  describe("Retrieving Objects",function(){
    it("should be the just save Object",function(done){
      var GameScore = AV.Object.extend("GameScore");
      var query = new AV.Query(GameScore);
      debug(objId);
      query.get(objId, {
        success: function(gameScore) {
          expect(gameScore.id).to.be.ok();
          expect(gameScore.get('objectId')).to.be(gameScore.id);
          done();
          // The object was retrieved successfully.
        },
        error: function(object, error) {
          throw error;
        }
      });
    });

  });

  describe("Updating Objects",function(){
    it("should update prop",function(done){
      gameScore.set("score", 10000);
      gameScore.save(null, {
        success: function(result) {
          expect(result.id).to.be.ok();
          done();
        },
        error: function(gameScore, error) {
          throw error;
        }
      });
    });
    it('should not update prop when query not match',function(done){
      gameScore.set('score', 10000);
      gameScore.save(null, {
        query: new AV.Query(GameScore).equalTo('score', -1)
      }).then(function(result) {
        done(new Error('should not success'));
      }, function(error) {
        expect(error.code).to.be.eql(305);
        done();
      });
    });
    it('should update prop when query match',function(done){
      gameScore.set('score', 10000);
      gameScore.save(null, {
        query: new AV.Query(GameScore).notEqualTo('score', -1),
        fetchWhenSave: true
      }).then(function(result) {
        done();
      }, function(error) {
        done(error);
      });
    });
  });

  describe("Deleting Objects",function(){
    it("should delete cheatMode",function(done){
      gameScore.unset("cheatMode");
      gameScore.save(null,{
        success:function(result){
          done();
        },
        error:function(err){
          throw err;
        }
      });
    });
  });



  describe("Relational Data",function(){

    var commentId,myComment,myPost,relation;
    it("should set relation ",function(done){

      // Declare the types.
      var Post = AV.Object.extend("Post");
      var Comment = AV.Object.extend("Comment");

      // Create the post

      myPost = Post.new();
      myPost.set("title", "post1");
      myPost.set("author", "author1");
      myPost.set("content", "Where should we go for lunch?");
      var point = new AV.GeoPoint({latitude: 80.01, longitude: -30.01});
      myPost.set("location",point);

      // Create the comment
      myComment = new Comment();
      myComment.set("content", "comment1");

      // Add a relation between the Post and Comment
      myComment.set("parent", myPost);

      // This will save both myPost and myComment
      myComment.save(null,{
        success:function(myComment){
          var query = new AV.Query(Comment);
          query.include("parent");
          query.get(myComment.id).then(function(obj){
            expect(obj.get("parent").get("title")).to.be("post1");
            done();
          },function(err){
            throw err;
          });
        },
        error: function(err){
          throw err;
        }
      });
    });

    var Person=AV.Object.extend("Person");
    var p;
    var posts=[];
    it("create Many Post",function(done) {
      var Post = AV.Object.extend("Post");
      var createPost = function(num) {
        if (num <= 0) {
          return done();
        }
        var myPost = new Post();
        myPost.set("title", "post" + num);
        myPost.set("author", "author" + num);
        myPost.set("content", "Post for relation" + num);
        var point = new AV.GeoPoint({latitude: 80.01, longitude: -30.01});
        myPost.set("location",point);
        myPost.save(null, {
          success: function(result) {
            if (num <= 1) {
              done();
            } else {
              createPost(num - 1);
            }
          },
          error: function(err) {
            done(err);
          }
        });
      };
      createPost(5);
    });

    it("should create a Person",function(done){
      var Person = AV.Object.extend("Person");
      p = new Person();
      p.set("pname","person1");
      p.save(null,{
        success:function(){
          done();
        }
      });
    });

    it("should create many to many relations",function(done){
      var query = new AV.Query(Person);
      query.first({
        success:function(result){
          var p=result;
          var relation = p.relation("likes");
          for(var i=0;i<posts.length;i++){
            relation.add(posts[i]);
          }

          p.set("pname","plike1");
          p.save(null,{
            success:function(){
              debug(p.toJSON());
              debug(p.get("likes"));
              done();
            }
          });
        }
      });
    });

    it("should save all successfully", function(done){
      var Person=AV.Object.extend("Person");

      var query=new AV.Query(Person);
      query.first({
        success:function(result){
          debug(result instanceof Person);
          var person = AV.Object.createWithoutData('Person', result.id);
          person.set('age', 30);
          AV.Object.saveAll([person],{
            success: function(){
              done();
            },
            error: function(err){
              debug(result);
              debug(err);
              throw err;
            }
          });
        }
      });
    });

    it("should query relational data",function(done){

      var Person=AV.Object.extend("Person");

      var query=new AV.Query(Person);
      query.first({
        success:function(result){
          debug(result instanceof Person);
          debug(result.get("likes") instanceof AV.Relation);
          var relation = result.relation("likes");

          relation.query().find({
            success:function(){
              done();
            }
          });
          debug(result.toJSON());

        }
      });


    });

    it("should fetch when save", function(done){
      var query=new AV.Query(Person);
      query.first({
        success: function(person){
          var person2 = new Person();
          person2.id = person.id;
          person2.set('age', 0);
          person2.increment('age',9);
          person2.save().then(function(person){
            person.increment('age', 10);
            person.save(null, {
              fetchWhenSave: true
            }).then(function(p){
              expect(p.get('age')).to.be(19);
              done();
            },function(err){
              throw err;
            });
          });
        }
      });
    });

    it("should fetch when save when creating new object.", function(done){
      var p= new Person();
      p.set('pname', 'dennis');
      p.save(null, {
        fetchWhenSave: true
      }).then(function(person) {
        expect(person.get('company')).to.be('leancloud');
        done();
      }).catch(function(err) {
        throw err;
      });
    });

    it('should fetch include authors successfully', function() {
      var myPost = new Post();
      myPost.set('author1', new Person({name: '1'}));
      myPost.set('author2', new Person({name: '2'}));
      return myPost.save().then(function() {
        myPost = AV.Object.createWithoutData('Post', myPost.id);
        return myPost.fetch({include: ['author1', 'author2']}, {}).then(function() {
          expect(myPost.get('author1').get('name')).to.be('1');
          expect(myPost.get('author2').get('name')).to.be('2');
        });
      });
    });

    it('should compatible with previous include option of fetch', function() {
      var myPost = new Post();
      myPost.set('author1', new Person({name: '1'}));
      myPost.set('author2', new Person({name: '2'}));
      return myPost.save().then(function() {
        myPost = AV.Object.createWithoutData('Post', myPost.id);
        return myPost.fetch({include: 'author1, author2'}, {}).then(function() {
          expect(myPost.get('author1').get('name')).to.be('1');
          expect(myPost.get('author2').get('name')).to.be('2');
        });
      });
    });

    /*

       it("it should fetch relation post",function(done){
       var post=myComment.get("parent");
       post.fetch({
       success:function(post){
       done();
       }
       })
       })

       it("many to many relations create",function(done){
       var user = AV.User.current();
       relation = user.relation("likes");
       relation.add(post);
       user.save({
       success:function(){
       done();
       },
       error:function(err){
       throw err;
       }
       });
       })

       it("many to many relations query",function(done){

       relation.query().find({
       success: function(list) {
       done();
// list contains the posts that the current user likes.
},
error:function(err){
throw err;
}
});
})

*/


});



});//END  RETRIEVING

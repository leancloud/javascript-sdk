// queries
var GameScore = AV.Object.extend("GameScore");
var Person = AV.Object.extend("Person");
var query = new AV.Query(GameScore);
describe("Queries",function(){
  describe("#Basic Queries",function(){
    it("should return Class Array",function(done){

      query = new AV.Query(GameScore);
      //query.equalTo("playerName", "testname");
      query.exists("objectId");
      //query.equalTo("arr","arr1");
      query.find({
        success: function(results) {
          debug(results);
          expect(results).to.be.an("array");
          done();
        },
        error: function(error) {
          throw error;
        }
      });

    });

  });

  describe("#cloudQuery", function(){
    it("should return results.", function(done){
      AV.Query.doCloudQuery('select * from GameScore').then(function(result){
        debug(result);
        var results = result.results;
        expect(results.length).to.be(100);
        expect(results[0].className).to.be("GameScore");
        expect(result.count).to.be(undefined);
        expect(result.className).to.be('GameScore');
        done();
      });
    });
    it("should return limited results.", function(done){
      AV.Query.doCloudQuery('select * from GameScore limit 10').then(function(result){
        debug(result);
        var results = result.results;
        expect(results.length).to.be(10);
        expect(results[0].className).to.be("GameScore");
        expect(result.count).to.be(undefined);
        expect(result.className).to.be('GameScore');
        done();
      });
    });
    it("should return count value.", function(done){
      AV.Query.doCloudQuery('select *,count(objectId) from GameScore limit 10').then(function(result){
        debug(result);
        var results = result.results;
        expect(results.length).to.be(10);
        expect(results[0].className).to.be("GameScore");
        expect(result.count).to.be.an('number');
        expect(result.className).to.be('GameScore');
        done();
      });
    });
    it("should return count value too.", function(done){
      AV.Query.doCloudQuery('select *,count(objectId) from GameScore limit ?', [5]).then(function(result){
        debug(result);
        var results = result.results;
        expect(results.length).to.be(5);
        expect(results[0].className).to.be("GameScore");
        expect(result.count).to.be.an('number');
        expect(result.className).to.be('GameScore');
        done();
      });
    });
    it("should return syntax error.", function(done){
      AV.Query.doCloudQuery('select * GameScore limit 10').then(function(){
        throw "Shoud not be successfully.";
      },
      function(error){
        debug(error);
        expect(error).to.be.an(AV.Error);
        done();
      });
    });
  });

  describe("#save&query()",function(){
    it("should length + 1",function(done){
      query = new AV.Query(GameScore);
      query.limit(1000);
      var l=0;
      query.find({
        success: function(results) {
          debug(results);
          expect(results).to.be.an("array");
          l=results.length;

          var gameScore = new GameScore();
          gameScore.save(null, {
            success: function(result) {

              expect(result.id).to.be.ok();

              query.find({
                success: function(results) {

                  expect(results).to.be.an("array");
                  expect(results.length).to.be(l+1);
                  done();
                },
                error: function(error) {
                  alert("Error: " + error.code + " " + error.message);
                }
              });
            },
            error: function(gameScore, error) {
              throw error;
            }
          });


        },
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
        }
      });


    });
  });

  describe("Query Constraints",function(){

    it("basic",function(done){
      query = new AV.Query(GameScore);
      query.equalTo("playerName", "testname");
      query.first({
        success: function(object) {

          done();
        },
        error: function(error) {
          throw error;
        }
      });
    });
  });

  describe("Query with different condtions",function(){

    it("query doncition with array",function(done){
      query = new AV.Query(GameScore);
      query.equalTo("arr", "arr1");
      query.first({
        success: function(object) {

          done();
        },
        error: function(error) {
          throw error;
        }
      });
    });

    /*
       it("query doncition with string",function(done){
       query = new AV.Query(GameScore);
       query.startsWith("playerName", "test");
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

  var Post = AV.Object.extend("Post");
  var Comment = AV.Object.extend("Comment");

  describe("Relational Queries",function(){
    // it("should return comments of one post",function(done){
    // 	query = new AV.Query(Post);
    // 	query.equalTo("title","post1");
    // 	query.first({
    // 		success:function(post){

    // 			query = new AV.Query(Comment);

    // 			query.equalTo("parent", post);
    // 			query.find({
    // 			  success: function(comments) {
    // 			    // comments now contains the comments for myPost
    // 			    done();
    // 			  }
    // 			});
    // 		}
    // 	})
    // })

    this.timeout(10000);
    it("should return relation count",function(done){


      // userQ.count(function(c){
      // 	debug(c)
      // })

      var userQ = new AV.Query("Person");

      userQ.get("52f9bea1e4b035debf88b730").then(function(p){
        p.relation("likes").query().count({
          success:function(r){
            debug(r);
              done();

          }
        });
        // p.relation("likes").query().count().then(function(c){
        // 	debug(c)
        // })
        debug(p);
      });

      // userQ.first().then(function(p){

      // 	debug(p)
      // 	return p.relation("likes").query().count()
      // }).then(function(count){
      // 	debug(count);
      // 	done();
      // })
    });



  });

  describe("destroyAll", function(){
    it("should be deleted", function(done){
      // save some objects
      var promises = [];
      for(var i=0; i < 10; i++){
        var test = new AV.Object("deletedAll");
        test.set("number", i);
        promises.unshift(test.save());
      }
      // AV.Promise.when(promises).then(function() {done();});
      AV.Promise.when(promises).then(function(){
        var query = new AV.Query("deletedAll");
        query.limit(1000).find().then(function(results){
          // expect(results.length).to.be(10);
          query.destroyAll().then(function(){
            query.find().then(function(results){
              expect(results.length).to.be(0);
              done();
            });
          }, function(err){
            done(err);
          });
        }, function(err){
          done(err);
        });
      });
    });
  });

  describe("Counts",function(){
    it("should return num",function(done){

      query = new AV.Query(Person);
      query.startsWith("pname", "p");
      query.count({
        success: function(count) {
          // The count request succeeded. Show the count

          //expect(count).to.be.a("number");
          done();
        },
        error: function(error) {
          // The request failed
        }
      });

    });
  });

  describe("Compound Query",function(){
    it("should satisfy on 'or' conditions", function(done) {
      var lotsOfWins = new AV.Query("GameScore");
      lotsOfWins.greaterThan("score",150);

      var fewWins = new AV.Query("GameScore");
      fewWins.equalTo("cheatMode",true);

      var mainQuery = AV.Query.or(lotsOfWins, fewWins);
      mainQuery.find({
        success: function(results) {
          results.forEach(function(gs){
            expect(gs.get('score') > 150 || gs.get('cheatMode')).to.be.ok();
          });
          done();
          // results contains a list of players that either have won a lot of games or won only a few games.
        },
        error: function(error) {
          // There was an error.
        }
      });
    });
    it("should satisfy on 'and' conditions", function(done) {
      var lotsOfWins = new AV.Query("GameScore");
      lotsOfWins.greaterThan("score",150);

      var fewWins = new AV.Query("GameScore");
      fewWins.equalTo("cheatMode",true);

      var mainQuery = AV.Query.and(lotsOfWins, fewWins);
      mainQuery.find({
        success: function(results) {
          results.forEach(function(gs){
            expect(gs.get('score') > 150 && gs.get('cheatMode')).to.be.ok();
          });
          done();
          // results contains a list of players that either have won a lot of games or won only a few games.
        },
        error: function(error) {
          // There was an error.
        }
      });
    });
  });

});

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
			  	console.log(results);
			    expect(results).to.be.an("array");
			    done();
			  },
			  error: function(error) {
			    throw error;
			  }
			});

	  	})

  	});

  	describe("#save&query()",function(){
	  	it("should length + 1",function(done){
			query = new AV.Query(GameScore);
			query.limit(1000);
			var l=0;
			query.find({
			  success: function(results) {
			  	console.log(results);
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


	  	})
	  })

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
	})

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
	})

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
			// 	console.log(c)
			// })

			var userQ = new AV.Query("Person");

			userQ.get("52f9bea1e4b035debf88b730").then(function(p){
				p.relation("likes").query().count({
					success:function(r){
						console.log(r)
						done();

					}
				})
				// p.relation("likes").query().count().then(function(c){
				// 	console.log(c)
				// })
				console.log(p);
			})

			// userQ.first().then(function(p){

			// 	console.log(p)
			// 	return p.relation("likes").query().count()
			// }).then(function(count){
			// 	console.log(count);
			// 	done();
			// })
		})



	})

	describe("destroyAll", function(){
		it("should be deleted", function(done){
			//save some objects
            var promises = [];
			for(var i=0; i < 10; i++){
                var test = new AV.Object("deletedAll");
                test.set("number", i);
				promises.unshift(test.save());
			}
            AV.Promise.when(promises).then(function(){
				var query = new AV.Query("deletedAll");
				query.find().then(function(results){
					expect(results.length).to.be(10);
					query.destroyAll().then(function(){
						query.find().then(function(results){
							expect(results.length).to.be(0);
							done();
						});
					},function(err){
						throw err;
					});
				}, function(err){
					throw err;
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

	})
})

describe("Compound Query",function(){
	it("satisfy on of the conditions",function(done){
		var lotsOfWins = new AV.Query("GameScore");
		lotsOfWins.greaterThan("score",150);

		var fewWins = new AV.Query("GameScore");
		fewWins.equalTo("cheatMode",true);

		var mainQuery = AV.Query.or(lotsOfWins, fewWins);
		mainQuery.find({
		  success: function(results) {
		  	done();
		     // results contains a list of players that either have won a lot of games or won only a few games.
		  },
		  error: function(error) {
		    // There was an error.
		  }
		});
	})
})
	describe("",function(){
		it("",function(done){
			done();
		})
	})

})

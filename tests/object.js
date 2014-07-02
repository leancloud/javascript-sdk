var GameScore = AV.Object.extend("GameScore");

var Post=AV.Object.extend("Post");
var GameScoreCollection = AV.Collection.extend({
		  model: GameScore
		});

describe('Objects', function(){
  var objId;
  var gameScore = new GameScore();
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

    })

    it('should create a User',function(done){
    	var User = AV.Object.extend("User");
		var u = new User();
		var r=parseInt(Math.random()*1000);
		u.set("username","u"+r);
		u.set("password","11111111");
		u.set("email","u"+r+"@test.com");
		u.save(null,{
			success:function(){
				done();
			}
		})
    });
  })



  describe("Retrieving Objects",function(){
  	it("it should be the just save Object",function(done){
  		var GameScore = AV.Object.extend("GameScore");
		var query = new AV.Query(GameScore);
		console.log(objId)
		query.get(objId, {
		  success: function(gameScore) {
		  	expect(gameScore.id).to.be.ok();
		  	done();
		    // The object was retrieved successfully.
		  },
		  error: function(object, error) {
		    throw error;
		  }
		});
  	})

  });

  describe("Updating Objects",function(){
  	it("it should update prop",function(done){
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
  });

  describe("Deleting Objects",function(){
  	it("it should delete cheatMode",function(done){
  		gameScore.unset("cheatMode");
  		gameScore.save(null,{
  			success:function(result){
  				done();
  			},
  			error:function(err){
  				throw err;
  			}
  		})
  	});
  })



  describe("Relational Data",function(){

  	var commentId,myComment,myPost,relation;
  	it("it should set relation ",function(done){

  		// Declare the types.
		var Post = AV.Object.extend("Post");
		var Comment = AV.Object.extend("Comment");

		// Create the post

		myPost = new Post();
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
	})

  	var Person=AV.Object.extend("Person");
	var p;
	var posts=[];
	it("create Many Post",function(done){

			var Post = AV.Object.extend("Post");

		 	var myPost;
			var num=5;
			var success=0;
			for(var i=0;i<num;i++){
				myPost = new Post();
				myPost.set("title", "post"+num);
				myPost.set("author", "author"+num);
				myPost.set("content", "Post for relation"+num);
				var point = new AV.GeoPoint({latitude: 80.01, longitude: -30.01});
				myPost.set("location",point);
				myPost.save(null,{
					success:function(result){
						posts.push(result);
						success++;
						if(success<num-1){
							done();
						}
					}
				})
			}




	})

	it("create Person",function(done){
		var Person = AV.Object.extend("Person");
		p=new Person();
		p.set("pname","person1");
		p.save(null,{
			success:function(){
					done();
			}
		})
	});

	it("many to many relations create",function(done){

		var query = new AV.Query(Person);

		query.first({
			success:function(result){
				var p=result;

				var relation = p.relation("likes");

				for(var i=0;i<posts.length;i++){


					relation.add(posts[i]);
				}

				p.set("pname","plike1")
				p.save(null,{
						success:function(){
							console.log(p.toJSON())
							console.log(p.get("likes"));
							done();
						}
					})
				}
			}
		)


	});

   it("Save all successfully.", function(done){
	    var Person=AV.Object.extend("Person");

		var query=new AV.Query(Person);
		query.first({
			success:function(result){
				console.log(result instanceof Person);
				var person = AV.Object.createWithoutData('Person', result.id);
				person.set('age', 30);
				AV.Object.saveAll([person],{
					success: function(){
						done();
						},
					error: function(err){
						console.dir(result);
					    console.dir(err);
						throw err;
					}
				});
			}
		})
   });

	it("query relational data",function(done){

      var Person=AV.Object.extend("Person");

		var query=new AV.Query(Person);
		query.first({
			success:function(result){
				console.log(result instanceof Person);
				console.log(result.get("likes") instanceof AV.Relation);
				var relation = result.relation("likes");

				relation.query().find({
					success:function(){
						done();
					}
				})
				console.log(result.toJSON())

			}
		})


	});

    it("test fetchWHenSave", function(done){
		var query=new AV.Query(Person);
		query.first({
			success: function(person){
				var person2 = new Person();
				person2.id = person.id;
				person2.increment('age',9);
				person2.save().then(function(){
					person.fetchWhenSave(true);
					person.increment('age', 10);
					person.save().then(function(p){
						expect(p.get('age')).to.be(19);
						done();
					},function(err){
						throw err;
					});
				});
			}
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

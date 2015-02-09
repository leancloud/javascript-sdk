var post;
var Post = AV.Object.extend("Post");
describe("Geopoints",function(){
  it("save object with geopoints",function(done){
    // Make a new post
    var user = AV.User.current();

    post = new Post();
    post.set("title", "Post Geopoints");
    post.set("body", " Geopoints content.");
    post.set("user", user);

    var point = new AV.GeoPoint({latitude: 40.0, longitude: -30.0});
    post.set("location",point);
    post.save(null, {
      success: function(post) {
        done();
      },
      error: function(err){
        throw err;
      }
    });

  });
});

describe("near",function(){
  it("",function(done){

    var postGeoPoint = post.get("location");
    // Create a query for places
    var query = new AV.Query(Post);
    // Interested in locations near user.
    query.near("location", postGeoPoint);
    // Limit what could be a lot of points.
    query.limit(10);
    // Final list of objects
    query.find({
      success: function(placesObjects) {
        done();
      },
      err:function(err){
        throw err;
      }
    });
  });
});

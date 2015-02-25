var GameScore = AV.Object.extend("GameScore");
var GameScoreCollection = AV.Collection.extend({
  model: GameScore
});
var collection;
describe("Collection",function(){
  describe("#query",function(){
    it("should return collection",function(done){		
      collection = new GameScoreCollection();

      var query = new AV.Query(GameScore);

      collection = query.collection();

      collection.fetch({
        success: function(collection) {
          debug(collection);
          done();
        },
        error: function(collection, error) {
          throw error;
          // The collection could not be retrieved.
        }
      });
    });
  });

  describe("Modify  Collection",function(){
    it("add  entity",function(done){
      collection = new GameScoreCollection();
      collection.add({
        "score":12,
        "playerName":"player2"
      });
      collection.reset([
        {"score": 12},
        {"playerName": "Jane"}
      ]);
      done();
    });
  });
});

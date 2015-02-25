var GameScore = AV.Object.extend("GameScore");
describe("ObjectACL",function(){
  describe("*",function(){
    it("set * acl",function(done){
      var gameScore = new GameScore();
      gameScore.set("score", 2);
      gameScore.set("playerName", "sdf");
      gameScore.set("cheatMode", false);

      var postACL = new AV.ACL();
      postACL.setPublicReadAccess(true);
      postACL.setPublicWriteAccess(true);

      postACL.setReadAccess("546",true);
      postACL.setReadAccess("56238",true);
      postACL.setWriteAccess("5a061",true);
      postACL.setRoleWriteAccess("r6",true);
      gameScore.setACL(postACL);
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
});

describe("AV.Cloud", function() {
  describe("#getServerDate", function(){
    
    it("should return a date.", function(done){
      AV.Cloud.getServerDate().then(function(date) {
        expect(date).to.be.a('object');
        expect(date instanceof Date).to.be(true);
        done();
      }).catch(function(err) {
        throw err;
      });
    });
  });
});

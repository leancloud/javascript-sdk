describe("AV.Cloud", function() {
  describe("#getServerDate", function(){
    this.timeout(10000);
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

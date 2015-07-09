describe('bigquery', function() {
  describe('startJob', function(){
    this.timeout(20000);
    it('return job id and query job status.', function(done) {
      AV.BigQuery.startJob({
        sql: "select * from `_User`",
        saveAs: {
          className: 'BigQueryResult',
          limit:1
        }
      }).then(function(id) {
        expect(id).to.be.ok();
        setTimeout(function() {
          try{
          var q = new AV.BigQuery.JobQuery(id, AV.User);
          q.find().then(function(results) {
            console.dir(results);
            expect(results).to.not.be.empty();
            done();
          }, function(err) {
            throw err;
          });
          }catch(e) {
              console.dir(e);
          }
        }, 10000);
      }, function(err) {
        throw err;
      });
    });
  });
});

describe('bigquery', function() {
  describe('startJob', function(){
    this.timeout(10000);
    it('return job id.', function(done) {
      AV.BigQuery.startJob({
        sql: "select * from _User",
        saveAs: {
          className: 'BigQueryResult',
          limit:1
        }
      }).then(function(id) {
        console.log(id);
        done();
      }, function(err) {
        throw err;
      });
    });
  });
});

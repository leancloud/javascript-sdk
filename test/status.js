function errorProcessor(err){
  throw err;
}
describe("AV.Status",function(){
  this.timeout(10000);
  describe("Send status.",function(){
    it("should send status to followers.",function(done){
      var status = new AV.Status('image url', 'message');
      AV.Status.sendStatusToFollowers(status).then(function(status){
        debug(status);
        done();
      }, errorProcessor);
    });

    it("should send private status to an user.",function(done){
      var status = new AV.Status('image url', 'message');
      AV.Status.sendPrivateStatus(status, '52f9be45e4b035debf88b6e2').then(function(status){
        debug(status);
        done();
      }, errorProcessor);
    });

    it("should send  status to a female user.",function(done){
      var status = new AV.Status('image url', 'message');
      status.query = new AV.Query('_User');
      status.query.equalTo('gender', 'female');
      status.send().then(function(status){
        debug(status);
        done();
      }, errorProcessor);
    });
  });

  describe("Query statuses.", function(){
    it("should return unread count.", function(done){
      AV.Status.countUnreadStatuses(null, function(response){
        debug(response);
        expect(response.total).to.be.greaterThan(0);
        expect(response.unread).to.be.greaterThan(0);
        done();
      });
    });

    it("should return unread count that is greater than zero.", function(done){
      AV.Status.countUnreadStatuses(AV.Object.createWithoutData('_User', '52f9be45e4b035debf88b6e2'),'private', function(response){
        debug(response);
        expect(response.total).to.be.greaterThan(0);
        expect(response.unread).to.be.greaterThan(0);
        done();
      });
    });
    it("should return private statuses.", function(done){
      var query = AV.Status.inboxQuery(AV.Object.createWithoutData('_User', '52f9be45e4b035debf88b6e2'), 'private');
      query.find().then(function(statuses){
        debug(statuses);
        done();
      }, errorProcessor);
    });
    it("should return published statuses.", function(done){
      var query = AV.Status.statusQuery(AV.User.current());
      query.find().then(function(statuses){
        debug(statuses);
        done();
      }, errorProcessor);
    });
  });

  describe("Status guide test.", function(){
    //follow 52f9be45e4b035debf88b6e2
    //unfolow 52f9be45e4b035debf88b6e2
    var targetUser = '52f9be45e4b035debf88b6e2';
    it("should follow/unfollow successfully.", function(done){
      AV.User.current().follow(targetUser).then(function(){
        var query = AV.User.current().followeeQuery();
        query.include('followee');
        query.find().then(function(followees){
          debug(followees);
          expect(followees.length).to.be(1);
          expect(followees[0].id).to.be('52f9be45e4b035debf88b6e2');
          expect(followees[0].get('username')).to.be('u625');
          AV.User.current().unfollow(targetUser).then(function(){
            var query = AV.User.current().followeeQuery();
            query.include('followee');
            query.find().then(function(followees){
              debug(followees);
              expect(followees.length).to.be(0);
              done();
            }, errorProcessor);
          }, errorProcessor);
        }, errorProcessor);
      }, errorProcessor);
    }, errorProcessor);
    var targetUserObject = AV.Object.createWithoutData('_User', targetUser);
    it("should send statuses.", function(done){
      //send private status to  targetUser
      AV.Status.countUnreadStatuses(targetUserObject, 'private').then(function(result){
        debug(result);
        var total = result.total;
        var unread  = result.unread;
        var status = new AV.Status(null, '秘密消息');
        AV.Status.sendPrivateStatus(status, targetUser).then(function(status){
          expect(status.id).to.be.ok();
          setTimeout(function(){
            AV.Status.countUnreadStatuses(targetUserObject, 'private').then(function(result){
              debug(result);
              expect(result.total).to.be(total + 1);
              expect(result.unread).to.be(unread+1);
              //query private statuses
              var query = AV.Status.inboxQuery(targetUserObject, 'private');
              query.find().then(function(statuses){
                expect(statuses[0].get('message')).to.be('秘密消息');
                AV.Status.countUnreadStatuses(targetUserObject, 'private').then(function(result){
                  debug(result);
                  expect(result.total).to.be(total + 1);
                  expect(result.unread).to.be(0);
                  done();
                },errorProcessor);
              }, errorProcessor);
            }, errorProcessor);
          },3000);
        }, errorProcessor);
      }, errorProcessor);
    });
  });
});

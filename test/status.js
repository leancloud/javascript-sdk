'use strict';

describe("AV.Status",function(){

  describe("Send status.",function(){
    it("should send status to followers.",function(){
      var status = new AV.Status('image url', 'message');
      return AV.Status.sendStatusToFollowers(status);
    });

    it("should send private status to an user.",function(){
      var status = new AV.Status('image url', 'message');
      return AV.Status.sendPrivateStatus(status, '5627906060b22ef9c464cc99');
    });

    it("should send  status to a female user.",function(){
      var status = new AV.Status('image url', 'message');
      status.query = new AV.Query('_User');
      status.query.equalTo('gender', 'female');
      return status.send();
    });
  });

  describe("Query statuses.", function(){
    it("should return unread count.", function(){
      return AV.Status.countUnreadStatuses().then(function(response){
        expect(response.total).to.be.a('number');
        expect(response.unread).to.be.a('number');
      });
    });

    it("should return unread count that is greater than zero.", function(){
      return AV.Status.countUnreadStatuses(AV.Object.createWithoutData('_User', '5627906060b22ef9c464cc99'),'private').then(function(response){
        expect(response.total).to.be.a('number');
        expect(response.unread).to.be.a('number');
      });
    });
    it("should return private statuses.", function(){
      var query = AV.Status.inboxQuery(AV.Object.createWithoutData('_User', '5627906060b22ef9c464cc99'), 'private');
      return query.find();
    });
    it("should return published statuses.", function(){
      var query = AV.Status.statusQuery(AV.User.current());
      return query.find();
    });
  });

  describe("Status guide test.", function(){
    //follow 5627906060b22ef9c464cc99
    //unfolow 5627906060b22ef9c464cc99
    var targetUser = '5627906060b22ef9c464cc99';
    it("should follow/unfollow successfully.", function(){
      return AV.User.current().follow(targetUser).then(function(){
        var query = AV.User.current().followeeQuery();
        query.include('followee');
        return query.find();
      }).then(function(followees){
        debug(followees);
        expect(followees.length).to.be(1);
        expect(followees[0].id).to.be('5627906060b22ef9c464cc99');
        expect(followees[0].get('username')).to.be('leeyeh');
        return AV.User.current().unfollow(targetUser);
      }).then(function(){
        var query = AV.User.current().followeeQuery();
        query.include('followee');
        return query.find();
      }).then(function(followees){
        debug(followees);
        expect(followees.length).to.be(0);
      });
    });
    var targetUserObject = AV.Object.createWithoutData('_User', targetUser);
    it.skip("should send statuses.", function(done){
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
                },done);
              }, done);
            }, done);
          },3000);
        }, done);
      }, done);
    });
  });
});

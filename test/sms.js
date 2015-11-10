// describe("sms", function() {
//   var phoneNumber = '18668012283';
//   describe("#verifyUserMobilePhone", function(){

//     it("should be verified", function(done){
//       var user = new AV.User();
//       user.set("username", "dennis");
//       user.set("password", "123456");
//       user.setMobilePhoneNumber(phoneNumber);

//       user.signUp(null, {
//         success: function(user) {
//           AV.User.requestMobilePhoneVerify(phoneNumber).then(function() {
//             AV.User.logInWithMobilePhone(phoneNumber, '123456').then(function(user){
//               debug(user);
//               expect(user.get('mobilePhoneVerified')).to.be(false);
//               AV.User.requestLoginSmsCode(phoneNumber).then(function(){
//                 throw "Unverfied.";
//               }, function(err){
//                 user.destroy().then(function(){
//                   done();
//                 });
//               });
//             }, function(err){
//               throw err;
//             });

//           },function(err){
//             throw err;
//           });
//         },
//         error: function(user, error) {
//           throw error;
//         }
//       });
//     });
//   });

//   describe("#requestSmsCode", function(){
//     it("should send sms code.", function(done){
//       AV.Cloud.requestSmsCode(phoneNumber).then(function(){
//         AV.Cloud.requestSmsCode({
//           mobilePhoneNumber: phoneNumber,
//           name: '测试啊',
//           op: '测试操作',
//           ttl: 5
//         }).then(function(){
//           done();
//         }, function(err){
//           done(err);
//         });
//       }, function(err){
//         done(err);
//       });
//     });
//   });
// });

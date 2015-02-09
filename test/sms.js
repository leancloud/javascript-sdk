describe("sms", function() {

	describe("#verifyUserMobilePhone", function(){
		this.timeout(10000);
		it("should be verified", function(done){
			var user = new AV.User();
			user.set("username", "dennis");
			user.set("password", "123456");
			user.setMobilePhoneNumber('18668012283');

			user.signUp(null, {
				success: function(user) {
					AV.User.requestMobilePhoneVerify('18668012283').then(function(){
						AV.User.logInWithMobilePhone('18668012283',
													 '123456').then(function(user){
														 console.dir(user);
														 expect(user.get('mobilePhoneVerified')).to.be(false);
														 AV.User.requestLoginSmsCode('18668012283').then(function(){
															 throw "Unverfied.";
														 }, function(err){
															 user.destroy().then(function(){
																 done();
															 });
														 });
													 }, function(err){
														 throw err;
													 });

					},function(err){
						throw err;
					});
				},
				error: function(user, error) {
					throw error;
				}
			});
		});
	});

	describe("#requestSmsCode", function(){
		it("should send sms code.", function(done){
			AV.Cloud.requestSmsCode('18668012283').then(function(){
				AV.Cloud.requestSmsCode({
					mobilePhoneNumber: '18668012283',
					name: '测试啊',
					op: '测试操作',
					ttl: 5
				}).then(function(){
					done();
				}, function(err){
					throw err;
				});
			}, function(err){
				throw err;
			});
		});
	});
});

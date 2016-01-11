'use strict';

var username = "u" + Date.now();
var email = "u" + Date.now() + "@test.com";
var password = "password1";
describe("User", function() {

  describe("User.signUp", function() {
    it("should sign up", function(done) {
      var user = new AV.User();
      user.set("username", username);
      user.set("password", password);
      user.set("email", email);
      user.set("gender", "female");
      // other fields can be set just like with Parse.Object
      user.set("phone", "415-392-0202");

      user.signUp(null, {
        success: function(user) {
          debug(user);
          expect(user.id).to.be.ok();
          done();
          // Hooray! Let them use the app now.
        },
        error: function(user, error) {
          // Show the error message somewhere and let the user try again.
          throw error;
        }
      });

    });

    it("should throw when required field missing", function() {
      var user = new AV.User();
      user.set("username", username);
      expect(function() {
        user.signUp(null);
      }).to.throwError(/password/);
      var user = new AV.User();
      user.set("password", password);
      expect(function() {
        user.signUp(null);
      }).to.throwError(/name/);
    });
  });

  describe("User.logIn and User.become", function() {
    it("should login", function(done) {
      AV.User.logIn(username, password, {
        success: function(user) {
          expect(user.get("username")).to.be(username);
          // console.dir(user);
          AV.User.become(user._sessionToken, {
            success: function(theUser) {
              expect(theUser.get("username")).to.be(username);
              done();
            },
            error: function(err) {
              throw err;
            }
          });
          // Do stuff after successful login.
        },
        error: function(user, error) {
          throw error;
          // The login failed. Check error to see why.
        }
      });

    });

    it("should fail with wrong password", function() {
      return AV.User.logIn(username, 'wrong password').then(function() {
        throw new Error('Should not success');
      }, function(err) {
        expect(err.code).to.be.equal(210);
        expect(err.message).to.be.equal('The username and password mismatch.');
      });
    });

  });


  describe("Current User", function() {
    it("should return current user", function(done) {

      var currentUser = AV.User.current();
      expect(currentUser).to.be.ok();
      AV.User.currentAsync().then(function(user) {
        expect(user).to.be.ok();
        done();
      });
    });
  });

  describe("fetch User", function() {
    it("should resolve promise", function(done) {
      var currentUser = AV.User.current();
      currentUser.fetch().then(function(user) {
        expect(user).to.be.ok();
        done();
      });
    });
    it("should run callback", function(done) {
      var currentUser = AV.User.current();
      currentUser.fetch({
        success: function(user) {
          expect(user).to.be.ok();
          done();
        }
      })
    });;
  });

  describe("User update", function() {
    it("shoud update name", function(done) {

      var user = AV.User.logIn(username, password, {
        success: function(user) {
          user.set("username", username); // attempt to change username
          user.save(null, {
            success: function(user) {
              done();
              /*


                 var query = new AV.Query(AV.User);
                 query.get("516528fa30046abfb335f2da", {
                 success: function(userAgain) {
                 userAgain.set("username", "another_username");
                 userAgain.save(null, {
                 error: function(userAgain, error) {
                 done();
              // This will error, since the Parse.User is not authenticated
              }
              });
              },
              error: function(err){
              throw err;
              }
              });
              */
            }
          });
        }
      });
    });
  });

  describe("Update user password", function() {
    it("should update password", function(done) {
      var user = AV.User.logIn(username, password, {
        success: function(user) {
          user.updatePassword(password, 'new pass').then(function() {
            AV.User.logIn(username, 'new pass').then(function(user) {
              user.updatePassword('new pass', password).then(function() {
                done();
              });
            });
          });
        },
        error: function(err) {
          throw err;
        }
      });
    });
  });

  describe("User query", function() {
    it("should return conditoinal users", function(done) {
      var query = new AV.Query(AV.User);
      query.equalTo("gender", "female"); // find all the women
      query.find({
        success: function(women) {
          done();
        }
      });

    });
  });


  describe("Associations", function() {
    it("return post relation to user", function(done) {
      var user = AV.User.current();

      // Make a new post
      var Post = AV.Object.extend("Post");
      var post = new Post();
      post.set("title", "My New Post");
      post.set("body", "This is some great content.");
      post.set("user", user);
      post.save(null, {
        success: function(post) {
          // Find all posts by the current user
          var query = new AV.Query(Post);
          query.equalTo("user", user);
          query.find({
            success: function(usersPosts) {
              expect(usersPosts.length).to.be.ok();
              done();
            },
            error: function(err) {
              throw err;
            }
          });
        }
      });

    });
  });

  describe("Follow/unfollow users", function() {
    it("should follow/unfollow", function(done) {
      var user = AV.User.current();
      user.follow('53fb0fd6e4b074a0f883f08a', {
        success: function() {
          var query = user.followeeQuery();
          query.find({
            success: function(results) {
              expect(results.length).to.be(1);
              debug(results);
              expect(results[0].id).to.be('53fb0fd6e4b074a0f883f08a');
              var followerQuery = AV.User.followerQuery('53fb0fd6e4b074a0f883f08a');
              followerQuery.find().then(function(results) {
                expect(results.filter(function(result) {
                  return result.id === user.id;
                })).not.to.be(0);
                debug(results);
                //unfollow
                user.unfollow('53fb0fd6e4b074a0f883f08a').then(function() {
                  //query should be emtpy
                  var query = user.followeeQuery();
                  query.find({
                    success: function(results) {
                      expect(results.length).to.be(0);
                      done();
                    },
                    error: function(err) {
                      throw err;
                    }
                  });
                }, function(err) {
                  throw err;
                });
              }, function(err) {
                throw err;
              });
            },
            error: function(err) {
              throw err;
            }
          });
        },
        error: function(err) {
          done(err);
        }
      });
    });
  });

  describe("User logInAnonymously", function() {
    it("should create anonymous user, and login with AV.User.signUpOrlogInWithAuthData()", function(done) {
      var getFixedId = function () {
        var rawId = 13334230101333423010;
        var result = rawId.toString(16);
        return result;
      }
      var data = {
        id: getFixedId()
      }

      AV.User.signUpOrlogInWithAuthData(data, "anonymous", {
        success: function(user) {
          expect(user.id).to.be.ok();
          done();
        },
        error: function(error) {
          throw error.message;
        }
      });
    });
  });

  describe('currentUser disabled', function() {
    var user, originalUser;

    before(function() {
      originalUser = AV.User._currentUser;
      AV.User._currentUser = null;
      AV.User._currentUserDisabled = true;
      AV._useMasterKey = false;
    });

    var username = 'u' + Date.now();
    var email = 'u' + Date.now() + '@test.com';
    var password = 'password1';

    it('User#signUp', function() {
      user = new AV.User();

      user.set("username", username);
      user.set("password", password);
      user.set("email", email);

      return user.signUp(null, {
        success: function(user) {
          expect(user._isCurrentUser).to.be.equal(false);
          expect(AV.User._currentUser).to.be.equal(null);
          expect(user._sessionToken).to.be.ok();
        }
      });
    });

    it('User#getSessionToken', function() {
      expect(user.getSessionToken()).to.be.ok();
    });

    it('User.current', function() {
      expect(AV.User.current()).to.be.equal(null);
    });

    it('User.currentAsync', function() {
      AV.User.currentAsync().then(function(user) {
        expect(user).to.be.equal(null);
      });
    });

    it('User#save without token', function(done) {
      user.save({username: username + 'changed'}, {
        success: function() {
          done(new Error('Should not success'));
        },
        error: function(err) {
          expect(err.code).to.be.equal(206);
          done();
        }
      });
    });

    it('User#save with token', function(done) {
      user.save({username: username + 'changed'}, {
        sessionToken: user.getSessionToken(),
        success: function() {
          done();
        },
        error: function(err) {
          done(err);
        }
      });
    });

    after(function() {
      AV.User._currentUserDisabled = false;
      AV._useMasterKey = true;
      AV.User._currentUser = originalUser;
    });
  });
});

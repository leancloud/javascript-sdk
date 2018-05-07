'use strict';

var username = 'u' + Date.now();
var email = 'u' + Date.now() + '@test.com';
var password = 'password1';
describe('User', function() {
  describe('User.signUp', function() {
    it('should sign up', function() {
      var user = new AV.User();
      user.set('username', username);
      user.set('password', password);
      user.set('email', email);
      user.set('gender', 'female');
      // other fields can be set just like with Parse.Object
      user.set('phone', '415-392-0202');

      return user.signUp().then(function(user) {
        debug(user);
        expect(user.id).to.be.ok();
      });
    });

    it('should throw when required field missing', function() {
      var user = new AV.User();
      user.set('username', username);
      expect(function() {
        user.signUp();
      }).to.throwError(/password/);
      var user = new AV.User();
      user.set('password', password);
      expect(function() {
        user.signUp();
      }).to.throwError(/name/);
    });
  });

  describe('User.logIn and User.become', function() {
    it('should login', function() {
      return AV.User.logIn(username, password)
        .then(function(user) {
          expect(user.get('username')).to.be(username);
          return AV.User.become(user._sessionToken);
        })
        .then(function(theUser) {
          expect(theUser.get('username')).to.be(username);
        });
    });

    it('should fail with wrong password', function() {
      return AV.User.logIn(username, 'wrong password').should.be.rejectedWith({
        message: /The username and password mismatch./,
        code: 210,
      });
    });
  });

  describe('Current User', function() {
    it('current()', function() {
      var currentUser = AV.User.current();
      expect(currentUser).to.be.ok();
    });
    it('currentAsync()', () =>
      AV.User.currentAsync().then(function(user) {
        expect(user).to.be.ok();
      }));
  });

  describe('authenticated', () => {
    it('authenticated()', () => {
      AV.User.current()
        .authenticated()
        .should.be.ok();
      new AV.User().authenticated().should.not.be.ok();
    });
    describe('isAuthenticated', () => {
      it('currentUser.isAuthenticated()', () =>
        AV.User.current()
          .isAuthenticated()
          .should.be.fulfilledWith(true));
      it('user.isAuthenticated()', () =>
        new AV.User().isAuthenticated().should.be.fulfilledWith(false));
      it('outdated sessionToken', () => {
        AV.User.current()._sessionToken = '0';
        return new AV.User.current()
          .isAuthenticated()
          .should.be.fulfilledWith(false);
      });
    });
  });

  describe('fetch User', function() {
    it('should resolve promise', function() {
      var currentUser = AV.User.current();
      return currentUser.fetch().then(function(user) {
        expect(user).to.be.ok();
      });
    });
  });

  describe('User update', function() {
    it('shoud update name', function() {
      return AV.User.logIn(username, password).then(function(user) {
        user.set('username', username); // attempt to change username
        return user.save();
      });
    });
  });

  describe('Update user password', function() {
    it('should update password', function() {
      return AV.User.logIn(username, password)
        .then(function(user) {
          return user.updatePassword(password, 'new pass');
        })
        .then(function() {
          return AV.User.logIn(username, 'new pass');
        })
        .then(function(user) {
          return user.updatePassword('new pass', password);
        });
    });
  });

  describe('User query', function() {
    it('should return conditoinal users', function() {
      var query = new AV.Query(AV.User);
      query.equalTo('gender', 'female'); // find all the women
      return query.find({ useMasterKey: true });
    });
  });

  describe('User#getRoles', function() {
    it("Should get the current user's role", function() {
      var user = AV.User.current();
      return new AV.Query('_Role')
        .equalTo('name', 'testRole')
        .first()
        .then(function(role) {
          return role.destroy({ useMasterKey: true });
        })
        .catch(function() {
          // already destroyed
        })
        .then(function() {
          const acl = new AV.ACL();
          acl.setPublicReadAccess(true);
          var role = new AV.Role('testRole', acl);
          role.getUsers().add(user);
          return role.save();
        })
        .then(function() {
          return user.getRoles();
        })
        .then(function(roles) {
          expect(roles.length).to.be(1);
          expect(roles[0].getName()).to.be('testRole');
        });
    });
  });

  describe('Associations', function() {
    it('return post relation to user', function() {
      var user = AV.User.current();

      // Make a new post
      var Post = AV.Object.extend('Post');
      var post = new Post();
      post.set('title', 'My New Post');
      post.set('body', 'This is some great content.');
      post.set('user', user);
      return post
        .save()
        .then(function(post) {
          // Find all posts by the current user
          var query = new AV.Query(Post);
          query.equalTo('user', user);
          return query.find();
        })
        .then(function(usersPosts) {
          expect(usersPosts.length).to.be.ok();
        });
    });
  });

  describe('User logInAnonymously', function() {
    it('should create anonymous user, and login with AV.User.signUpOrlogInWithAuthData()', function() {
      var getFixedId = function() {
        var rawId = 13334230101333423010;
        var result = rawId.toString(16);
        return result;
      };
      var data = {
        id: getFixedId(),
      };

      return AV.User.signUpOrlogInWithAuthData(data, 'anonymous').then(function(
        user
      ) {
        expect(user.id).to.be.ok();
      });
    });
  });

  describe('authData and unionId', () => {
    const now = Date.now();
    const username = now.toString(36);
    it('failOnNotExist', () =>
      AV.User.signUpOrlogInWithAuthData(
        {
          uid: 'openid1' + now,
          access_token: 'access_token',
          expires_in: 1382686496,
        },
        'weixin_1',
        {
          failOnNotExist: true,
        }
      ).should.be.rejectedWith(/Could not find user/));
    it('should login as the same user', () => {
      return new AV.User()
        .setUsername(username)
        .loginWithAuthDataAndUnionId(
          {
            uid: 'openid1' + now,
            access_token: 'access_token',
            expires_in: 1382686496,
          },
          'weixin_1',
          'unionid' + now,
          {
            asMainAccount: true,
          }
        )
        .then(user1 => {
          return AV.User.signUpOrlogInWithAuthDataAndUnionId(
            {
              uid: 'openid2' + now,
              access_token: 'access_token',
              expires_in: 1382686496,
            },
            'weixin_2',
            'unionid' + now
          ).then(user2 => {
            user2.id.should.be.eql(user1.id);
            user2.getUsername().should.be.eql(username);
          });
        });
    });
  });

  describe('associate with authData', function() {
    it('logIn an user, and associate with authData', function() {
      var username = Date.now().toString(36);

      return AV.User.signUpOrlogInWithAuthData(
        {
          uid: 'zaabbbccc123123' + username,
          access_token: 'a123123aaabbbbcccc',
          expires_in: 1382686496,
        },
        'test'
      )
        .then(function(loginedUser) {
          return AV.User.associateWithAuthData(loginedUser, 'weixin', {
            openid: 'aaabbbccc123123' + username,
            access_token: 'a123123aaabbbbcccc',
            expires_in: 1382686496,
          });
        })
        .then(user => {
          user.get('authData').should.have.property('weixin');
          user.get('authData').should.have.property('test');
          return user.dissociateAuthData('weixin');
        })
        .then(user => {
          user.get('authData').should.not.have.property('weixin');
          user.get('authData').should.have.property('test');
        });
    });
  });

  describe('refreshSessionToken', () => {
    it('User#refreshSessionToken', () => {
      const user = AV.User.current();
      const prevSessionToken = user.getSessionToken();
      return user.refreshSessionToken().then(user => {
        user.getSessionToken().should.be.a.String();
        user.getSessionToken().should.not.be.eql(prevSessionToken);
        // cache refreshed
        delete AV.User._currentUser;
        AV.User._currentUserMatchesDisk = false;
        user
          .getSessionToken()
          .should.be.eql(AV.User.current().getSessionToken());
      });
    });
  });

  describe('currentUser disabled', function() {
    var user, originalUser;

    before(function() {
      originalUser = AV.User._currentUser;
      AV.User._currentUser = null;
      AV._config.disableCurrentUser = true;
      AV._useMasterKey = false;
    });

    var username = 'u' + Date.now();
    var email = 'u' + Date.now() + '@test.com';
    var password = 'password1';

    it('User#signUp', function() {
      user = new AV.User();

      user.set('username', username);
      user.set('password', password);
      user.set('email', email);

      return user.signUp().then(function(user) {
        expect(user._isCurrentUser).to.be.equal(false);
        expect(AV.User._currentUser).to.be.equal(null);
        expect(user._sessionToken).to.be.ok();
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

    it('User#save without token', function() {
      return user
        .save({ username: username + 'changed' })
        .should.be.rejectedWith({
          code: 206,
        });
    });

    it('User#save with token', function() {
      return user
        .save(
          {
            username: username + 'changed',
          },
          { sessionToken: user.getSessionToken() }
        )
        .then(function() {
          return user.fetch().then(function() {
            expect(user.get('username')).to.be.equal(username + 'changed');
          });
        });
    });

    after(function() {
      AV._config.disableCurrentUser = false;
      AV._useMasterKey = true;
      AV.User._currentUser = originalUser;
    });
  });
});

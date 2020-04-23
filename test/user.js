'use strict';

import { forceDeleteUser } from './util';
import { setupPolly } from './polly';

var username = 'tester1';
var email = 'tester1@example.com';
var password = 'password1';

const createTestUser = async () => {
  await forceDeleteUser(username);
  var user = new AV.User();
  user.set('username', username);
  user.set('password', password);
  user.set('email', email);
  user.set('gender', 'female');
  user.set('phone', '415-392-0202');

  await user.signUp();
};

describe('User', function() {
  setupPolly();

  beforeEach(async () => {
    await forceDeleteUser(username);
  });

  describe('User.signUp', function() {
    it('should sign up', function() {
      var user = new AV.User();
      user.set('username', username);
      user.set('password', password);
      user.set('email', email);
      user.set('gender', 'female');
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
    beforeEach(createTestUser);
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

    it('should loginWithEmail', () =>
      AV.User.loginWithEmail(email, password).then(function(user) {
        expect(user.get('username')).to.be(username);
      }));
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
    beforeEach(async () => {
      await createTestUser();
      await AV.User.logIn(username, password);
    });
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

  describe('existing user', () => {
    beforeEach(createTestUser);

    describe('fetch User', function() {
      it('should resolve promise', async function() {
        await AV.User.logIn(username, password);
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
            return user.updatePassword(password, 'new pass').then(resp => {
              let getStoredUser = function() {
                let origin = {
                  _currentUser: AV.User._currentUser,
                  _currentUserMatchesDisk: AV.User._currentUserMatchesDisk,
                };
                AV.User._currentUser = undefined;
                AV.User._currentUserMatchesDisk = false;
                let storedUser = AV.User.current();
                Object.assign(AV.User, origin);
                return storedUser;
              };

              [user, AV.User.current(), getStoredUser()].forEach(user =>
                user.getSessionToken().should.be.eql(resp.sessionToken)
              );

              return resp;
            });
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

  describe('User loginAnonymously', function() {
    const name = 'justsomeuniquename';
    let originalGenId = AV.User._genId;
    beforeEach(() => {
      let value = 0;
      originalGenId = AV.User._genId;
      AV.User._genId = () => '1b671a64-40d5-491e-99b0-da01ff1f3341';
    });

    afterEach(async () => {
      AV.User._genId = originalGenId;
      await forceDeleteUser(name);
    });

    it('create an anonymous user, and then associateWithAuthData', function() {
      return AV.User.loginAnonymously()
        .then(function(user) {
          expect(user.id).to.be.ok();
          expect(user.isAnonymous()).to.be.ok();
          return user.associateWithAuthData(
            {
              uid: 'justsomerandomstring',
              access_token: 'access_token',
            },
            'github'
          );
        })
        .then(user => {
          expect(user.isAnonymous()).to.be.equal(false);
          expect(user.dirty()).to.be.equal(false);
          return user.destroy({ useMasterKey: true });
        });
    });
    it('create an anonymous user, and then signup', async function() {
      return AV.User.loginAnonymously()
        .then(function(user) {
          expect(user.id).to.be.ok();
          expect(user.isAnonymous()).to.be.ok();
          user.setUsername(name).setPassword(name);
          return user.signUp();
        })
        .then(user => {
          expect(user.isAnonymous()).to.be.equal(false);
          expect(user.dirty()).to.be.equal(false);
        });
    });
  });

  describe('authData and unionId', () => {
    const now = 1568871659834;
    const username = now.toString(36);

    beforeEach(async () => {
      await forceDeleteUser(username);
    });

    afterEach(async () => {
      await forceDeleteUser(username);
    });

    it('failOnNotExist', async () => {
      return AV.User.signUpOrlogInWithAuthData(
        {
          uid: 'openid1' + now,
          access_token: 'access_token',
          expires_in: 1382686496,
        },
        'weixin_1',
        {
          failOnNotExist: true,
        }
      ).should.be.rejectedWith(/Could not find user/);
    });

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
      var username = 'usesomedeterministicstringplz';

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
    var username = 'imauser';
    var email = 'imauser@test.com';
    var password = 'password1';

    beforeEach(async function() {
      originalUser = AV.User._currentUser;
      AV.User._currentUser = null;
      AV._config.disableCurrentUser = true;
      AV._useMasterKey = false;
      await forceDeleteUser(username);
    });

    it('User', async function() {
      user = new AV.User();

      user.set('username', username);
      user.set('password', password);
      user.set('email', email);

      return user.signUp().then(function(user) {
        expect(user._isCurrentUser).to.be.equal(false);
        expect(AV.User._currentUser).to.be.equal(null);
        expect(user._sessionToken).to.be.ok();
      });

      expect(user.getSessionToken()).to.be.ok();

      expect(AV.User.current()).to.be.equal(null);

      const currentUser = await AV.User.currentAsync();
      expect(currentUser).to.be.equal(null);

      await user
        .save({ username: username + 'changed' })
        .should.be.rejectedWith({
          code: 206,
        });

      await user.save(
        {
          username: username + 'changed',
        },
        { sessionToken: user.getSessionToken() }
      );
      const fetchedUser = await user.fetch();
      expect(fetchedUser.get('username')).to.be.equal(username + 'changed');
    });

    afterEach(function() {
      AV._config.disableCurrentUser = false;
      AV._useMasterKey = true;
      AV.User._currentUser = originalUser;
    });
  });
});

describe('User.become', function() {
  it('should fail when sessionToken is undefined', function() {
    return AV.User.become().should.be.rejected();
  });
});

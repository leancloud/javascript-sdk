const _ = require('underscore');
const { request } = require('./request');
const { getSessionToken } = require('./utils');
const AV = require('./av');

/**
 * @enum
 */
AV.FriendshipRequestStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
};

AV.FriendshipRequest = AV.Object.extend(
  '_FriendshipRequest',
  {
    accept() {},
    decline() {},
  },
  {
    getFriendQuery(friendObjectId) {
      return this.query
        .include('user')
        .equalTo(
          'friend',
          AV.Object.createWithoutData(AV.User, friendObjectId)
        );
    },
  }
);
AV.Object.register(AV.FriendshipRequest);

const requireUserLogin = authOptions => {
  const sessionToken = getSessionToken(authOptions);
  return Promise.resolve(
    sessionToken
      ? undefined
      : AV.User.currentAsync().then(user => {
          if (!user) {
            throw new Error('Please signin as an user.');
          }
        })
  );
};

AV.Friendship = AV.Object.extend(
  '_Followee',
  /** @lends AV.Friendship.prototype */ {},
  {
    request(id, options = {}) {
      return requireUserLogin(options).then(currentUser => {
        if (!_.isString(id)) {
          throw new TypeError(
            'The ID of the requested user must be a valid objectId'
          );
        }
        const friendshipReq = new AV.FriendshipRequest();
        const _makeRequest = (route, className, _id, method, payload) =>
          request({
            path: '/users/friendshipRequests',
            method: 'POST',
            data: {
              // TODO: to be removed
              user: currentUser._toPointer(),
              friend: AV.Object.createWithoutData(AV.User, id)._toPointer(),
              friendship: payload,
            },
          });
        return friendshipReq
          .save(options.attributes, _.extend({ _makeRequest }, options))
          .then(() => undefined);
      });
    },

    getQuery(friendObjectId) {
      return this.query
        .include('friend')
        .equalTo('friendStatus', true)
        .equalTo('user', AV.Object.createWithoutData(AV.User, friendObjectId));
    },
  }
);
// AV.Object.register(AV.Friendship);

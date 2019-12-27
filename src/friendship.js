const _ = require('underscore');
const Promise = require('./promise');
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
    getQuery(userId) {
      return new AV.Query(AV.FriendshipRequest)
        .equalTo('friend', AV.Object.createWithoutData(AV.User, userId))
        .include('friend,user');
    },
  }
);

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

const Followee = AV.Object.extend('_Followee');
AV.Friendship = AV.Object.extend(
  '_Followee',
  /** @lends AV.Friendship.prototype */ {},
  {
    request(userId, options = {}) {
      return requireUserLogin(options).then(() => {
        if (!_.isString(userId)) {
          throw new TypeError('userId must be a valid objectId');
        }
        const friendshipReq = new AV.FriendshipRequest();
        options._makeRequest = (route, className, id, method, json) =>
          request({
            path: `/users/self/friendship/${encodeURIComponent(
              userId
            )}/request`,
            method: 'POST',
            data: json,
          });
        return friendshipReq
          .save(options.attributes, options)
          .then(() => undefined);
      });
    },
  }
);
AV.Object.register(Followee);

const _ = require('underscore');
const { request: LCRequest } = require('./request');
const { getSessionToken } = require('./utils');

module.exports = function(AV) {
  const getUserWithSessionToken = authOptions => {
    if (authOptions.user) {
      if (!authOptions.user._sessionToken) {
        throw new Error('authOptions.user is not signed in.');
      }
      return Promise.resolve(authOptions.user);
    }
    if (authOptions.sessionToken) {
      return AV.User._fetchUserBySessionToken(authOptions.sessionToken);
    }
    return AV.User.currentAsync();
  };

  const getSessionTokenAsync = authOptions => {
    const sessionToken = getSessionToken(authOptions);
    if (sessionToken) {
      return Promise.resolve(sessionToken);
    }
    return AV.User.currentAsync().then(user => {
      if (user) {
        return user.getSessionToken();
      }
    });
  };

  /**
   * Contains functions to deal with Friendship in LeanCloud.
   * @class
   */
  AV.Friendship = {
    /**
     * Request friendship.
     * @since 4.8.0
     * @param {String | AV.User | Object} options if an AV.User or string is given, it will be used as the friend.
     * @param {AV.User | string} options.friend The friend (or friend's objectId) to follow.
     * @param {Object} [options.attributes] key-value attributes dictionary to be used as conditions of followeeQuery.
     * @param {AuthOptions} [authOptions]
     * @return {Promise<void>}
     */
    request: function(options, authOptions = {}) {
      let friend;
      let attributes;

      if (options.friend) {
        friend = options.friend;
        attributes = options.attributes;
      } else {
        friend = options;
      }

      const friendObj = _.isString(friend)
        ? AV.Object.createWithoutData('_User', friend)
        : friend;

      return getUserWithSessionToken(authOptions).then(userObj => {
        if (!userObj) {
          throw new Error('Please signin an user.');
        }
        return LCRequest({
          method: 'POST',
          path: '/users/friendshipRequests',
          data: {
            user: userObj._toPointer(),
            friend: friendObj._toPointer(),
            friendship: attributes,
          },
          authOptions,
        });
      });
    },

    /**
     * Accept a friendship request.
     * @since 4.8.0
     * @param {AV.Object | string | Object} options if an AV.Object or string is given, it will be used as the request in _FriendshipRequest.
     * @param {AV.Object} options.request The request (or it's objectId) to be accepted.
     * @param {Object} [options.attributes] key-value attributes dictionary to be used as conditions of {@link AV#followeeQuery}.
     * @param {AuthOptions} [authOptions]
     * @return {Promise<void>}
     */
    acceptRequest: function(options, authOptions = {}) {
      let request;
      let attributes;
      if (options.request) {
        request = options.request;
        attributes = options.attributes;
      } else {
        request = options;
      }
      const requestId = _.isString(request) ? request : request.id;
      return getSessionTokenAsync(authOptions).then(sessionToken => {
        if (!sessionToken) {
          throw new Error('Please signin an user.');
        }
        return LCRequest({
          method: 'PUT',
          path: '/users/friendshipRequests/' + requestId + '/accept',
          data: {
            friendship: AV._encode(attributes),
          },
          authOptions,
        });
      });
    },

    /**
     * Decline a friendship request.
     * @param {AV.Object | string} request The request (or it's objectId) to be declined.
     * @param {AuthOptions} [authOptions]
     * @return {Promise<void>}
     */
    declineRequest: function(request, authOptions = {}) {
      const requestId = _.isString(request) ? request : request.id;
      return getSessionTokenAsync(authOptions).then(sessionToken => {
        if (!sessionToken) {
          throw new Error('Please signin an user.');
        }
        return LCRequest({
          method: 'PUT',
          path: '/users/friendshipRequests/' + requestId + '/decline',
          authOptions,
        });
      });
    },
  };
};

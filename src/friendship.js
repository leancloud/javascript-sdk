const _ = require('underscore');
const { request: LCRequest } = require('./request');
const { getSessionToken } = require('./utils');

module.exports = function(AV) {
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
     * @param {*} [authOptions]
     * @return {Promise<void>}
     */
    request: function(options, authOptions) {
      if (!AV.User.current()) {
        throw new Error('Please signin an user.');
      }
      let friend;
      let attributes;
      if (options.friend) {
        friend = options.friend;
        attributes = options.attributes;
      } else {
        friend = options;
      }
      const friendObject = _.isString(friend)
        ? AV.Object.createWithoutData('_User', friend)
        : friend;
      return LCRequest({
        method: 'POST',
        path: '/users/friendshipRequests',
        data: AV._encode({
          user: AV.User.current(),
          friend: friendObject,
          friendship: attributes,
        }),
        authOptions,
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
      if (!getSessionToken(authOptions) && !AV.User.current()) {
        throw new Error('Please signin an user.');
      }
      let request;
      let attributes;
      if (options.request) {
        request = options.request;
        attributes = options.attributes;
      } else {
        request = options;
      }
      const requestId = _.isString(request) ? request : request.id;
      return LCRequest({
        method: 'PUT',
        path: '/users/friendshipRequests/' + requestId + '/accept',
        data: {
          friendship: AV._encode(attributes),
        },
        authOptions,
      });
    },

    /**
     * Decline a friendship request.
     * @param {AV.Object | string} request The request (or it's objectId) to be declined.
     * @param {AuthOptions} [authOptions]
     * @return {Promise<void>}
     */
    declineRequest: function(request, authOptions = {}) {
      if (!getSessionToken(authOptions) && !AV.User.current()) {
        throw new Error('Please signin an user.');
      }
      const requestId = _.isString(request) ? request : request.id;
      return LCRequest({
        method: 'PUT',
        path: '/users/friendshipRequests/' + requestId + '/decline',
        authOptions,
      });
    },
  };
};

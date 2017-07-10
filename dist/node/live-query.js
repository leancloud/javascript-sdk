'use strict';

var EventEmitter = require('eventemitter3');
var Promise = require('./promise');

var _require = require('./utils'),
    inherits = _require.inherits;

var _require2 = require('./request'),
    request = _require2.request;

module.exports = function (AV) {
  /**
   * @class
   * A LiveQuery, created by {@link AV.Query#subscribe} is an EventEmitter notifies changes of the Query.
   * @since 3.0.0
   */
  AV.LiveQuery = inherits(EventEmitter, /** @lends AV.LiveQuery.prototype */{
    constructor: function constructor(id, client) {
      EventEmitter.apply(this);
      this.id = id;
      this._client = client;
      this._client.register(this);
      client.on('message', this._dispatch.bind(this));
    },
    _dispatch: function _dispatch(message) {
      var _this = this;

      message.forEach(function (_ref) {
        var op = _ref.op,
            object = _ref.object,
            queryId = _ref.query_id,
            updatedKeys = _ref.updatedKeys;

        if (queryId !== _this.id) return;
        var target = AV.parseJSON(Object.assign({
          __type: object.className === '_File' ? 'File' : 'Object'
        }, object));
        if (updatedKeys) {
          /**
           * An existing AV.Object which fulfills the Query you subscribe is updated.
           * @event AV.LiveQuery#update
           * @param {AV.Object|AV.File} target updated object
           * @param {String[]} updatedKeys updated keys
           */
          /**
           * An existing AV.Object which doesn't fulfill the Query is updated and now it fulfills the Query.
           * @event AV.LiveQuery#enter
           * @param {AV.Object|AV.File} target updated object
           * @param {String[]} updatedKeys updated keys
           */
          /**
           * An existing AV.Object which fulfills the Query is updated and now it doesn't fulfill the Query.
           * @event AV.LiveQuery#leave
           * @param {AV.Object|AV.File} target updated object
           * @param {String[]} updatedKeys updated keys
           */
          _this.emit(op, target, updatedKeys);
        } else {
          /**
           * A new AV.Object which fulfills the Query you subscribe is created.
           * @event AV.LiveQuery#create
           * @param {AV.Object|AV.File} target updated object
           */
          /**
           * An existing AV.Object which fulfills the Query you subscribe is deleted.
           * @event AV.LiveQuery#delete
           * @param {AV.Object|AV.File} target updated object
           */
          _this.emit(op, target);
        }
      });
    },

    /**
     * unsubscribe the query
     *
     * @return {Promise}
     */
    unsubscribe: function unsubscribe() {
      this._client.deregister(this);
      return request({
        method: 'POST',
        path: '/LiveQuery/unsubscribe',
        data: {
          id: this._client.id,
          query_id: this.id
        }
      });
    }
  }, {
    init: function init(query) {
      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref2$subscriptionId = _ref2.subscriptionId,
          userDefinedSubscriptionId = _ref2$subscriptionId === undefined ? AV._getSubscriptionId() : _ref2$subscriptionId;

      if (!AV._config.realtime) throw new Error('LiveQuery not supported. Please use the LiveQuery bundle. https://url.leanapp.cn/enable-live-query');
      if (!(query instanceof AV.Query)) throw new TypeError('LiveQuery must be inited with a Query');

      var _query$toJSON = query.toJSON(),
          where = _query$toJSON.where,
          keys = _query$toJSON.keys,
          returnACL = _query$toJSON.returnACL;

      return Promise.resolve(userDefinedSubscriptionId).then(function (subscriptionId) {
        return request({
          method: 'POST',
          path: '/LiveQuery/subscribe',
          data: {
            query: {
              where: where,
              keys: keys,
              returnACL: returnACL,
              className: query.className
            },
            id: subscriptionId
          }
        }).then(function (_ref3) {
          var queryId = _ref3.query_id;
          return AV._config.realtime.createLiveQueryClient(subscriptionId).then(function (liveQueryClient) {
            return new AV.LiveQuery(queryId, liveQueryClient);
          });
        });
      });
    }
  });
};
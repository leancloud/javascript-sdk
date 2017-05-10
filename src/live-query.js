const EventEmitter = require('eventemitter3');
const Promise = require('./promise');
const { inherits } = require('./utils');
const { request } = require('./request');

module.exports = (AV) => {
  const LiveQuery = AV.LiveQuery = inherits(EventEmitter, {
    constructor(id, client) {
      EventEmitter.apply(this);
      this.id = id;
      this._client = client;
      this._client.register(this);
      client.on('message', this._dispatch.bind(this));
    },
    _dispatch(message) {
      message.forEach(({
        op,
        object,
        query_id: queryId,
        updatedKeys,
      }) => {
        if (queryId !== this.id) return;
        const target = AV.parseJSON(Object.assign({
          __type: object.className === '_File' ? 'File' : 'Object',
        }, object));
        if (updatedKeys) {
          this.emit(op, target, updatedKeys);
        } else {
          this.emit(op, target);
        }
      });
    },
    unsubscribe() {
      this._client.deregister(this);
      return request({
        method: 'POST',
        path: '/LiveQuery/unsubscribe',
        data: {
          id: this._client.id,
          query_id: this.id,
        },
      });
    },
  }, {
    init: (query, {
      subscriptionId: userDefinedSubscriptionId = AV._getSubscriptionId(),
    } = {}) => {
      if (!AV._config.realtime) throw new Error('LiveQuery not supported. Please use the LiveQuery bundle. https://url.leanapp.cn/enable-live-query');
      if (!(query instanceof AV.Query)) throw new TypeError('LiveQuery must be inited with a Query');
      const { where, keys } = query.toJSON();
      return Promise.resolve(userDefinedSubscriptionId)
        .then(subscriptionId =>
          request({
            method: 'POST',
            path: '/LiveQuery/subscribe',
            data: {
              query: {
                where,
                keys,
                className: query.className,
              },
              id: subscriptionId,
            },
          }).then(({
            query_id: queryId,
          }) => AV._config.realtime.createLiveQueryClient(subscriptionId)
            .then(liveQueryClient => new LiveQuery(queryId, liveQueryClient))
          )
        );
    },
  });
};

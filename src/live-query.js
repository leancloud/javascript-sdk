const _ = require('underscore');
const EventEmitter = require('eventemitter3');
const { inherits } = require('./utils');
const { request } = require('./request');

const subscribe = (queryJSON, subscriptionId) =>
  request({
    method: 'POST',
    path: '/LiveQuery/subscribe',
    data: {
      query: queryJSON,
      id: subscriptionId,
    },
  });

module.exports = AV => {
  const requireRealtime = () => {
    if (!AV._config.realtime) {
      throw new Error(
        'LiveQuery not supported. Please use the LiveQuery bundle. https://url.leanapp.cn/enable-live-query'
      );
    }
  };
  /**
   * @class
   * A LiveQuery, created by {@link AV.Query#subscribe} is an EventEmitter notifies changes of the Query.
   * @since 3.0.0
   */
  AV.LiveQuery = inherits(
    EventEmitter,
    /** @lends AV.LiveQuery.prototype */ {
      constructor(id, client, queryJSON, subscriptionId) {
        EventEmitter.apply(this);
        this.id = id;
        this._client = client;
        this._client.register(this);
        this._queryJSON = queryJSON;
        this._subscriptionId = subscriptionId;
        this._onMessage = this._dispatch.bind(this);
        this._onReconnect = () => {
          subscribe(this._queryJSON, this._subscriptionId).catch(error =>
            console.error(`LiveQuery resubscribe error: ${error.message}`)
          );
        };
        client.on('message', this._onMessage);
        client.on('reconnect', this._onReconnect);
      },
      _dispatch(message) {
        message.forEach(({ op, object, query_id: queryId, updatedKeys }) => {
          if (queryId !== this.id) return;
          const target = AV.parseJSON(
            _.extend(
              {
                __type: object.className === '_File' ? 'File' : 'Object',
              },
              object
            )
          );
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
            this.emit(op, target, updatedKeys);
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
            this.emit(op, target);
          }
        });
      },
      /**
       * unsubscribe the query
       *
       * @return {Promise}
       */
      unsubscribe() {
        const client = this._client;
        client.off('message', this._onMessage);
        client.off('reconnect', this._onReconnect);
        client.deregister(this);
        return request({
          method: 'POST',
          path: '/LiveQuery/unsubscribe',
          data: {
            id: client.id,
            query_id: this.id,
          },
        });
      },
    },
    /** @lends AV.LiveQuery */
    {
      init(
        query,
        {
          subscriptionId: userDefinedSubscriptionId = AV._getSubscriptionId(),
        } = {}
      ) {
        requireRealtime();
        if (!(query instanceof AV.Query))
          throw new TypeError('LiveQuery must be inited with a Query');
        return Promise.resolve(userDefinedSubscriptionId).then(subscriptionId =>
          AV._config.realtime
            .createLiveQueryClient(subscriptionId)
            .then(liveQueryClient => {
              const { where, keys, returnACL } = query._getParams();
              const queryJSON = {
                where,
                keys,
                returnACL,
                className: query.className,
              };
              const promise = subscribe(queryJSON, subscriptionId)
                .then(
                  ({ query_id: queryId }) =>
                    new AV.LiveQuery(
                      queryId,
                      liveQueryClient,
                      queryJSON,
                      subscriptionId
                    )
                )
                .finally(() => {
                  liveQueryClient.deregister(promise);
                });
              liveQueryClient.register(promise);
              return promise;
            })
        );
      },
      /**
       * Pause the LiveQuery connection. This is useful to deactivate the SDK when the app is swtiched to background.
       * @static
       * @return void
       */
      pause() {
        requireRealtime();
        return AV._config.realtime.pause();
      },
      /**
       * Resume the LiveQuery connection. All subscriptions will be restored after reconnection.
       * @static
       * @return void
       */
      resume() {
        requireRealtime();
        return AV._config.realtime.resume();
      },
    }
  );
};

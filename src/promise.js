var _ = require('underscore');
var Promise = require('rsvp').Promise;

/**
 * Run the given callbacks after this promise is fulfilled.
 * @param optionsOrCallback {} A Backbone-style options callback, or a
 * callback function. If this is an options object and contains a "model"
 * attributes, that will be passed to error callbacks as the first argument.
 * @param model {} If truthy, this will be passed as the first result of
 * error callbacks. This is for Backbone-compatability.
 * @return {AV.Promise} A promise that will be resolved after the
 * callbacks are run, with the same result as this.
 */
Promise.prototype._thenRunCallbacks = function(optionsOrCallback, model) {
  var options;
  if (_.isFunction(optionsOrCallback)) {
    var callback = optionsOrCallback;
    options = {
      success: function(result) {
        callback(result, null);
      },
      error: function(error) {
        callback(null, error);
      }
    };
  } else {
    options = _.clone(optionsOrCallback);
  }
  options = options || {};

  return this.then(function(result) {
    if (options.success) {
      options.success.apply(this, arguments);
    } else if (model) {
      // When there's no callback, a sync event should be triggered.
      model.trigger('sync', model, result, options);
    }
    return Promise.resolve.apply(Promise, arguments);
  }, function(error) {
    if (options.error) {
      if (!_.isUndefined(model)) {
        options.error(model, error);
      } else {
        options.error(error);
      }
    } else if (model) {
      // When there's no error callback, an error event should be triggered.
      model.trigger('error', model, error, options);
    }
    // By explicitly returning a rejected Promise, this will work with
    // either jQuery or Promises/A semantics.
    return Promise.reject(error);
  });
};

Promise._continueWhile = function(predicate, asyncFunction) {
  if (predicate()) {
    return asyncFunction().then(function() {
      return Promise._continueWhile(predicate, asyncFunction);
    });
  }
  return Promise.resolve();
};

module.exports = Promise;

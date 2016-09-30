'use strict';

var _ = require('underscore');
var Promise = require('rsvp').Promise;

Promise._continueWhile = function (predicate, asyncFunction) {
  if (predicate()) {
    return asyncFunction().then(function () {
      return Promise._continueWhile(predicate, asyncFunction);
    });
  }
  return Promise.resolve();
};

module.exports = Promise;
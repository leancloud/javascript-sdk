'use strict';

var _ = require('underscore');
var Promise = require('./promise');
var localStorage = require('./utils/localstorage');

var syncApiNames = ['getItem', 'setItem', 'removeItem', 'clear'];

if (!localStorage.async) {
  // wrap sync apis with async ones.
  _(syncApiNames).each(function (apiName) {
    if (typeof localStorage[apiName] === 'function') {
      localStorage[apiName + 'Async'] = function () {
        return Promise.resolve(localStorage[apiName].apply(localStorage, arguments));
      };
    }
  });
} else {
  _(syncApiNames).each(function (apiName) {
    if (typeof localStorage[apiName] !== 'function') {
      localStorage[apiName] = function () {
        var error = new Error('Synchronous API [' + apiName + '] is not available in this runtime.');
        error.code = 'SYNC_API_NOT_AVAILABLE';
        throw error;
      };
    }
  });
}

module.exports = localStorage;
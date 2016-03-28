/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

'use strict';

var _ = require('underscore');
var Promise = require('./promise');
var localStorage = require('./browserify-wrapper/localStorage');

var syncApiNames = ['getItem', 'setItem', 'removeItem', 'clear'];

if (!localStorage.async) {
  // wrap sync apis with async ones.
  _(syncApiNames).each(function (apiName) {
    if (typeof localStorage[apiName] === 'function') {
      localStorage[apiName + 'Async'] = function () {
        return Promise.as(localStorage[apiName].apply(localStorage, arguments));
      };
    }
  });
} else {
  _(syncApiNames).each(function (apiName) {
    if (typeof localStorage[apiName] !== 'function') {
      localStorage[apiName] = function () {
        throw new Error('Synchronous API [' + apiName + '] is not available in this runtime.');
      };
    }
  });
}

module.exports = localStorage;
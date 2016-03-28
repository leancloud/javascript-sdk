/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

'use strict';

var _ = require('underscore');
var Promise = require('../promise');

// interface Storage {
//   readonly attribute boolean async;
//   string getItem(string key);
//   void setItem(string key, string value);
//   void removeItem(string key);
//   void clear();
//   Promise getItemAsync(string key);
//   Promise setItemAsync(string key, string value);
//   Promise removeItemAsync(string key);
//   Promise clearAsync();
// }
var Storage = {};
var apiNames = ['getItem', 'setItem', 'removeItem', 'clear'];

if (global.localStorage) {

  var localStorage = global.localStorage;

  try {
    var testKey = '__storejs__';
    localStorage.setItem(testKey, testKey);
    if (localStorage.getItem(testKey) != testKey) {
      throw new Error();
    }
    localStorage.removeItem(testKey);
  } catch (e) {
    localStorage = require('localstorage-memory');
  }

  // in browser, `localStorage.async = false` will excute `localStorage.setItem('async', false)`
  _(apiNames).each(function (apiName) {
    Storage[apiName] = function () {
      return global.localStorage[apiName].apply(global.localStorage, arguments);
    };
  });
  Storage.async = false;
} else {
  var AsyncStorage = require('react-native').AsyncStorage;
  _(apiNames).each(function (apiName) {
    Storage[apiName + 'Async'] = function () {
      return Promise.as(AsyncStorage[apiName].apply(AsyncStorage, arguments));
    };
  });
  Storage.async = true;
}

module.exports = Storage;
'use strict';

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

module.exports = localStorage;

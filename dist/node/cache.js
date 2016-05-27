'use strict';

/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

var storage = require('./localstorage');
var AV = require('./av');

var remove = exports.remove = storage.removeItemAsync.bind(storage);

exports.get = function (key) {
  return storage.getItemAsync(AV.applicationId + '/' + key).then(function (cache) {
    try {
      cache = JSON.parse(cache);
    } catch (e) {
      return null;
    }
    if (cache) {
      var expired = cache.expiredAt && cache.expiredAt < Date.now();
      if (!expired) {
        return cache.value;
      }
      return remove(key).then(function () {
        return null;
      });
    }
    return null;
  });
};

exports.set = function (key, value, ttl) {
  var cache = { value: value };
  if (typeof ttl === 'number') {
    cache.expiredAt = Date.now() + ttl;
  }
  return storage.setItemAsync(AV.applicationId + '/' + key, JSON.stringify(cache));
};
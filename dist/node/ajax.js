/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

'use strict';

var request = require('superagent');
var debug = require('debug')('ajax');

var Promise = require('./promise');

module.exports = function _ajax(method, resourceUrl, data) {
  var headers = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
  var onprogress = arguments[4];

  debug(method, resourceUrl, data, headers);

  var promise = new Promise();

  var req = request(method, resourceUrl).set(headers).send(data).end(function (err, res) {
    if (res) {
      debug(res.status, res.body, res.text);
    }
    if (err) {
      if (res) {
        err.statusCode = res.status;
        err.responseText = res.text;
        err.response = res.body;
      }
      return promise.reject(err);
    }
    promise.resolve(res.body, res.status, res);
  });
  if (onprogress) {
    req.on('progress', onprogress);
  }

  return promise;
};
/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

'use strict';

const http = require('http');
const https = require('https');
const url = require('url');
const debug = require('debug')('ajax');

const Promise = require('../promise');
const VERSION = require('../version');

module.exports = function _ajax(method, resourceUrl, data, headers = {}) {
  debug(method, resourceUrl, data, headers);

  var parsedUrl = url.parse(resourceUrl);

  var promise = new Promise();

  var transportModule = http;

  if (parsedUrl.protocol === 'https:') {
    transportModule = https;
  }

  delete headers['X-LC-UA'];
  headers['User-Agent'] = _ajax.userAgent || 'AV/' + VERSION + '; Node.js/' + process.version;
  var req = transportModule.request({
    method: method,
    protocol: parsedUrl.protocol,
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.path,
    headers,
  });

  req.on('response', function(res) {
    var responseText = '';

    res.on('data', function(chunk) {
      responseText += chunk.toString();
    });

    res.on('end', function() {
      debug(res.statusCode, responseText);
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          promise.resolve(JSON.parse(responseText), res.statusCode, res);
        } catch (err) {
          err.statusCode = res.statusCode;
          err.responseText = responseText;
          promise.reject(err);
        }
      } else {
        promise.reject({responseText: responseText});
      }
    });
  });

  req.on('error', function(err) {
    promise.reject(err);
  });

  req.end(JSON.stringify(data));
  debug(req);
  return promise;
};

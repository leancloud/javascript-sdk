'use strict';

var http = require('http');
var https = require('https');
var url = require('url');

var Promise = require('../promise');
var AV_VERSION = require('../version');

// `keepAlive` option only work on Node.js 0.12+
var httpAgent = new http.Agent({ keepAlive: true });
var httpsAgent = new https.Agent({ keepAlive: true });

module.exports = function _ajax(method, resourceUrl, data, success, error) {
  var parsedUrl = url.parse(resourceUrl);
  var promise = new Promise();

  var transportModule = http;
  var transportAgent = httpAgent;

  if (parsedUrl.protocol === 'https:') {
    transportModule = https;
    transportAgent = httpsAgent;
  }

  var req = transportModule.request({
    method: method,
    protocol: parsedUrl.protocol,
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.path,
    agent: transportAgent,
    headers: {
      'Content-Type': 'text/plain',
      'User-Agent': 'AV/' + AV_VERSION + ' (Node.js' + process.version + ')'
    }
  });

  req.on('response', function (res) {
    var responseText = '';

    res.on('data', function (chunk) {
      responseText += chunk.toString();
    });

    res.on('end', function () {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          promise.resolve(JSON.parse(responseText), res.statusCode, res);
        } catch (err) {
          err.statusCode = res.statusCode;
          err.responseText = responseText;
          promise.reject(err);
        }
      } else {
        promise.reject({ responseText: responseText });
      }
    });
  });

  req.on('error', function (err) {
    promise.reject(err);
  });

  req.end(data);
  return promise._thenRunCallbacks({
    success: success,
    error: error
  });
};
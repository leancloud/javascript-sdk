'use strict';

var http = require('http');
var https = require('https');
var url = require('url');

module.exports = function(AV) {
  // `keepAlive` option only work on Node.js 0.12+
  AV._httpAgent = new http.Agent({keepAlive: true});
  AV._httpsAgent = new https.Agent({keepAlive: true});

  AV._ajax = function _ajax(method, resourceUrl, data, success, error) {
    var parsedUrl = url.parse(resourceUrl);
    var promise = new AV.Promise();

    var transportModule = http;
    var transportAgent = AV._httpAgent;

    if (parsedUrl.protocol === 'https:') {
      transportModule = https;
      transportAgent = AV._httpsAgent;
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
        'User-Agent': 'AV/' + AV.VERSION + ' (Node.js' + process.version + ')'
      }
    });

    req.on('response', function(res) {
      var responseText = '';

      res.on('data', function(chunk) {
        responseText += chunk.toString();
      });

      res.on('end', function() {
        try {
          promise.resolve(JSON.parse(responseText), res.statusCode, res);
        } catch (err) {
          promise.reject(err);
        }
      });
    });

    req.on('error', function(err) {
      promise.reject(err);
    });

    req.end(data);
    return promise._thenRunCallbacks({
      success: success,
      error: error
    });
  };
}

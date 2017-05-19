'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var request = require('superagent');
var debug = require('debug')('leancloud:request');
var md5 = require('md5');
var Promise = require('./promise');
var Cache = require('./cache');
var AVError = require('./error');
var AV = require('./av');
var _ = require('underscore');

var _require = require('./utils'),
    getSessionToken = _require.getSessionToken;

var getServerURLPromise = void 0;

// 服务器请求的节点 host
var API_HOST = {
  cn: 'https://api.leancloud.cn',
  us: 'https://us-api.leancloud.cn'
};

// 计算 X-LC-Sign 的签名方法
var sign = function sign(key, isMasterKey) {
  var now = new Date().getTime();
  var signature = md5(now + key);
  if (isMasterKey) {
    return signature + ',' + now + ',master';
  }
  return signature + ',' + now;
};

var requestsCount = 0;

var ajax = function ajax(method, resourceUrl, data) {
  var headers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var onprogress = arguments[4];

  var count = requestsCount++;

  debug('request(' + count + ')', method, resourceUrl, data, headers);

  return new Promise(function (resolve, reject) {
    var req = request(method, resourceUrl).set(headers).send(data);
    if (onprogress) {
      req.on('progress', onprogress);
    }
    req.end(function (err, res) {
      if (res) {
        debug('response(' + count + ')', res.status, res.body || res.text, res.header);
      }
      if (err) {
        if (res) {
          err.statusCode = res.status;
          err.responseText = res.text;
          err.response = res.body;
        }
        return reject(err);
      }
      return resolve(res.body);
    });
  });
};

var setAppKey = function setAppKey(headers, signKey) {
  if (signKey) {
    headers['X-LC-Sign'] = sign(AV.applicationKey);
  } else {
    headers['X-LC-Key'] = AV.applicationKey;
  }
};

var setHeaders = function setHeaders() {
  var authOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var signKey = arguments[1];

  var headers = {
    'X-LC-Id': AV.applicationId,
    'Content-Type': 'application/json;charset=UTF-8'
  };
  var useMasterKey = false;
  if (typeof authOptions.useMasterKey === 'boolean') {
    useMasterKey = authOptions.useMasterKey;
  } else if (typeof AV._useMasterKey === 'boolean') {
    useMasterKey = AV._useMasterKey;
  }
  if (useMasterKey) {
    if (AV.masterKey) {
      if (signKey) {
        headers['X-LC-Sign'] = sign(AV.masterKey, true);
      } else {
        headers['X-LC-Key'] = AV.masterKey + ',master';
      }
    } else {
      console.warn('masterKey is not set, fall back to use appKey');
      setAppKey(headers, signKey);
    }
  } else {
    setAppKey(headers, signKey);
  }
  if (AV.hookKey) {
    headers['X-LC-Hook-Key'] = AV.hookKey;
  }
  if (AV._config.applicationProduction !== null) {
    headers['X-LC-Prod'] = String(AV._config.applicationProduction);
  }
  headers[!process.env.CLIENT_PLATFORM ? 'User-Agent' : 'X-LC-UA'] = AV._config.userAgent;

  return Promise.resolve().then(function () {
    // Pass the session token
    var sessionToken = getSessionToken(authOptions);
    if (sessionToken) {
      headers['X-LC-Session'] = sessionToken;
    } else if (!AV._config.disableCurrentUser) {
      return AV.User.currentAsync().then(function (currentUser) {
        if (currentUser && currentUser._sessionToken) {
          headers['X-LC-Session'] = currentUser._sessionToken;
        }
        return headers;
      });
    }
    return headers;
  });
};

var createApiUrl = function createApiUrl(route, className, objectId, method, dataObject) {
  // TODO: 兼容 AV.serverURL 旧方式设置 API Host，后续去掉
  if (AV.serverURL) {
    AV._config.APIServerURL = AV.serverURL;
    console.warn('Please use AV._config.APIServerURL to replace AV.serverURL, and it is an internal interface.');
  }

  var apiURL = AV._config.APIServerURL || API_HOST.cn;

  if (apiURL.charAt(apiURL.length - 1) !== '/') {
    apiURL += '/';
  }
  apiURL += '1.1/' + route;
  if (className) {
    apiURL += '/' + className;
  }
  if (objectId) {
    apiURL += '/' + objectId;
  }
  if ((route === 'users' || route === 'classes') && dataObject) {
    apiURL += '?';
    if (dataObject._fetchWhenSave) {
      delete dataObject._fetchWhenSave;
      apiURL += '&new=true';
    }
    if (dataObject._where) {
      apiURL += '&where=' + encodeURIComponent(JSON.stringify(dataObject._where));
      delete dataObject._where;
    }
  }

  if (method.toLowerCase() === 'get') {
    if (apiURL.indexOf('?') === -1) {
      apiURL += '?';
    }
    for (var k in dataObject) {
      if (_typeof(dataObject[k]) === 'object') {
        dataObject[k] = JSON.stringify(dataObject[k]);
      }
      apiURL += '&' + k + '=' + encodeURIComponent(dataObject[k]);
    }
  }

  return apiURL;
};

var cacheServerURL = function cacheServerURL(serverURL, ttl) {
  if (typeof ttl !== 'number') {
    ttl = 3600;
  }
  return Cache.setAsync('APIServerURL', serverURL, ttl * 1000);
};

// handle AV._request Error
var handleError = function handleError(error) {
  return new Promise(function (resolve, reject) {
    /**
      When API request need to redirect to the right location,
      can't use browser redirect by http status 307, as the reason of CORS,
      so API server response http status 410 and the param "location" for this case.
    */
    if (error.statusCode === 410) {
      cacheServerURL(error.response.api_server, error.response.ttl).then(function () {
        resolve(error.response.location);
      }).catch(reject);
    } else {
      var errorJSON = {
        code: error.code || -1,
        error: error.message || error.responseText
      };
      if (error.response && error.response.code) {
        errorJSON = error.response;
      } else if (error.responseText) {
        try {
          errorJSON = JSON.parse(error.responseText);
        } catch (e) {
          // If we fail to parse the error text, that's okay.
        }
      }

      // Transform the error into an instance of AVError by trying to parse
      // the error string as JSON.
      reject(new AVError(errorJSON.code, errorJSON.error));
    }
  });
};

var setServerUrl = function setServerUrl(serverURL) {
  AV._config.APIServerURL = 'https://' + serverURL;

  // 根据新 URL 重新设置区域
  var newRegion = _.findKey(API_HOST, function (item) {
    return item === AV._config.APIServerURL;
  });
  if (newRegion) {
    AV._config.region = newRegion;
  }
};

var refreshServerUrlByRouter = function refreshServerUrlByRouter() {
  var url = 'https://app-router.leancloud.cn/1/route?appId=' + AV.applicationId;
  return ajax('get', url).then(function (servers) {
    if (servers.api_server) {
      setServerUrl(servers.api_server);
      return cacheServerURL(servers.api_server, servers.ttl);
    }
  }, function (error) {
    // bypass all non-4XX errors
    if (error.statusCode >= 400 && error.statusCode < 500) {
      throw error;
    }
  });
};

var setServerUrlByRegion = function setServerUrlByRegion() {
  var region = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'cn';

  getServerURLPromise = new Promise(function (resolve, reject) {
    // 如果用户在 init 之前设置了 APIServerURL，则跳过请求 router
    if (AV._config.APIServerURL) {
      resolve();
      return;
    }
    // if not china server region, do not use router
    if (region === 'cn') {
      return Cache.getAsync('APIServerURL').then(function (serverURL) {
        if (serverURL) {
          setServerUrl(serverURL);
        } else {
          return refreshServerUrlByRouter();
        }
      }).then(function () {
        resolve();
      }).catch(function (error) {
        reject(error);
      });
    } else {
      AV._config.region = region;
      AV._config.APIServerURL = API_HOST[region];
      resolve();
    }
  });
};

/**
 * route is classes, users, login, etc.
 * objectId is null if there is no associated objectId.
 * method is the http method for the REST API.
 * dataObject is the payload as an object, or null if there is none.
 * @ignore
 */
var AVRequest = function AVRequest(route, className, objectId, method) {
  var dataObject = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var authOptions = arguments[5];

  if (!AV.applicationId) {
    throw new Error('You must specify your applicationId using AV.init()');
  }

  if (!AV.applicationKey && !AV.masterKey) {
    throw new Error('You must specify a AppKey using AV.init()');
  }

  if (!getServerURLPromise) {
    return Promise.reject(new Error('Not initialized'));
  }
  return getServerURLPromise.then(function () {
    var apiURL = createApiUrl(route, className, objectId, method, dataObject);
    return setHeaders(authOptions, route !== 'bigquery').then(function (headers) {
      return ajax(method, apiURL, dataObject, headers).then(null, function (res) {
        return handleError(res).then(function (location) {
          return ajax(method, location, dataObject, headers);
        });
      });
    });
  });
};

module.exports = {
  ajax: ajax,
  request: AVRequest,
  setServerUrlByRegion: setServerUrlByRegion
};
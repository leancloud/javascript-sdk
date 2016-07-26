'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

var request = require('superagent');
var debug = require('debug')('request');
var md5 = require('md5');
var AVPromise = require('./promise');
var Cache = require('./cache');
var AVError = require('./error');
var AV = require('./av');
var _ = require('underscore');

var getServerURLPromise = undefined;

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

var checkRouter = function checkRouter(router) {
  var routerList = ['batch', 'classes', 'files', 'date', 'functions', 'call', 'login', 'push', 'search/select', 'requestPasswordReset', 'requestEmailVerify', 'requestPasswordResetBySmsCode', 'resetPasswordBySmsCode', 'requestMobilePhoneVerify', 'requestLoginSmsCode', 'verifyMobilePhone', 'requestSmsCode', 'verifySmsCode', 'users', 'usersByMobilePhone', 'cloudQuery', 'qiniu', 'fileTokens', 'statuses', 'bigquery', 'search/select', 'subscribe/statuses/count', 'subscribe/statuses', 'installations'];

  if (routerList.indexOf(router) === -1 && !/users\/[^\/]+\/updatePassword/.test(router) && !/users\/[^\/]+\/friendship\/[^\/]+/.test(router)) {
    throw new Error('Bad router: ' + router + '.');
  }
};

var ajax = function ajax(method, resourceUrl, data) {
  var headers = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
  var onprogress = arguments[4];

  debug(method, resourceUrl, data, headers);

  var promise = new AVPromise();
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
    return promise.resolve(res.body, res.status, res);
  });
  if (onprogress) {
    req.on('progress', onprogress);
  }
  return promise;
};

var setHeaders = function setHeaders(sessionToken) {
  var headers = {
    'X-LC-Id': AV.applicationId,
    'Content-Type': 'application/json;charset=UTF-8'
  };
  if (AV.masterKey && AV._useMasterKey) {
    headers['X-LC-Sign'] = sign(AV.masterKey, true);
  } else {
    headers['X-LC-Sign'] = sign(AV.applicationKey);
  }
  if (AV._config.applicationProduction !== null) {
    headers['X-LC-Prod'] = AV._config.applicationProduction;
  }
  if (!AV._config.isNode) {
    headers['X-LC-UA'] = 'AV/' + AV.version;
  } else {
    // LeanEngine need use AV._config.userAgent
    headers['User-Agent'] = AV._config.userAgent || 'AV/' + AV.version + '; Node.js/' + process.version;
  }

  var promise = new AVPromise();

  // Pass the session token
  if (sessionToken) {
    headers['X-LC-Session'] = sessionToken;
    promise.resolve(headers);
  } else if (!AV._config.disableCurrentUser) {
    AV.User.currentAsync().then(function (currentUser) {
      if (currentUser && currentUser._sessionToken) {
        headers['X-LC-Session'] = currentUser._sessionToken;
      }
      promise.resolve(headers);
    });
  } else {
    promise.resolve(headers);
  }

  return promise;
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
var handleError = function handleError(res) {
  var promise = new AVPromise();
  /**
    When API request need to redirect to the right location,
    can't use browser redirect by http status 307, as the reason of CORS,
    so API server response http status 410 and the param "location" for this case.
  */
  if (res.statusCode === 410) {
    cacheServerURL(res.response.api_server, res.response.ttl).then(function () {
      promise.resolve(res.response.location);
    }).catch(function (error) {
      promise.reject(error);
    });
  } else {
    var errorJSON = { code: -1, error: res.responseText };
    if (res.response && res.response.code) {
      errorJSON = res.response;
    } else if (res.responseText) {
      try {
        errorJSON = JSON.parse(res.responseText);
      } catch (e) {
        // If we fail to parse the error text, that's okay.
      }
    }

    // Transform the error into an instance of AVError by trying to parse
    // the error string as JSON.
    var error = new AVError(errorJSON.code, errorJSON.error);
    promise.reject(error);
  }
  return promise;
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
  var region = arguments.length <= 0 || arguments[0] === undefined ? 'cn' : arguments[0];

  getServerURLPromise = new AVPromise();
  var promise = getServerURLPromise;
  // 如果用户在 init 之前设置了 APIServerURL，则跳过请求 router
  if (AV._config.APIServerURL) {
    promise.resolve();
    return;
  }
  // if not china server region, do not use router
  if (region === 'cn') {
    Cache.getAsync('APIServerURL').then(function (serverURL) {
      if (serverURL) {
        setServerUrl(serverURL);
      } else {
        return refreshServerUrlByRouter();
      }
    }).then(function () {
      promise.resolve();
    }).catch(function (error) {
      promise.reject(error);
    });
  } else {
    AV._config.region = region;
    AV._config.APIServerURL = API_HOST[region];
    promise.resolve();
  }
};

/**
 * route is classes, users, login, etc.
 * objectId is null if there is no associated objectId.
 * method is the http method for the REST API.
 * dataObject is the payload as an object, or null if there is none.
 * @ignore
 */
var AVRequest = function AVRequest(route, className, objectId, method) {
  var dataObject = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];
  var sessionToken = arguments[5];

  if (!AV.applicationId) {
    throw new Error('You must specify your applicationId using AV.init()');
  }

  if (!AV.applicationKey && !AV.masterKey) {
    throw new Error('You must specify a AppKey using AV.init()');
  }

  checkRouter(route);

  if (!getServerURLPromise) {
    return AVPromise.error(new Error('Not initialized'));
  }
  return getServerURLPromise.then(function () {
    var apiURL = createApiUrl(route, className, objectId, method, dataObject);
    return setHeaders(sessionToken).then(function (headers) {
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
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

var request = require('superagent');
var debug = require('debug')('request');
var md5 = require('md5');
var Promise = require('./promise');

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
    return promise.resolve(res.body, res.status, res);
  });
  if (onprogress) {
    req.on('progress', onprogress);
  }
  return promise;
};

var setHeaders = function setHeaders(AV, sessionToken) {

  var headers = {
    'X-LC-Id': AV.applicationId,
    'Content-Type': 'application/json;charset=UTF-8'
  };
  if (AV.masterKey && AV._useMasterKey) {
    headers['X-LC-Sign'] = sign(AV.masterKey, true);
  } else {
    headers['X-LC-Sign'] = sign(AV.applicationKey);
  }
  if (!AV._isNullOrUndefined(AV.applicationProduction)) {
    headers['X-LC-Prod'] = AV.applicationProduction;
  }
  if (!AV._config.isNode) {
    headers['X-LC-UA'] = 'AV/' + AV.version;
  } else {
    // LeanEngine need use AV._config.userAgent
    headers['User-Agent'] = AV._config.userAgent || 'AV/' + AV.version + '; Node.js/' + process.version;
  }

  var promise = new Promise();

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

var createApiUrl = function createApiUrl(AV, route, className, objectId, method, dataObject) {
  // TODO: 兼容 AV.serverURL 旧方式设置 API Host，后续去掉
  if (AV.serverURL) {
    AV._config.APIServerURL = AV.serverURL;
    console.warn('Please use AV._config.APIServerURL to replace AV.serverURL, and it is an internal interface.');
  }

  var apiURL = AV._config.APIServerURL;

  // Test Data
  // apiURL = 'https://e1-api.leancloud.cn';

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

/**
  When API request need to redirect to the right location,
  can't use browser redirect by http status 307, as the reason of CORS,
  so API server response http status 410 and the param "location" for this case.
*/
// const retryRequest = () => {

// };

var init = function init(AV) {
  /**
   * route is classes, users, login, etc.
   * objectId is null if there is no associated objectId.
   * method is the http method for the REST API.
   * dataObject is the payload as an object, or null if there is none.
   * @ignore
   */
  AV._request = function (route, className, objectId, method) {
    var dataObject = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];
    var sessionToken = arguments[5];

    if (!AV.applicationId) {
      throw new Error('You must specify your applicationId using AV.init()');
    }

    if (!AV.applicationKey && !AV.masterKey) {
      throw new Error('You must specify a AppKey using AV.init()');
    }

    checkRouter(route);
    var apiURL = createApiUrl(AV, route, className, objectId, method, dataObject);

    return setHeaders(AV, sessionToken).then(function (headers) {
      return ajax(method, apiURL, dataObject, headers).then(null, function (response) {
        // Transform the error into an instance of AV.Error by trying to parse
        // the error string as JSON.
        var error = undefined;
        if (response) {
          if (response.response) {
            error = new AV.Error(response.response.code, response.response.error);
          } else if (response.responseText) {
            try {
              var errorJSON = JSON.parse(response.responseText);
              if (errorJSON) {
                error = new AV.Error(errorJSON.code, errorJSON.error);
              }
            } catch (e) {
              // If we fail to parse the error text, that's okay.
            }
          }
        }
        error = error || new AV.Error(-1, response.responseText);

        // By explicitly returning a rejected Promise, this will work with
        // either jQuery or Promises/A semantics.
        return Promise.error(error);
      });
    });
  };
};

module.exports = {
  init: init,
  ajax: ajax
};
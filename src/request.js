/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

const request = require('superagent');
const debug = require('debug')('request');
const md5 = require('md5');
const Promise = require('./promise');

// 计算 X-LC-Sign 的签名方法
const sign = (key, isMasterKey) => {
  const now = new Date().getTime();
  const signature = md5(now + key);
  if (isMasterKey) {
    return `${signature},${now},master`;
  }
  return `${signature},${now}`;
};

const checkRouter = (router) => {
  const routerList = [
    'batch',
    'classes',
    'files',
    'date',
    'functions',
    'call',
    'login',
    'push',
    'search/select',
    'requestPasswordReset',
    'requestEmailVerify',
    'requestPasswordResetBySmsCode',
    'resetPasswordBySmsCode',
    'requestMobilePhoneVerify',
    'requestLoginSmsCode',
    'verifyMobilePhone',
    'requestSmsCode',
    'verifySmsCode',
    'users',
    'usersByMobilePhone',
    'cloudQuery',
    'qiniu',
    'fileTokens',
    'statuses',
    'bigquery',
    'search/select',
    'subscribe/statuses/count',
    'subscribe/statuses',
    'installations',
  ];

  if (routerList.indexOf(router) === -1 &&
    !(/users\/[^\/]+\/updatePassword/.test(router)) &&
    !(/users\/[^\/]+\/friendship\/[^\/]+/.test(router))
  ) {
    throw new Error(`Bad router: ${router}.`);
  }
};

const ajax = (method, resourceUrl, data, headers = {}, onprogress) => {
  debug(method, resourceUrl, data, headers);

  const promise = new Promise();
  const req = request(method, resourceUrl)
    .set(headers)
    .send(data)
    .end((err, res) => {
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

const init = (AV) => {

  let AVConfig = AV._config;

  /**
   * route is classes, users, login, etc.
   * objectId is null if there is no associated objectId.
   * method is the http method for the REST API.
   * dataObject is the payload as an object, or null if there is none.
   * @ignore
   */
  AV._request = (route, className, objectId, method, dataObject, sessionToken) => {
    if (!AV.applicationId) {
      throw new Error('You must specify your applicationId using AV.init()');
    }

    if (!AV.applicationKey && !AV.masterKey) {
      throw new Error('You must specify a AppKey using AV.init()');
    }

    checkRouter(route);

    dataObject = dataObject || {};

    // 兼容 AV.serverURL 旧方式设置 API Host，后续去掉
    let apiURL = AV.serverURL || AVConfig.APIServerURL;
    if (AV.serverURL) {
      AVConfig.APIServerURL = AV.serverURL;
      console.warn('Please use AVConfig.APIServerURL to replace AV.serverURL .');
    }
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
        apiURL += ('&where=' + encodeURIComponent(JSON.stringify(dataObject._where)));
        delete dataObject._where;
      }
    }

    const headers = {
      'X-LC-Id': AV.applicationId,
      'Content-Type': 'application/json;charset=UTF-8',
    };
    if (AV.masterKey && AV._useMasterKey) {
      headers['X-LC-Sign'] = sign(AV.masterKey, true);
    } else {
      headers['X-LC-Sign'] = sign(AV.applicationKey);
    }
    if (!AV._isNullOrUndefined(AV.applicationProduction)) {
      headers['X-LC-Prod'] = AV.applicationProduction;
    }
    if (!AVConfig.isNode) {
      headers['X-LC-UA'] = `AV/${AV.version}`;
    } else {
      headers['User-Agent'] = AVConfig.userAgent || `AV/${AV.version}; Node.js/${process.version}`;
    }

    return AV.Promise.as().then(() => {
      // Pass the session token
      if (sessionToken) {
        headers['X-LC-Session'] = sessionToken;
      } else if (!AVConfig.disableCurrentUser) {
        return AV.User.currentAsync().then((currentUser) => {
          if (currentUser && currentUser._sessionToken) {
            headers['X-LC-Session'] = currentUser._sessionToken;
          }
        });
      }
    }).then(() => {
      if (method.toLowerCase() === 'get') {
        if (apiURL.indexOf('?') === -1) {
          apiURL += '?';
        }
        for (let k in dataObject) {
          if (typeof dataObject[k] === 'object') {
            dataObject[k] = JSON.stringify(dataObject[k]);
          }
          apiURL += '&' + k + '=' + encodeURIComponent(dataObject[k]);
        }
      }

      return ajax(method, apiURL, dataObject, headers).then(null, (response) => {
        // Transform the error into an instance of AV.Error by trying to parse
        // the error string as JSON.
        let error;
        if (response) {
          if (response.response) {
            error = new AV.Error(response.response.code, response.response.error);
          } else if (response.responseText) {
            try {
              const errorJSON = JSON.parse(response.responseText);
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
        return AV.Promise.error(error);
      });
    });
  };
};

module.exports = {
  init,
  ajax,
};

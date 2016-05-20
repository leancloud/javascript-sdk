/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

const request = require('superagent');
const debug = require('debug')('request');
const md5 = require('md5');
const Promise = require('./promise');
const Cache = require('./cache');

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

const setHeaders = (AV, sessionToken) => {
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
  if (!AV._config.isNode) {
    headers['X-LC-UA'] = `AV/${AV.version}`;
  } else {
    // LeanEngine need use AV._config.userAgent
    headers['User-Agent'] = AV._config.userAgent || `AV/${AV.version}; Node.js/${process.version}`;
  }

  const promise = new Promise();

  // Pass the session token
  if (sessionToken) {
    headers['X-LC-Session'] = sessionToken;
    promise.resolve(headers);
  } else if (!AV._config.disableCurrentUser) {
    AV.User.currentAsync().then((currentUser) => {
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

const createApiUrl = (AV, route, className, objectId, method, dataObject) => {
  // TODO: 兼容 AV.serverURL 旧方式设置 API Host，后续去掉
  if (AV.serverURL) {
    AV._config.APIServerURL = AV.serverURL;
    console.warn('Please use AV._config.APIServerURL to replace AV.serverURL, and it is an internal interface.');
  }

  let apiURL = AV._config.APIServerURL;

  if (apiURL.charAt(apiURL.length - 1) !== '/') {
    apiURL += '/';
  }
  apiURL += `1.1/${route}`;
  if (className) {
    apiURL += `/${className}`;
  }
  if (objectId) {
    apiURL += `/${objectId}`;
  }
  if ((route === 'users' || route === 'classes') && dataObject) {
    apiURL += '?';
    if (dataObject._fetchWhenSave) {
      delete dataObject._fetchWhenSave;
      apiURL += '&new=true';
    }
    if (dataObject._where) {
      apiURL += `&where=${encodeURIComponent(JSON.stringify(dataObject._where))}`;
      delete dataObject._where;
    }
  }

  if (method.toLowerCase() === 'get') {
    if (apiURL.indexOf('?') === -1) {
      apiURL += '?';
    }
    for (const k in dataObject) {
      if (typeof dataObject[k] === 'object') {
        dataObject[k] = JSON.stringify(dataObject[k]);
      }
      apiURL += `&${k}=${encodeURIComponent(dataObject[k])}`;
    }
  }

  return apiURL;
};

const cacheServerURL = (serverURL, ttl) => {
  if (typeof ttl !== 'number') {
    ttl = 3600;
  }
  Cache.set('APIServerURL', serverURL, ttl * 1000);
};

// handle AV._request Error
const handleError = (AV, res) => {
  const promise = new Promise();
  /**
    When API request need to redirect to the right location,
    can't use browser redirect by http status 307, as the reason of CORS,
    so API server response http status 410 and the param "location" for this case.
  */
  if (res.statusCode === 410) {
    cacheServerURL(res.response.api_server, res.response.ttl);
    promise.resolve(res.response.location);
  } else {
    let errorJSON = { code: -1, error: res.responseText };
    if (res.response && res.response.code) {
      errorJSON = res.response;
    } else if (res.responseText) {
      try {
        errorJSON = JSON.parse(res.responseText);
      } catch (e) {
        // If we fail to parse the error text, that's okay.
      }
    }

    // Transform the error into an instance of AV.Error by trying to parse
    // the error string as JSON.
    const error = new AV.Error(errorJSON.code, errorJSON.error);
    promise.reject(error);
  }
  return promise;
};

const setRegionServer = (AV, region = 'cn') => {
  // 服务器请求的节点 host
  const API_HOST = {
    cn: 'https://api.leancloud.cn',
    us: 'https://us-api.leancloud.cn',
  };

  const AVConfig = AV._config;
  AVConfig.region = region;
  // 如果用户在 init 之前设置了 APIServerURL，则跳过请求 router
  if (AVConfig.APIServerURL) {
    return;
  }
  AVConfig.APIServerURL = API_HOST[region];
  if (region === 'cn') {
    Cache.get('APIServerURL').then(cachedServerURL => {
      if (cachedServerURL) {
        return cachedServerURL;
      } else {
        return ajax('get', `https://app-router.leancloud.cn/1/route?appId=${AV.applicationId}`)
          .then(servers => {
            if (servers.api_server) {
              cacheServerURL(servers.api_server, servers.ttl);
              return servers.api_server;
            }
          });
      }
    }).then(serverURL => {
      // 如果用户在 init 之后设置了 APIServerURL，保持用户设置
      if (AVConfig.APIServerURL === API_HOST[region]) {
        AVConfig.APIServerURL = `https://${serverURL}`;
      }
    });
  }
};

const init = (AV) => {
  /**
   * route is classes, users, login, etc.
   * objectId is null if there is no associated objectId.
   * method is the http method for the REST API.
   * dataObject is the payload as an object, or null if there is none.
   * @ignore
   */
  AV._request = (route, className, objectId, method, dataObject = {}, sessionToken) => {
    if (!AV.applicationId) {
      throw new Error('You must specify your applicationId using AV.init()');
    }

    if (!AV.applicationKey && !AV.masterKey) {
      throw new Error('You must specify a AppKey using AV.init()');
    }

    checkRouter(route);
    const apiURL = createApiUrl(AV, route, className, objectId, method, dataObject);

    return setHeaders(AV, sessionToken).then(
      headers => ajax(method, apiURL, dataObject, headers)
        .then(
          null,
          res => handleError(AV, res)
            .then(location => ajax(method, location, dataObject, headers))
        )
    );
  };
};

module.exports = {
  init,
  ajax,
  setRegionServer,
};

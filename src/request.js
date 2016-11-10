const request = require('superagent');
const debug = require('debug')('leancloud:request');
const md5 = require('md5');
const Promise = require('./promise');
const Cache = require('./cache');
const AVError = require('./error');
const AV = require('./av');
const _ = require('underscore');
const {
  getSessionToken,
} = require('./utils');

let getServerURLPromise;

// 服务器请求的节点 host
const API_HOST = {
  cn: 'https://api.leancloud.cn',
  us: 'https://us-api.leancloud.cn',
};

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

let requestsCount = 0;

const ajax = (method, resourceUrl, data, headers = {}, onprogress) => {
  const count = requestsCount++;

  debug(`request(${count})`, method, resourceUrl, data, headers);

  return new Promise((resolve, reject) => {
    const req = request(method, resourceUrl)
      .set(headers)
      .send(data);
    if (onprogress) {
      req.on('progress', onprogress);
    }
    req.end((err, res) => {
      if (res) {
        debug(`response(${count})`, res.status, res.body || res.text, res.header);
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

const setAppId = (headers, signKey) => {
  if (signKey) {
    headers['X-LC-Sign'] = sign(AV.applicationKey);
  } else {
    headers['X-LC-Key'] = AV.applicationKey;
  }
};

const setHeaders = (authOptions = {}, signKey) => {
  const headers = {
    'X-LC-Id': AV.applicationId,
    'Content-Type': 'application/json;charset=UTF-8',
  };
  let useMasterKey = false;
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
        headers['X-LC-Key'] = `${AV.masterKey},master`;
      }
    } else {
      console.warn('masterKey is not set, fall back to use appKey');
      setAppId(headers, signKey);
    }
  } else {
    setAppId(headers, signKey);
  }
  if (AV._config.applicationProduction !== null) {
    headers['X-LC-Prod'] = String(AV._config.applicationProduction);
  }
  headers[AV._config.isNode ? 'User-Agent' : 'X-LC-UA'] = AV._config.userAgent;

  return Promise.resolve().then(() => {
    // Pass the session token
    const sessionToken = getSessionToken(authOptions);
    if (sessionToken) {
      headers['X-LC-Session'] = sessionToken;
    } else if (!AV._config.disableCurrentUser) {
      return AV.User.currentAsync().then((currentUser) => {
        if (currentUser && currentUser._sessionToken) {
          headers['X-LC-Session'] = currentUser._sessionToken;
        }
        return headers;
      });
    }
    return headers;
  });
};

const createApiUrl = (route, className, objectId, method, dataObject) => {
  // TODO: 兼容 AV.serverURL 旧方式设置 API Host，后续去掉
  if (AV.serverURL) {
    AV._config.APIServerURL = AV.serverURL;
    console.warn('Please use AV._config.APIServerURL to replace AV.serverURL, and it is an internal interface.');
  }

  let apiURL = AV._config.APIServerURL || API_HOST.cn;

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
  return Cache.setAsync('APIServerURL', serverURL, ttl * 1000);
};

// handle AV._request Error
const handleError = (error) => {
  return new Promise((resolve, reject) => {
    /**
      When API request need to redirect to the right location,
      can't use browser redirect by http status 307, as the reason of CORS,
      so API server response http status 410 and the param "location" for this case.
    */
    if (error.statusCode === 410) {
      cacheServerURL(error.response.api_server, error.response.ttl).then(() => {
        resolve(error.response.location);
      }).catch(reject);
    } else {
      let errorJSON = {
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

const setServerUrl = (serverURL) => {
  AV._config.APIServerURL = `https://${serverURL}`;

  // 根据新 URL 重新设置区域
  const newRegion = _.findKey(API_HOST, item => item === AV._config.APIServerURL);
  if (newRegion) {
    AV._config.region = newRegion;
  }
};

const refreshServerUrlByRouter = () => {
  const url = `https://app-router.leancloud.cn/1/route?appId=${AV.applicationId}`;
  return ajax('get', url).then(servers => {
    if (servers.api_server) {
      setServerUrl(servers.api_server);
      return cacheServerURL(servers.api_server, servers.ttl);
    }
  }, error => {
    // bypass all non-4XX errors
    if (error.statusCode >= 400 && error.statusCode < 500) {
      throw error;
    }
  });
};

const setServerUrlByRegion = (region = 'cn') => {
  getServerURLPromise = new Promise((resolve, reject) => {
    // 如果用户在 init 之前设置了 APIServerURL，则跳过请求 router
    if (AV._config.APIServerURL) {
      resolve();
      return;
    }
    // if not china server region, do not use router
    if (region === 'cn') {
      return Cache.getAsync('APIServerURL').then((serverURL) => {
        if (serverURL) {
          setServerUrl(serverURL);
        } else {
          return refreshServerUrlByRouter();
        }
      }).then(() => {
        resolve();
      }).catch((error) => {
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
const AVRequest = (route, className, objectId, method, dataObject = {}, authOptions) => {
  if (!AV.applicationId) {
    throw new Error('You must specify your applicationId using AV.init()');
  }

  if (!AV.applicationKey && !AV.masterKey) {
    throw new Error('You must specify a AppKey using AV.init()');
  }

  checkRouter(route);

  if (!getServerURLPromise) {
    return Promise.reject(new Error('Not initialized'));
  }
  return getServerURLPromise.then(() => {
    const apiURL = createApiUrl(route, className, objectId, method, dataObject);
    return setHeaders(authOptions).then(
      headers => ajax(method, apiURL, dataObject, headers)
        .then(
          null,
          res => handleError(res)
            .then(location => ajax(method, location, dataObject, headers))
        )
    );
  });
};

module.exports = {
  ajax,
  request: AVRequest,
  setServerUrlByRegion,
};

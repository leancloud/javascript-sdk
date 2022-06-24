const _ = require('underscore');
const md5 = require('md5');
const { extend } = require('underscore');
const AV = require('./av');
const AVError = require('./error');
const { getSessionToken } = require('./utils');
const ajax = require('./utils/ajax');

// 计算 X-LC-Sign 的签名方法
const sign = (key, isMasterKey) => {
  const now = new Date().getTime();
  const signature = md5(now + key);
  if (isMasterKey) {
    return `${signature},${now},master`;
  }
  return `${signature},${now}`;
};

const setAppKey = (headers, signKey) => {
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
  } else if (typeof AV._config.useMasterKey === 'boolean') {
    useMasterKey = AV._config.useMasterKey;
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
      setAppKey(headers, signKey);
    }
  } else {
    setAppKey(headers, signKey);
  }
  if (AV.hookKey) {
    headers['X-LC-Hook-Key'] = AV.hookKey;
  }
  if (AV._config.production !== null) {
    headers['X-LC-Prod'] = String(AV._config.production);
  }
  headers[process.env.PLATFORM === 'NODE_JS' ? 'User-Agent' : 'X-LC-UA'] =
    AV._sharedConfig.userAgent;

  return Promise.resolve().then(() => {
    // Pass the session token
    const sessionToken = getSessionToken(authOptions);
    if (sessionToken) {
      headers['X-LC-Session'] = sessionToken;
    } else if (!AV._config.disableCurrentUser) {
      return AV.User.currentAsync().then(currentUser => {
        if (currentUser && currentUser._sessionToken) {
          headers['X-LC-Session'] = currentUser._sessionToken;
        }
        return headers;
      });
    }
    return headers;
  });
};

const createApiUrl = ({
  service = 'api',
  version = '1.1',
  path,
  // query, // don't care
  // method, // don't care
  // data, // don't care
}) => {
  let apiURL = AV._config.serverURLs[service];

  if (!apiURL) throw new Error(`undefined server URL for ${service}`);

  if (apiURL.charAt(apiURL.length - 1) !== '/') {
    apiURL += '/';
  }
  apiURL += version;
  if (path) {
    apiURL += path;
  }

  return apiURL;
};

/**
 * Low level REST API client. Call REST endpoints with authorization headers.
 * @function AV.request
 * @since 3.0.0
 * @param {Object} options
 * @param {String} options.method HTTP method
 * @param {String} options.path endpoint path, e.g. `/classes/Test/55759577e4b029ae6015ac20`
 * @param {Object} [options.query] query string dict
 * @param {Object} [options.data] HTTP body
 * @param {AuthOptions} [options.authOptions]
 * @param {String} [options.service = 'api']
 * @param {String} [options.version = '1.1']
 */
const request = ({
  service,
  version,
  method,
  path,
  query,
  data,
  authOptions,
  signKey = true,
}) => {
  if (!(AV.applicationId && (AV.applicationKey || AV.masterKey))) {
    throw new Error('Not initialized');
  }
  if (AV._appRouter) {
    AV._appRouter.refresh();
  }
  const { requestTimeout: timeout } = AV._config;
  const url = createApiUrl({ service, path, version });
  return setHeaders(authOptions, signKey).then(headers =>
    ajax({ method, url, query, data, headers, timeout }).catch(error => {
      let errorJSON = {
        code: error.code || -1,
        error: error.message || error.responseText,
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
      errorJSON.rawMessage = errorJSON.rawMessage || errorJSON.error;
      if (!AV._sharedConfig.keepErrorRawMessage) {
        errorJSON.error += ` [${error.statusCode || 'N/A'} ${method} ${url}]`;
      }
      // Transform the error into an instance of AVError by trying to parse
      // the error string as JSON.
      const err = new AVError(errorJSON.code, errorJSON.error);
      delete errorJSON.error;
      throw _.extend(err, errorJSON);
    })
  );
};

// lagecy request
const _request = (
  route,
  className,
  objectId,
  method,
  data,
  authOptions,
  query
) => {
  let path = '';
  if (route) path += `/${route}`;
  if (className) path += `/${className}`;
  if (objectId) path += `/${objectId}`;
  // for migeration
  if (data && data._fetchWhenSave)
    throw new Error('_fetchWhenSave should be in the query');
  if (data && data._where) throw new Error('_where should be in the query');
  if (method && method.toLowerCase() === 'get') {
    query = extend({}, query, data);
    data = null;
  }
  return request({
    method,
    path,
    query,
    data,
    authOptions,
  });
};

AV.request = request;

module.exports = {
  _request,
  request,
};

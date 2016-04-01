/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

'use strict';

const AVPromise = require('../promise');
const md5 = require('md5');

// 计算 X-LC-Sign 的签名方法
const sign = (key, isMasterKey) => {
  const now = new Date().getTime();
  const signature = md5(now + key);
  if (isMasterKey) {
    return signature + ',' + now + ',master';
  } else {
    return signature + ',' + now;
  }
};

const ajax = (method, url, data, success, error) => {
  const AV = global.AV;

  const promise = new AVPromise();
  const options = {
    success: success,
    error: error
  };

  const appId = AV.applicationId;
  const appKey = AV.applicationKey;
  const masterKey = AV.masterKey;

  let handled = false;
  const xhr = new global.XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (handled) {
        return;
      }
      handled = true;

      if (xhr.status >= 200 && xhr.status < 300) {
        let response;
        try {
          response = JSON.parse(xhr.responseText);
        } catch (e) {
          e.statusCode = xhr.status;
          e.responseText = xhr.responseText;
          promise.reject(e);
        }
        if (response) {
          promise.resolve(response, xhr.status, xhr);
        }
      } else {
        promise.reject(xhr);
      }
    }
  };

  if (method.toLowerCase() === 'get') {
    let i = 0;
    for (let k in data) {
      if (i === 0) {
        url = url + '?';
      } else {
        url = url + '&';
      }
      url = url + k + '=' + encodeURIComponent(JSON.stringify(data[k]));
      i ++;
    }
  }

  let headers = {
    'X-LC-Id': appId,
    'X-LC-UA': 'LC-Web-' + AV.version,
    'Content-Type': 'application/json;charset=UTF-8'
  };

  // 清理原来多余的数据（如果不清理，会污染数据表）
  if (data) {
    delete data._ApplicationId;
    delete data._ApplicationKey;
    delete data._ApplicationProduction;
    delete data._MasterKey;
    delete data._ClientVersion;
    delete data._InstallationId;

    if (data._SessionToken) {
      headers['X-LC-Session'] = data._SessionToken;
      delete data._SessionToken;
    }
  }

  if (masterKey && AV._useMasterKey) {
    headers['X-LC-Sign'] = sign(masterKey, true);
  } else {
    headers['X-LC-Sign'] = sign(appKey);
  }

  xhr.open(method, url, true);

  for (let name in headers) {
    xhr.setRequestHeader(name, headers[name]);
  }

  xhr.send(JSON.stringify(data));
  return promise._thenRunCallbacks(options);
};

module.exports = ajax;

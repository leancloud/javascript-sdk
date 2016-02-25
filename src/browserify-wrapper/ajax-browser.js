'use strict';

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

  const promise = new AV.Promise();
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
  xhr.open(method, url, true);
  xhr.setRequestHeader('X-LC-Id', appId);
  // 浏览器端不支持传入 masterKey 做 sign
  const signature = sign(appKey);
  xhr.setRequestHeader('X-LC-Sign', signature);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(data);
  return promise._thenRunCallbacks(options);
};

module.exports = ajax;

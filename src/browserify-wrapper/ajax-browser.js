/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

'use strict';

const AVPromise = require('../promise');
const AVUtils = require('../utils');

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
  xhr.open(method, url, true);
  xhr.setRequestHeader('X-LC-Id', appId);
  // 浏览器端不支持传入 masterKey 做 sign
  const signature = AVUtils.sign(appKey);
  xhr.setRequestHeader('X-LC-Sign', signature);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.send(data);
  return promise._thenRunCallbacks(options);
};

module.exports = ajax;

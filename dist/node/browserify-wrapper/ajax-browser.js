/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

'use strict';

var AVPromise = require('../promise');
var md5 = require('md5');

// 计算 X-LC-Sign 的签名方法
var sign = function sign(key, isMasterKey) {
  var now = new Date().getTime();
  var signature = md5(now + key);
  if (isMasterKey) {
    return signature + ',' + now + ',master';
  } else {
    return signature + ',' + now;
  }
};

var ajax = function ajax(method, url, data, success, error) {
  var AV = global.AV;

  var promise = new AVPromise();
  var options = {
    success: success,
    error: error
  };

  var appId = AV.applicationId;
  var appKey = AV.applicationKey;
  var masterKey = AV.masterKey;

  var handled = false;
  var xhr = new global.XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (handled) {
        return;
      }
      handled = true;

      if (xhr.status >= 200 && xhr.status < 300) {
        var response = undefined;
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
    var i = 0;
    for (var k in data) {
      if (i === 0) {
        url = url + '?';
      } else {
        url = url + '&';
      }
      url = url + k + '=' + encodeURIComponent(JSON.stringify(data[k]));
      i++;
    }
  }

  var headers = {
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

  for (var name in headers) {
    xhr.setRequestHeader(name, headers[name]);
  }

  xhr.send(JSON.stringify(data));
  return promise._thenRunCallbacks(options);
};

module.exports = ajax;
/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

'use strict';

const AVPromise = require('../promise');
const debug = require('debug')('ajax');

const ajax = (method, url, data, headers = {}) => {
  debug(method, url, data, headers);

  const promise = new AVPromise();

  let handled = false;
  const xhr = new global.XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (handled) {
        return;
      }
      handled = true;

      debug(xhr.status, xhr.responseText);

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

  for (let name in headers) {
    xhr.setRequestHeader(name, headers[name]);
  }

  xhr.send(JSON.stringify(data));
  return promise;
};

module.exports = ajax;

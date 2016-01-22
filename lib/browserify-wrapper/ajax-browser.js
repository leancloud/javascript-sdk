var XMLHttpRequest = require('./xmlhttprequest').XMLHttpRequest;
var Promise = require('../promise');

module.exports = function _ajax(method, url, data, success, error) {
  var options = {
    success: success,
    error: error
  };

  if (useXDomainRequest()) {
    return ajaxIE8(method, url, data)._thenRunCallbacks(options);
  }

  var promise = new Promise();
  var handled = false;

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (handled) {
        return;
      }
      handled = true;

      if (xhr.status >= 200 && xhr.status < 300) {
        var response;
        try {
          response = JSON.parse(xhr.responseText);
        } catch (e) {
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
  xhr.setRequestHeader("Content-Type", "text/plain");  // avoid pre-flight.
  xhr.send(data);
  return promise._thenRunCallbacks(options);
};

function useXDomainRequest() {
  if (typeof(XDomainRequest) !== "undefined") {
    // We're in IE 8+.
    if ('withCredentials' in new XMLHttpRequest()) {
      // We're in IE 10+.
      return false;
    }
    return true;
  }
  return false;
}

function ajaxIE8(method, url, data) {
  var promise = new Promise();
  var xdr = new XDomainRequest();
  xdr.onload = function() {
    var response;
    try {
      response = JSON.parse(xdr.responseText);
    } catch (e) {
      promise.reject(e);
    }
    if (response) {
      promise.resolve(response);
    }
  };
  xdr.onerror = xdr.ontimeout = function() {
    // Let's fake a real error message.
    var fakeResponse = {
      responseText: JSON.stringify({
        code: AV.Error.X_DOMAIN_REQUEST,
        error: "IE's XDomainRequest does not supply error info."
      })
    };
    promise.reject(xdr);
  };
  xdr.onprogress = function() {};
  xdr.open(method, url);
  xdr.send(data);
  return promise;
}

const _ = require('underscore');
const { timeout } = require('promise-timeout');
const debug = require('debug');
const debugRequest = debug('leancloud:request');
const debugRequestError = debug('leancloud:request:error');
const { getAdapter } = require('../adapter');

let requestsCount = 0;

const ajax = ({
  method,
  url,
  query,
  data,
  headers = {},
  timeout: time,
  onprogress,
}) => {
  if (query) {
    const queryString = Object.keys(query)
      .map(key => {
        const value = query[key];
        if (value === undefined) return undefined;
        const v = typeof value === 'object' ? JSON.stringify(value) : value;
        return `${encodeURIComponent(key)}=${encodeURIComponent(v)}`;
      })
      .filter(qs => qs)
      .join('&');
    url = `${url}?${queryString}`;
  }

  const count = requestsCount++;
  debugRequest(
    'request(%d) %s %s %o %o %o',
    count,
    method,
    url,
    query,
    data,
    headers
  );

  const request = getAdapter('request');
  const promise = request(url, { method, headers, data, onprogress })
    .then(response => {
      debugRequest(
        'response(%d) %d %O %o',
        count,
        response.status,
        response.data || response.text,
        response.header
      );
      if (response.ok === false) {
        const error = new Error();
        error.response = response;
        throw error;
      }
      return response.data;
    })
    .catch(error => {
      if (error.response) {
        if (!debug.enabled('leancloud:request')) {
          debugRequestError(
            'request(%d) %s %s %o %o %o',
            count,
            method,
            url,
            query,
            data,
            headers
          );
        }
        debugRequestError(
          'response(%d) %d %O %o',
          count,
          error.response.status,
          error.response.data || error.response.text,
          error.response.header
        );
        error.statusCode = error.response.status;
        error.responseText = error.response.text;
        error.response = error.response.data;
      }
      throw error;
    });
  return time ? timeout(promise, time) : promise;
};

module.exports = ajax;

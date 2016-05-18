/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

const request = require('superagent');
const debug = require('debug')('ajax');
const Promise = require('./promise');

module.exports = function _ajax(method, resourceUrl, data, headers = {}, onprogress) {
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

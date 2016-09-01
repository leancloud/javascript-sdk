/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

'use strict';

var request = require('superagent');
var Promise = require('../promise');
var debug = require('debug')('qiniu');

module.exports = function upload(uploadInfo, data, file) {
  var saveOptions = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

  file.attributes.url = uploadInfo.url;
  file._bucket = uploadInfo.bucket;
  file.id = uploadInfo.objectId;
  //Get the uptoken to upload files to qiniu.
  var uptoken = uploadInfo.token;

  var promise = new Promise();

  var req = request('POST', 'https://up.qbox.me').field('file', data).field('name', file.attributes.name).field('key', file._qiniu_key).field('token', uptoken);
  if (saveOptions.onprogress) {
    req.on('progress', saveOptions.onprogress);
  }
  req.end(function (err, res) {
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
    promise.resolve(file);
  });

  return promise;
};
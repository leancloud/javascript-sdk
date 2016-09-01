/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
 **/

'use strict';

var request = require('superagent');
var debug = require('debug')('cos');
var Promise = require('../promise');

module.exports = function upload(uploadInfo, data, file) {
  var saveOptions = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

  file.attributes.url = uploadInfo.url;
  file._bucket = uploadInfo.bucket;
  file.id = uploadInfo.objectId;
  var uploadUrl = uploadInfo.upload_url + "?sign=" + encodeURIComponent(uploadInfo.token);

  var promise = new Promise();

  var req = request('POST', uploadUrl).field('fileContent', data).field('op', 'upload');
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
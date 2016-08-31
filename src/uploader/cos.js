/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
 **/

'use strict';

const request = require('superagent');
const debug = require('debug')('cos');
const Promise = require('../promise');

module.exports = function upload(uploadInfo, data, file, saveOptions = {}) {
  file.attributes.url = uploadInfo.url;
  file._bucket = uploadInfo.bucket;
  file.id = uploadInfo.objectId;
  const uploadUrl = uploadInfo.upload_url + "?sign=" + encodeURIComponent(uploadInfo.token);

  const promise = new Promise();

  const req = request('POST', uploadUrl)
    .field('fileContent', data)
    .field('op', 'upload');
  if (saveOptions.onprogress) {
    req.on('progress', saveOptions.onprogress);
  }
  req.end((err, res) => {
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

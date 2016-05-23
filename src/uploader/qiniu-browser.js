/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

'use strict';

const request = require('superagent');
const Promise = require('../promise');
const debug = require('debug')('qiniu');

module.exports = function upload(uploadInfo, data, file, saveOptions = {}) {
  file.attributes.url = uploadInfo.url;
  file._bucket = uploadInfo.bucket;
  file.id = uploadInfo.objectId;
  //Get the uptoken to upload files to qiniu.
  const uptoken = uploadInfo.token;

  const promise = new Promise();

  const req = request('POST', 'https://up.qbox.me')
    .field('file', data)
    .field('name', file.attributes.name)
    .field('key', file._qiniu_key)
    .field('token', uptoken)
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
      promise.resolve(file);
    });
  if (saveOptions.onprogress) {
    req.on('progress', saveOptions.onprogress);
  }
  return promise;
};

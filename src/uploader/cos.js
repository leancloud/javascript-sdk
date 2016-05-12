'use strict';
const FormData = require('form-data');

const ajax = require('../ajax.js');
const Promise = require('../promise');
const debug = require('debug')('cos');

module.exports =function upload(uploadInfo, data, file) {
  file.attributes.url = uploadInfo.url;
  file._bucket = uploadInfo.bucket;
  file.id = uploadInfo.objectId;
  const uploadUrl = uploadInfo.upload_url;
  const body = new Buffer(data, 'base64');
  debug(uploadUrl, data);
  const formData = new FormData();
  formData.append('fileContent', body);
  formData.append('op', 'upload');

  const promise = new Promise();

  const request = formData.submit(uploadUrl, function(err, res) {
    debug(err, res.statusCode);
    if (err) {
      promise.reject(err);
    } else {
      promise.resolve(file);
    }
  });
  request.setHeader('Authorization', uploadInfo.token);
  return promise;
};

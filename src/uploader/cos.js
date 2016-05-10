'use strict';
var FormData = require('form-data');

var ajax = require('../browserify-wrapper/ajax.js');
var Promise = require('../promise');
var debug = require('debug')('cos');

module.exports =function upload(uploadInfo, data, file) {
  file.attributes.url = uploadInfo.url;
  file._bucket = uploadInfo.bucket;
  file.id = uploadInfo.objectId;
  var uploadUrl = uploadInfo.upload_url;
  debug(uploadUrl, data);
  var formData = new FormData();
  formData.append('fileContent', data);
  formData.append('op', 'upload');

  var promise = new Promise();

  var request = formData.submit(uploadUrl, function(err, res) {
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

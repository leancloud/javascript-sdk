'use strict';

// Use qiniu sdk to upload files to qiniu.
var qiniu = require('qiniu');
var Promise = require('../promise');

module.exports = function upload(uploadInfo, data, file) {
  file.attributes.url = uploadInfo.url;
  file._bucket = uploadInfo.bucket;
  file.id = uploadInfo.objectId;
  // Get the uptoken to upload files to qiniu.
  var uptoken = uploadInfo.token;
  return new Promise(function (resolve, reject) {
    var extra = new qiniu.io.PutExtra();
    if (file.attributes.metaData.mime_type) {
      extra.mimeType = file.attributes.metaData.mime_type;
    }
    var body = new Buffer(data, 'base64');
    qiniu.io.put(uptoken, file._qiniu_key, body, extra, function (err) {
      delete file._qiniu_key;
      delete file.attributes.base64;
      if (!err) {
        resolve(file);
      } else {
        reject(err);
      }
    });
  });
};
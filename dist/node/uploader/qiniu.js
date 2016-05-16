/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
 **/

'use strict';

//Use qiniu sdk to upload files to qiniu.

var qiniu = require('qiniu');
var Promise = require('../promise');

module.exports = function upload(uploadInfo, data, file) {
  file.attributes.url = uploadInfo.url;
  file._bucket = uploadInfo.bucket;
  file.id = uploadInfo.objectId;
  //Get the uptoken to upload files to qiniu.
  var uptoken = uploadInfo.token;
  var promise = new Promise();
  var extra = new qiniu.io.PutExtra();
  if (file.attributes.metaData.mime_type) extra.mimeType = file.attributes.metaData.mime_type;
  var body = new Buffer(data, 'base64');
  qiniu.io.put(uptoken, file._qiniu_key, body, extra, function (err, ret) {
    delete file._qiniu_key;
    delete file.attributes.base64;
    if (!err) {
      promise.resolve(file);
    } else {
      promise.reject(err);
    }
  });
  return promise;
};
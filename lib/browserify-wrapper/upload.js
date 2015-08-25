'use strict';

//Use qiniu sdk to upload files to qiniu.
var qiniu = require('qiniu');
var Promise = require('../promise');

module.exports =function upload(file) {
  file._previousSave = file._source.then(function(base64, type) {
    file._base64 = base64;
    return file._qiniuToken(type);
  }).then(function(response) {
    file._url = response.url;
    file._bucket = response.bucket;
    file.id = response.objectId;
    //Get the uptoken to upload files to qiniu.
    var uptoken = response.token;
    var promise = new Promise();
    var extra = new qiniu.io.PutExtra();
    if(file._metaData.mime_type)
      extra.mimeType = file._metaData.mime_type;
    var body = new Buffer(file._base64, 'base64');
    qiniu.io.put(uptoken, file._qiniu_key, body, extra, function(err, ret) {
      delete file._qiniu_key;
      delete file._base64;
      if(!err) {
         promise.resolve(file);
      } else {
         promise.reject(err);
         //destroy this file object when upload fails.
         file.destroy();
      }
    });
    return promise;
  });
};

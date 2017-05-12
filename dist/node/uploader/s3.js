'use strict';

var request = require('superagent');
var AVPromise = require('../promise');

module.exports = function upload(uploadInfo, data, file) {
  var saveOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  file.attributes.url = uploadInfo.url;
  file._bucket = uploadInfo.bucket;
  file.id = uploadInfo.objectId;
  return new Promise(function (resolve, reject) {
    // 海外节点，针对 S3 才会返回 upload_url
    var req = request('PUT', uploadInfo.upload_url).set('Content-Type', file.get('mime_type')).send(data);
    if (saveOptions.onprogress) {
      req.on('progress', saveOptions.onprogress);
    }
    req.end(function (err, res) {
      if (err) {
        if (res) {
          err.statusCode = res.status;
          err.responseText = res.text;
          err.response = res.body;
        }
        return reject(err);
      }
      resolve(file);
    });
  });
};
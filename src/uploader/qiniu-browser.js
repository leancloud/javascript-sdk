const request = require('superagent');
const Promise = require('../promise');
const debug = require('debug')('qiniu');

module.exports = function upload(uploadInfo, data, file, saveOptions = {}) {
  file.attributes.url = uploadInfo.url;
  file._bucket = uploadInfo.bucket;
  file.id = uploadInfo.objectId;
  // Get the uptoken to upload files to qiniu.
  const uptoken = uploadInfo.token;
  return new Promise((resolve, reject) => {
    const req = request('POST', 'https://up.qbox.me')
      .field('file', data)
      .field('name', file.attributes.name)
      .field('key', file._qiniu_key)
      .field('token', uptoken);
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
        return reject(err);
      }
      resolve(file);
    });
  });
};

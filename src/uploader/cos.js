const request = require('superagent');
const debug = require('debug')('cos');
const Promise = require('../promise');

module.exports = function upload(uploadInfo, data, file, saveOptions = {}) {
  file.attributes.url = uploadInfo.url;
  file._bucket = uploadInfo.bucket;
  file.id = uploadInfo.objectId;
  const uploadUrl = uploadInfo.upload_url + "?sign=" + encodeURIComponent(uploadInfo.token);

  return new Promise((resolve, reject) => {
    const req = request('POST', uploadUrl)
      .set(file._uploadHeaders)
      .attach('fileContent', data, file.attributes.name)
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
        return reject(err);
      }
      resolve(file);
    });
  });
};

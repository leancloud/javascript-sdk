/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
 **/

const request = require('superagent');
const Promise = require('../promise');

module.exports = function upload(uploadUrl, data, file, saveOptions = {}) {
  const promise = new Promise();
  const req = request('PUT', uploadUrl)
    .set('Content-Type', file.attributes.metaData.mime_type)
    .send(data)
    .end((err, res) => {
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

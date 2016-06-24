/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
 **/

const request = require('superagent');
const AVPromise = require('../promise');

module.exports = function upload(uploadUrl, data, file, saveOptions = {}) {
  // 海外节点，针对 S3 才会返回 upload_url
  file.attributes.url = uploadInfo.url;
  const promise = new AVPromise();
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

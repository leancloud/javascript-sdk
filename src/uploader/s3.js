const request = require('superagent');
const Promise = require('../promise');

const handleError = (error, res) => {
  if (res) {
    error.statusCode = res.status;
    error.responseText = res.text;
    error.response = res.body;
  }
  return error;
};

module.exports = function upload(uploadInfo, data, file, saveOptions = {}) {
  file.attributes.url = uploadInfo.url;
  file._bucket = uploadInfo.bucket;
  file.id = uploadInfo.objectId;
  return new Promise((resolve, reject) => {
    // 海外节点，针对 S3 才会返回 upload_url
    const req = request('PUT', uploadInfo.upload_url)
      .set('Content-Type', file.get('mime_type'))
    if (saveOptions.onprogress) {
      req.on('progress', saveOptions.onprogress);
    }
    req.on('response', (res) => {
      if (res.ok) return resolve(file);
      reject(handleError(res.error, res));
    });
    req.on('error', (err, res) => reject(handleError(err, res)));
    if (!process.env.CLIENT_PLATFORM) {
      if (data instanceof require('stream')) {
        // data.pipe(req);
        throw new TypeError('Saving an AV.File from a Stream to S3 is not yet supported');
      }
    }
    req.send(data).end();
  });
};

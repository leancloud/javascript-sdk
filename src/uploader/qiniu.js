// Use qiniu sdk to upload files to qiniu.
const qiniu = require('qiniu');
const Promise = require('../promise');

module.exports = function upload(uploadInfo, data, file) {
  file.attributes.url = uploadInfo.url;
  file._bucket = uploadInfo.bucket;
  file.id = uploadInfo.objectId;
  // Get the uptoken to upload files to qiniu.
  const uptoken = uploadInfo.token;
  return new Promise((resolve, reject) => {
    const extra = new qiniu.io.PutExtra();
    if (file.attributes.metaData.mime_type) {
      extra.mimeType = file.attributes.metaData.mime_type;
    }
    const body = new Buffer(data, 'base64');
    qiniu.io.put(uptoken, file._qiniu_key, body, extra, (err) => {
      delete file._qiniu_key;
      if (!err) {
        resolve(file);
      } else {
        reject(err);
      }
    });
  });
};

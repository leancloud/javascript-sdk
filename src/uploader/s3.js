const _ = require('underscore');
const ajax = require('../utils/ajax');

module.exports = function upload(uploadInfo, data, file, saveOptions = {}) {
  return ajax({
    url: uploadInfo.upload_url,
    method: 'PUT',
    data,
    headers: _.extend(
      {
        'Content-Type': file.get('mime_type'),
        'Cache-Control': 'public, max-age=31536000',
      },
      file._uploadHeaders
    ),
    onprogress: saveOptions.onprogress,
  }).then(() => {
    file.attributes.url = uploadInfo.url;
    file._bucket = uploadInfo.bucket;
    file.id = uploadInfo.objectId;
    return file;
  });
};

const _ = require('underscore');
const ajax = require('../utils/ajax');

module.exports = function upload(uploadInfo, data, file, saveOptions = {}) {
  /* NODE-ONLY:start */
  if (data instanceof require('stream')) {
    let contentLength;
    Object.entries(file._uploadHeaders).forEach(([name, value]) => {
      if (name.toLowerCase() === 'content-length') {
        contentLength = value;
      }
    });
    if (!contentLength) {
      throw new Error(
        'Saving an AV.File from a Stream to S3 need "Content-Length" header to be set'
      );
    }
  }
  /* NODE-ONLY:end */

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

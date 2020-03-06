const { ajax } = require('../utils');

module.exports = function upload(uploadInfo, data, file, saveOptions = {}) {
  file.attributes.url = uploadInfo.url;
  file._bucket = uploadInfo.bucket;
  file.id = uploadInfo.objectId;

  /* NODE-ONLY:start */
  if (data instanceof require('stream')) {
    // data.pipe(req);
    throw new TypeError(
      'Saving an AV.File from a Stream to S3 is not yet supported'
    );
  }
  /* NODE-ONLY:end */

  return ajax({
    url: uploadInfo.upload_url,
    method: 'PUT',
    data,
    headers: Object.assign(
      {
        'Content-Type': file.get('mime_type'),
        'Cache-Control': 'public, max-age=31536000',
      },
      file._uploadHeaders
    ),
    onprogress: saveOptions.onprogress,
  }).then(() => file);
};

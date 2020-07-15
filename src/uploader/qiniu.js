const { getAdapter } = require('../adapter');
const debug = require('debug')('leancloud:qiniu');

module.exports = function(uploadInfo, data, file, saveOptions = {}) {
  file.attributes.url = uploadInfo.url;
  file._bucket = uploadInfo.bucket;
  file.id = uploadInfo.objectId;
  // Get the uptoken to upload files to qiniu.
  const uptoken = uploadInfo.token;
  const url = uploadInfo.upload_url || 'https://upload.qiniup.com';
  const fileFormData = {
    field: 'file',
    data,
    name: file.attributes.name,
  };
  const options = {
    headers: file._uploadHeaders,
    data: {
      name: file.attributes.name,
      key: uploadInfo.key || file._qiniu_key,
      token: uptoken,
    },
    onprogress: saveOptions.onprogress,
  };
  debug('url: %s, file: %o, options: %o', url, fileFormData, options);
  const upload = getAdapter('upload');
  return upload(url, fileFormData, options).then(
    response => {
      debug(response.status, response.data);
      if (response.ok === false) {
        let message = response.status;
        if (response.data) {
          if (response.data.error) {
            message = response.data.error;
          } else {
            message = JSON.stringify(response.data);
          }
        }
        const error = new Error(message);
        error.response = response;
        throw error;
      }
      return file;
    },
    error => {
      const { response } = error;
      if (response) {
        debug(response.status, response.data);
        error.statusCode = response.status;
        error.response = response.data;
      }
      throw error;
    }
  );
};

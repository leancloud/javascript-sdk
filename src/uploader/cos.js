const { getAdapter } = require('../adapter');
const debug = require('debug')('cos');

module.exports = function(uploadInfo, data, file, saveOptions = {}) {
  const url =
    uploadInfo.upload_url + '?sign=' + encodeURIComponent(uploadInfo.token);
  const fileFormData = {
    field: 'fileContent',
    data,
    name: file.attributes.name,
  };
  const options = {
    headers: file._uploadHeaders,
    data: {
      op: 'upload',
    },
    onprogress: saveOptions.onprogress,
  };
  debug('url: %s, file: %o, options: %o', url, fileFormData, options);
  const upload = getAdapter('upload');
  return upload(url, fileFormData, options).then(
    response => {
      debug(response.status, response.data);
      if (response.ok === false) {
        const error = new Error(response.status);
        error.response = response;
        throw error;
      }
      file.attributes.url = uploadInfo.url;
      file._bucket = uploadInfo.bucket;
      file.id = uploadInfo.objectId;
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

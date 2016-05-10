/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

'use strict';

var ajax = require('../browserify-wrapper/ajax.js');

module.exports = function upload(uploadInfo, data, file, saveOptions) {
    file.attributes.url = uploadInfo.url;
    file._bucket = uploadInfo.bucket;
    file.id = uploadInfo.objectId;
    //Get the uptoken to upload files to qiniu.
    var uptoken = uploadInfo.token;
    var formData = new FormData();
    formData.append('file', data);
    formData.append('name', file.attributes.name);
    formData.append('key', file._qiniu_key);
    formData.append('token', uptoken);

    return ajax('POST', 'https://up.qbox.me', formData, undefined, saveOptions.onProgress)
      .then(() => file);
};

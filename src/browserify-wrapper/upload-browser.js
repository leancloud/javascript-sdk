/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

'use strict';

module.exports = function upload(file, AV, saveOptions) {
  //use /files endpoint.
  var dataFormat;
  file._previousSave = file._source.then(function(data, type) {
    dataFormat = data;
    return file._qiniuToken(type);
  }).then(function(response) {
    file.attributes.url = response.url;
    file._bucket = response.bucket;
    file.id = response.objectId;
    //Get the uptoken to upload files to qiniu.
    var uptoken = response.token;

    var data = new FormData();
    data.append('file', dataFormat);
    data.append('name', file.attributes.name);
    data.append('key', file._qiniu_key);
    data.append('token', uptoken);

    var promise = new AV.Promise();
    var handled = false;

    var xhr = new XMLHttpRequest();

    if (xhr.upload) {
      xhr.upload.onprogress = saveOptions.onProgress;
    }

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (handled) {
          return;
        }
        handled = true;

        delete file._qiniu_key;
        if (xhr.status >= 200 && xhr.status < 300) {
          var response;
          try {
            response = JSON.parse(xhr.responseText);
          } catch (e) {
            promise.reject(e);
            file.destroy();
          }
          if (response) {
            promise.resolve(file);
          } else {
            promise.reject(response);
          }
        } else {
          promise.reject(xhr);
          file.destroy();
        }
      }
    };
    xhr.open('POST', 'https://up.qbox.me', true);
    xhr.send(data);

    return promise;
  });
};

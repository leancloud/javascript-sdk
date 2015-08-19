'use strict';

module.exports = function upload(file, AV, saveOptions) {
  //use /files endpoint.
  var self = file;
  var dataFormat;
  self._previousSave = self._source.then(function(data, type) {
    dataFormat = data;
    return self._qiniuToken(type);
  }).then(function(response) {
    self._url = response.url;
    self._bucket = response.bucket;
    self.id = response.objectId;
    //Get the uptoken to upload files to qiniu.
    var uptoken = response.token;

    var data = new FormData();
    data.append("file", dataFormat, self._name);
    data.append("key", self._qiniu_key);
    data.append("token", uptoken);

    var promise = new AV.Promise();
    var handled = false;

    var xhr = new AV.XMLHttpRequest();

    xhr.upload.addEventListener('progress', function(e) {
      if (e.lengthComputable) {
        saveOptions.onProgress && saveOptions.onProgress(e);
      }
    }, false);

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (handled) {
          return;
        }
        handled = true;

        delete self._qiniu_key;
        if (xhr.status >= 200 && xhr.status < 300) {
          var response;
          try {
            response = JSON.parse(xhr.responseText);
          } catch (e) {
            promise.reject(e);
            self.destroy();
          }
          if (response) {
            promise.resolve(self);
          } else {
            promise.reject(response);
          }
        } else {
          promise.reject(xhr);
          self.destroy();
        }
      }
    };
    xhr.open('POST', 'http://upload.qiniu.com', true);
    xhr.send(data);

    return promise;
  });
};

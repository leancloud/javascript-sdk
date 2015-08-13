'use strict';

module.exports = function upload(file, AV) {
  //use /files endpoint.
  file._previousSave = file._source.then(function(base64, type) {
    var data = {
      base64: base64,
      _ContentType: type,
      ACL: file._acl,
      mime_type: type,
      metaData: file._metaData
    };
    return AV._request("files", file._name, null, 'POST', data);
  }).then(function(response) {
    file._name = response.name;
    file._url = response.url;
    file.id = response.objectId;
    if(response.size)
      file._metaData.size = response.size;
    return file;
  });
};

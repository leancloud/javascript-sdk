const superagent = require('superagent');
const storage = require('./utils/localstorage');

function request(url, { method, data, headers, onprogress }) {
  const req = superagent(method, url);
  if (headers) {
    req.set(headers);
  }
  if (onprogress) {
    req.on('progress', onprogress);
  }

  return req
    .send(data)
    .catch(error => {
      if (error.response) {
        return error.response;
      }
      throw error;
    })
    .then(({ status, ok, header, body }) => ({
      status,
      ok,
      headers: header,
      data: body,
    }));
}

function upload(url, file, { headers, data, onprogress } = {}) {
  const req = superagent('POST', url)
    .attach(file.field, file.data, file.name)
    .field(data);
  if (headers) {
    req.set(headers);
  }
  if (onprogress) {
    req.on('progress', onprogress);
  }
  return req
    .catch(error => {
      if (error.response) {
        return error.response;
      }
      throw error;
    })
    .then(({ status, ok, header, body }) => ({
      status,
      ok,
      headers: header,
      data: body,
    }));
}

module.exports = {
  request,
  upload,
  storage,
};

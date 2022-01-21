const { getAdapter } = require('../adapter');
const debug = require('debug')('leancloud:qiniu');
const ajax = require('../utils/ajax');
const btoa = require('../utils/btoa');

const SHARD_THRESHOLD = 1024 * 1024 * 64;

const CHUNK_SIZE = 1024 * 1024 * 16;

function upload(uploadInfo, data, file, saveOptions = {}) {
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
      key: uploadInfo.key,
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
}

function urlSafeBase64(string) {
  const base64 = btoa(unescape(encodeURIComponent(string)));
  let result = '';
  for (const ch of base64) {
    switch (ch) {
      case '+':
        result += '-';
        break;
      case '/':
        result += '_';
        break;
      default:
        result += ch;
    }
  }
  return result;
}

class ShardUploader {
  constructor(uploadInfo, data, file, saveOptions) {
    this.uploadInfo = uploadInfo;
    this.data = data;
    this.file = file;
    this.size = undefined;
    this.offset = 0;
    this.uploadedChunks = 0;

    const key = urlSafeBase64(uploadInfo.key);
    const uploadURL = uploadInfo.upload_url || 'https://upload.qiniup.com';
    this.baseURL = `${uploadURL}/buckets/${uploadInfo.bucket}/objects/${key}/uploads`;
    this.upToken = 'UpToken ' + uploadInfo.token;

    this.uploaded = 0;
    if (saveOptions && saveOptions.onprogress) {
      this.onProgress = ({ loaded }) => {
        loaded += this.uploadedChunks * CHUNK_SIZE;
        if (loaded <= this.uploaded) {
          return;
        }
        if (this.size) {
          saveOptions.onprogress({
            loaded,
            total: this.size,
            percent: (loaded / this.size) * 100,
          });
        } else {
          saveOptions.onprogress({ loaded });
        }
        this.uploaded = loaded;
      };
    }
  }

  /**
   * @returns {Promise<string>}
   */
  getUploadId() {
    return ajax({
      method: 'POST',
      url: this.baseURL,
      headers: {
        Authorization: this.upToken,
      },
    }).then(res => res.uploadId);
  }

  getChunk() {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} uploadId
   * @param {number} partNumber
   * @param {any} data
   * @returns {Promise<{ partNumber: number, etag: string }>}
   */
  uploadPart(uploadId, partNumber, data) {
    return ajax({
      method: 'PUT',
      url: `${this.baseURL}/${uploadId}/${partNumber}`,
      headers: {
        Authorization: this.upToken,
      },
      data,
      onprogress: this.onProgress,
    }).then(({ etag }) => ({ partNumber, etag }));
  }

  stopUpload(uploadId) {
    return ajax({
      method: 'DELETE',
      url: `${this.baseURL}/${uploadId}`,
      headers: {
        Authorization: this.upToken,
      },
    });
  }

  upload() {
    const parts = [];
    return this.getUploadId()
      .then(uploadId => {
        const uploadPart = () => {
          return Promise.resolve(this.getChunk())
            .then(chunk => {
              if (!chunk) {
                return;
              }
              const partNumber = parts.length + 1;
              return this.uploadPart(uploadId, partNumber, chunk).then(part => {
                parts.push(part);
                this.uploadedChunks++;
                return uploadPart();
              });
            })
            .catch(error =>
              this.stopUpload(uploadId).then(() => Promise.reject(error))
            );
        };

        return uploadPart().then(() =>
          ajax({
            method: 'POST',
            url: `${this.baseURL}/${uploadId}`,
            headers: {
              Authorization: this.upToken,
            },
            data: {
              parts,
              fname: this.file.attributes.name,
              mimeType: this.file.attributes.mime_type,
            },
          })
        );
      })
      .then(() => {
        this.file.attributes.url = this.uploadInfo.url;
        this.file._bucket = this.uploadInfo.bucket;
        this.file.id = this.uploadInfo.objectId;
        return this.file;
      });
  }
}

class BlobUploader extends ShardUploader {
  constructor(uploadInfo, data, file, saveOptions) {
    super(uploadInfo, data, file, saveOptions);
    this.size = data.size;
  }

  /**
   * @returns {Blob | null}
   */
  getChunk() {
    if (this.offset >= this.size) {
      return null;
    }
    const chunk = this.data.slice(this.offset, this.offset + CHUNK_SIZE);
    this.offset += chunk.size;
    return chunk;
  }
}

/* NODE-ONLY:start */
class BufferUploader extends ShardUploader {
  constructor(uploadInfo, data, file, saveOptions) {
    super(uploadInfo, data, file, saveOptions);
    this.size = data.length;
  }

  /**
   * @returns {Buffer | null}
   */
  getChunk() {
    if (this.offset >= this.size) {
      return null;
    }
    const chunk = this.data.slice(this.offset, this.offset + CHUNK_SIZE);
    this.offset += chunk.length;
    return chunk;
  }
}
/* NODE-ONLY:end */

/* NODE-ONLY:start */
class StreamUploader extends ShardUploader {
  /**
   * @param {number} [size]
   * @returns {Buffer | null}
   */
  _read(size) {
    const chunk = this.data.read(size);
    if (chunk) {
      this.offset += chunk.length;
    }
    return chunk;
  }

  /**
   * @returns {Buffer | null | Promise<Buffer | null>}
   */
  getChunk() {
    if (this.data.readableLength >= CHUNK_SIZE) {
      return this._read(CHUNK_SIZE);
    }

    if (this.data.readableEnded) {
      if (this.data.readable) {
        return this._read();
      }
      return null;
    }

    return new Promise((resolve, reject) => {
      const onReadable = () => {
        const chunk = this._read(CHUNK_SIZE);
        if (chunk !== null) {
          resolve(chunk);
          removeListeners();
        }
      };

      const onError = error => {
        reject(error);
        removeListeners();
      };

      const removeListeners = () => {
        this.data.off('readable', onReadable);
        this.data.off('error', onError);
      };

      this.data.on('readable', onReadable);
      this.data.on('error', onError);
    });
  }
}
/* NODE-ONLY:end */

function isBlob(data) {
  return typeof Blob !== 'undefined' && data instanceof Blob;
}

/* NODE-ONLY:start */
function isBuffer(data) {
  return typeof Buffer !== 'undefined' && Buffer.isBuffer(data);
}
/* NODE-ONLY:end */

/* NODE-ONLY:start */
function isStream(data) {
  return typeof require === 'function' && data instanceof require('stream');
}
/* NODE-ONLY:end */

module.exports = function(uploadInfo, data, file, saveOptions = {}) {
  if (isBlob(data) && data.size >= SHARD_THRESHOLD) {
    return new BlobUploader(uploadInfo, data, file, saveOptions).upload();
  }
  /* NODE-ONLY:start */
  if (isBuffer(data) && data.length >= SHARD_THRESHOLD) {
    return new BufferUploader(uploadInfo, data, file, saveOptions).upload();
  }
  if (isStream(data)) {
    return new StreamUploader(uploadInfo, data, file, saveOptions).upload();
  }
  /* NODE-ONLY:end */
  return upload(uploadInfo, data, file, saveOptions);
};

'use strict';

/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

var _ = require('underscore');
var cos = require('./uploader/cos');
var qiniu = require('./uploader/qiniu');
var s3 = require('./uploader/s3');
var AVError = require('./error');
var AVRequest = require('./request').request;

module.exports = function (AV) {

  // 挂载一些配置
  var avConfig = AV._config;

  // port from browserify path module
  // since react-native packager won't shim node modules.
  var extname = function extname(path) {
    return path.match(/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/)[4];
  };

  var b64Digit = function b64Digit(number) {
    if (number < 26) {
      return String.fromCharCode(65 + number);
    }
    if (number < 52) {
      return String.fromCharCode(97 + (number - 26));
    }
    if (number < 62) {
      return String.fromCharCode(48 + (number - 52));
    }
    if (number === 62) {
      return '+';
    }
    if (number === 63) {
      return '/';
    }
    throw new Error('Tried to encode large digit ' + number + ' in base64.');
  };

  var encodeBase64 = function encodeBase64(array) {
    var chunks = [];
    chunks.length = Math.ceil(array.length / 3);
    _.times(chunks.length, function (i) {
      var b1 = array[i * 3];
      var b2 = array[i * 3 + 1] || 0;
      var b3 = array[i * 3 + 2] || 0;

      var has2 = i * 3 + 1 < array.length;
      var has3 = i * 3 + 2 < array.length;

      chunks[i] = [b64Digit(b1 >> 2 & 0x3F), b64Digit(b1 << 4 & 0x30 | b2 >> 4 & 0x0F), has2 ? b64Digit(b2 << 2 & 0x3C | b3 >> 6 & 0x03) : "=", has3 ? b64Digit(b3 & 0x3F) : "="].join("");
    });
    return chunks.join("");
  };

  // 取出 dataURL 中 base64 的部分
  var dataURLToBase64 = function dataURLToBase64(base64) {
    if (base64.split(',')[0] && base64.split(',')[0].indexOf('base64') >= 0) {
      base64 = base64.split(',')[1];
    }
    return base64;
  };

  // 判断是否是国内节点
  var isCnNode = function isCnNode() {
    return avConfig.region === 'cn';
  };

  // A list of file extensions to mime types as found here:
  // http://stackoverflow.com/questions/58510/using-net-how-can-you-find-the-
  //     mime-type-of-a-file-based-on-the-file-signature
  var mimeTypes = {
    ai: "application/postscript",
    aif: "audio/x-aiff",
    aifc: "audio/x-aiff",
    aiff: "audio/x-aiff",
    asc: "text/plain",
    atom: "application/atom+xml",
    au: "audio/basic",
    avi: "video/x-msvideo",
    bcpio: "application/x-bcpio",
    bin: "application/octet-stream",
    bmp: "image/bmp",
    cdf: "application/x-netcdf",
    cgm: "image/cgm",
    "class": "application/octet-stream",
    cpio: "application/x-cpio",
    cpt: "application/mac-compactpro",
    csh: "application/x-csh",
    css: "text/css",
    dcr: "application/x-director",
    dif: "video/x-dv",
    dir: "application/x-director",
    djv: "image/vnd.djvu",
    djvu: "image/vnd.djvu",
    dll: "application/octet-stream",
    dmg: "application/octet-stream",
    dms: "application/octet-stream",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml." + "document",
    dotx: "application/vnd.openxmlformats-officedocument.wordprocessingml." + "template",
    docm: "application/vnd.ms-word.document.macroEnabled.12",
    dotm: "application/vnd.ms-word.template.macroEnabled.12",
    dtd: "application/xml-dtd",
    dv: "video/x-dv",
    dvi: "application/x-dvi",
    dxr: "application/x-director",
    eps: "application/postscript",
    etx: "text/x-setext",
    exe: "application/octet-stream",
    ez: "application/andrew-inset",
    gif: "image/gif",
    gram: "application/srgs",
    grxml: "application/srgs+xml",
    gtar: "application/x-gtar",
    hdf: "application/x-hdf",
    hqx: "application/mac-binhex40",
    htm: "text/html",
    html: "text/html",
    ice: "x-conference/x-cooltalk",
    ico: "image/x-icon",
    ics: "text/calendar",
    ief: "image/ief",
    ifb: "text/calendar",
    iges: "model/iges",
    igs: "model/iges",
    jnlp: "application/x-java-jnlp-file",
    jp2: "image/jp2",
    jpe: "image/jpeg",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    js: "application/x-javascript",
    kar: "audio/midi",
    latex: "application/x-latex",
    lha: "application/octet-stream",
    lzh: "application/octet-stream",
    m3u: "audio/x-mpegurl",
    m4a: "audio/mp4a-latm",
    m4b: "audio/mp4a-latm",
    m4p: "audio/mp4a-latm",
    m4u: "video/vnd.mpegurl",
    m4v: "video/x-m4v",
    mac: "image/x-macpaint",
    man: "application/x-troff-man",
    mathml: "application/mathml+xml",
    me: "application/x-troff-me",
    mesh: "model/mesh",
    mid: "audio/midi",
    midi: "audio/midi",
    mif: "application/vnd.mif",
    mov: "video/quicktime",
    movie: "video/x-sgi-movie",
    mp2: "audio/mpeg",
    mp3: "audio/mpeg",
    mp4: "video/mp4",
    mpe: "video/mpeg",
    mpeg: "video/mpeg",
    mpg: "video/mpeg",
    mpga: "audio/mpeg",
    ms: "application/x-troff-ms",
    msh: "model/mesh",
    mxu: "video/vnd.mpegurl",
    nc: "application/x-netcdf",
    oda: "application/oda",
    ogg: "application/ogg",
    pbm: "image/x-portable-bitmap",
    pct: "image/pict",
    pdb: "chemical/x-pdb",
    pdf: "application/pdf",
    pgm: "image/x-portable-graymap",
    pgn: "application/x-chess-pgn",
    pic: "image/pict",
    pict: "image/pict",
    png: "image/png",
    pnm: "image/x-portable-anymap",
    pnt: "image/x-macpaint",
    pntg: "image/x-macpaint",
    ppm: "image/x-portable-pixmap",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml." + "presentation",
    potx: "application/vnd.openxmlformats-officedocument.presentationml." + "template",
    ppsx: "application/vnd.openxmlformats-officedocument.presentationml." + "slideshow",
    ppam: "application/vnd.ms-powerpoint.addin.macroEnabled.12",
    pptm: "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
    potm: "application/vnd.ms-powerpoint.template.macroEnabled.12",
    ppsm: "application/vnd.ms-powerpoint.slideshow.macroEnabled.12",
    ps: "application/postscript",
    qt: "video/quicktime",
    qti: "image/x-quicktime",
    qtif: "image/x-quicktime",
    ra: "audio/x-pn-realaudio",
    ram: "audio/x-pn-realaudio",
    ras: "image/x-cmu-raster",
    rdf: "application/rdf+xml",
    rgb: "image/x-rgb",
    rm: "application/vnd.rn-realmedia",
    roff: "application/x-troff",
    rtf: "text/rtf",
    rtx: "text/richtext",
    sgm: "text/sgml",
    sgml: "text/sgml",
    sh: "application/x-sh",
    shar: "application/x-shar",
    silo: "model/mesh",
    sit: "application/x-stuffit",
    skd: "application/x-koan",
    skm: "application/x-koan",
    skp: "application/x-koan",
    skt: "application/x-koan",
    smi: "application/smil",
    smil: "application/smil",
    snd: "audio/basic",
    so: "application/octet-stream",
    spl: "application/x-futuresplash",
    src: "application/x-wais-source",
    sv4cpio: "application/x-sv4cpio",
    sv4crc: "application/x-sv4crc",
    svg: "image/svg+xml",
    swf: "application/x-shockwave-flash",
    t: "application/x-troff",
    tar: "application/x-tar",
    tcl: "application/x-tcl",
    tex: "application/x-tex",
    texi: "application/x-texinfo",
    texinfo: "application/x-texinfo",
    tif: "image/tiff",
    tiff: "image/tiff",
    tr: "application/x-troff",
    tsv: "text/tab-separated-values",
    txt: "text/plain",
    ustar: "application/x-ustar",
    vcd: "application/x-cdlink",
    vrml: "model/vrml",
    vxml: "application/voicexml+xml",
    wav: "audio/x-wav",
    wbmp: "image/vnd.wap.wbmp",
    wbmxl: "application/vnd.wap.wbxml",
    wml: "text/vnd.wap.wml",
    wmlc: "application/vnd.wap.wmlc",
    wmls: "text/vnd.wap.wmlscript",
    wmlsc: "application/vnd.wap.wmlscriptc",
    wrl: "model/vrml",
    xbm: "image/x-xbitmap",
    xht: "application/xhtml+xml",
    xhtml: "application/xhtml+xml",
    xls: "application/vnd.ms-excel",
    xml: "application/xml",
    xpm: "image/x-xpixmap",
    xsl: "application/xml",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xltx: "application/vnd.openxmlformats-officedocument.spreadsheetml." + "template",
    xlsm: "application/vnd.ms-excel.sheet.macroEnabled.12",
    xltm: "application/vnd.ms-excel.template.macroEnabled.12",
    xlam: "application/vnd.ms-excel.addin.macroEnabled.12",
    xlsb: "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
    xslt: "application/xslt+xml",
    xul: "application/vnd.mozilla.xul+xml",
    xwd: "image/x-xwindowdump",
    xyz: "chemical/x-xyz",
    zip: "application/zip"
  };

  /**
   * Reads a File using a FileReader.
   * @param file {File} the File to read.
   * @param type {String} (optional) the mimetype to override with.
   * @return {AV.Promise} A Promise that will be fulfilled with a
   *     base64-encoded string of the data and its mime type.
   */
  var readAsync = function readAsync(file, type) {
    var promise = new AV.Promise();

    if (typeof FileReader === "undefined") {
      return AV.Promise.error(new AVError(-1, "Attempted to use a FileReader on an unsupported browser."));
    }

    var reader = new global.FileReader();
    reader.onloadend = function () {
      if (reader.readyState !== 2) {
        promise.reject(new AVError(-1, "Error reading file."));
        return;
      }

      var dataURL = reader.result;
      var matches = /^data:([^;]*);base64,(.*)$/.exec(dataURL);
      if (!matches) {
        promise.reject(new AVError(-1, "Unable to interpret data URL: " + dataURL));
        return;
      }

      promise.resolve(matches[2], type || matches[1]);
    };
    reader.readAsDataURL(file);
    return promise;
  };

  /**
   * A AV.File is a local representation of a file that is saved to the AV
   * cloud.
   * @param name {String} The file's name. This will change to a unique value
   *     once the file has finished saving.
   * @param data {Array} The data for the file, as either:
   *     1. an Array of byte value Numbers, or
   *     2. an Object like { base64: "..." } with a base64-encoded String.
   *     3. a File object selected with a file upload control. (3) only works
   *        in Firefox 3.6+, Safari 6.0.2+, Chrome 7+, and IE 10+.
   *        For example:<pre>
   *     4.a Buffer object in Node.js runtime.
   * var fileUploadControl = $("#profilePhotoFileUpload")[0];
   * if (fileUploadControl.files.length > 0) {
   *   var file = fileUploadControl.files[0];
   *   var name = "photo.jpg";
   *   var file = new AV.File(name, file);
   *   file.save().then(function() {
   *     // The file has been saved to AV.
   *   }, function(error) {
   *     // The file either could not be read, or could not be saved to AV.
   *   });
   * }</pre>
   *
   * @class
   * @param type {String} Optional Content-Type header to use for the file. If
   *     this is omitted, the content type will be inferred from the name's
   *     extension.
   */
  AV.File = function (name, data, type) {

    this.attributes = {
      name: name,
      url: '',
      metaData: {},
      // 用来存储转换后要上传的 base64 String
      base64: ''
    };

    var owner = undefined;
    if (data && data.owner) {
      owner = data.owner;
    } else if (!AV._config.disableCurrentUser) {
      try {
        owner = AV.User.current();
      } catch (e) {
        console.warn('Get current user failed. It seems this runtime use an async storage system, please new AV.File in the callback of AV.User.currentAsync().');
      }
    }

    this.attributes.metaData = {
      owner: owner ? owner.id : 'unknown'
    };

    // Guess the content type from the extension if we need to.
    var extension = /\.([^.]*)$/.exec(name);
    if (extension) {
      extension = extension[1].toLowerCase();
    }
    var guessedType = type || mimeTypes[extension] || "text/plain";
    this._guessedType = guessedType;

    if (_.isArray(data)) {
      this.attributes.metaData.size = data.length;
      data = { base64: encodeBase64(data) };
    }
    if (data && data.base64) {
      var parseBase64 = require('./browserify-wrapper/parse-base64');
      var dataBase64 = parseBase64(data.base64, guessedType);
      this.attributes.base64 = dataURLToBase64(data.base64);
      this._source = AV.Promise.as(dataBase64, guessedType);
    } else if (data && data.blob) {
      if (!data.blob.type) {
        data.blob.type = guessedType;
      }
      this._source = AV.Promise.as(data.blob, guessedType);
    } else if (typeof File !== "undefined" && data instanceof global.File) {
      this._source = AV.Promise.as(data, guessedType);
    } else if (typeof global.Buffer !== "undefined" && global.Buffer.isBuffer(data)) {
      // use global.Buffer to prevent browserify pack Buffer module
      this.attributes.metaData.size = data.length;
      this._source = AV.Promise.as(data, guessedType);
    } else if (_.isString(data)) {
      throw new Error("Creating a AV.File from a String is not yet supported.");
    }
  };

  /**
   * Creates a fresh AV.File object with exists url for saving to AVOS Cloud.
   * @param {String} name the file name
   * @param {String} url the file url.
   * @param {Object} metaData the file metadata object,it's optional.
   * @param {String} Optional Content-Type header to use for the file. If
   *     this is omitted, the content type will be inferred from the name's
   *     extension.
   * @return {AV.File} the file object
   */
  AV.File.withURL = function (name, url, metaData, type) {
    if (!name || !url) {
      throw "Please provide file name and url";
    }
    var file = new AV.File(name, null, type);
    //copy metaData properties to file.
    if (metaData) {
      for (var prop in metaData) {
        if (!file.attributes.metaData[prop]) file.attributes.metaData[prop] = metaData[prop];
      }
    }
    file.attributes.url = url;
    //Mark the file is from external source.
    file.attributes.metaData.__source = 'external';
    return file;
  };

  /**
   * Creates a file object with exists objectId.
   * @param {String} objectId The objectId string
   * @return {AV.File} the file object
   */
  AV.File.createWithoutData = function (objectId) {
    var file = new AV.File();
    file.id = objectId;
    return file;
  };

  AV.File.prototype = {
    toJSON: function toJSON() {
      return AV._encode(this);
    },

    /**
     * Returns the ACL for this file.
     * @returns {AV.ACL} An instance of AV.ACL.
     */
    getACL: function getACL() {
      return this._acl;
    },

    /**
     * Sets the ACL to be used for this file.
     * @param {AV.ACL} acl An instance of AV.ACL.
     */
    setACL: function setACL(acl) {
      if (!(acl instanceof AV.ACL)) {
        return new AVError(AVError.OTHER_CAUSE, 'ACL must be a AV.ACL.');
      }
      this._acl = acl;
    },

    /**
     * Gets the name of the file. Before save is called, this is the filename
     * given by the user. After save is called, that name gets prefixed with a
     * unique identifier.
     */
    name: function name() {
      return this.get('name');
    },

    /**
     * Gets the url of the file. It is only available after you save the file or
     * after you get the file from a AV.Object.
     * @return {String}
     */
    url: function url() {
      return this.get('url');
    },

    /**
    * Gets the attributs of the file object.
    * @param {String} The attribute name which want to get.
    * @returns {String|Number|Array|Object}
    */
    get: function get(attrName) {
      switch (attrName) {
        case 'objectId':
        case 'id':
          return this.id;
        case 'url':
        case 'name':
        case 'metaData':
        case 'createdAt':
        case 'updatedAt':
          return this.attributes[attrName];
        default:
          return this.attributes.metaData[attrName];
      }
    },

    /**
    * Set the metaData of the file object.
    * @param {Object} Object is an key value Object for setting metaData.
    * @param {String} attr is an optional metadata key.
    * @param {Object} value is an optional metadata value.
    * @returns {String|Number|Array|Object}
    */
    set: function set() {
      var _this = this;

      var set = function set(attrName, value) {
        switch (attrName) {
          case 'name':
          case 'url':
          case 'base64':
          case 'metaData':
            _this.attributes[attrName] = value;
            break;
          default:
            // File 并非一个 AVObject，不能完全自定义其他属性，所以只能都放在 metaData 上面
            _this.attributes.metaData[attrName] = value;
            break;
        }
      };

      switch (arguments.length) {
        case 1:
          // 传入一个 Object
          for (var k in arguments.length <= 0 ? undefined : arguments[0]) {
            set(k, (arguments.length <= 0 ? undefined : arguments[0])[k]);
          }
          break;
        case 2:
          set(arguments.length <= 0 ? undefined : arguments[0], arguments.length <= 1 ? undefined : arguments[1]);
          break;
      }
    },

    /**
    * <p>Returns the file's metadata JSON object if no arguments is given.Returns the
    * metadata value if a key is given.Set metadata value if key and value are both given.</p>
    * <p><pre>
    *  var metadata = file.metaData(); //Get metadata JSON object.
    *  var size = file.metaData('size');  // Get the size metadata value.
    *  file.metaData('format', 'jpeg'); //set metadata attribute and value.
    *</pre></p>
    * @return {Object} The file's metadata JSON object.
    * @param {String} attr an optional metadata key.
    * @param {Object} value an optional metadata value.
    **/
    metaData: function metaData(attr, value) {
      if (attr && value) {
        this.attributes.metaData[attr] = value;
        return this;
      } else if (attr && !value) {
        return this.attributes.metaData[attr];
      } else {
        return this.attributes.metaData;
      }
    },

    /**
     * 如果文件是图片，获取图片的缩略图URL。可以传入宽度、高度、质量、格式等参数。
     * @return {String} 缩略图URL
     * @param {Number} width 宽度，单位：像素
     * @param {Number} heigth 高度，单位：像素
     * @param {Number} quality 质量，1-100的数字，默认100
     * @param {Number} scaleToFit 是否将图片自适应大小。默认为true。
     * @param {String} fmt 格式，默认为png，也可以为jpeg,gif等格式。
     */

    thumbnailURL: function thumbnailURL(width, height, quality, scaleToFit, fmt) {
      var url = this.attributes.url;
      if (!url) {
        throw new Error('Invalid url.');
      }
      if (!width || !height || width <= 0 || height <= 0) {
        throw new Error('Invalid width or height value.');
      }
      quality = quality || 100;
      scaleToFit = !scaleToFit ? true : scaleToFit;
      if (quality <= 0 || quality > 100) {
        throw new Error('Invalid quality value.');
      }
      fmt = fmt || 'png';
      var mode = scaleToFit ? 2 : 1;
      return url + '?imageView/' + mode + '/w/' + width + '/h/' + height + '/q/' + quality + '/format/' + fmt;
    },

    /**
    * Returns the file's size.
    * @return {Number} The file's size in bytes.
    **/
    size: function size() {
      return this.metaData().size;
    },

    /**
     * Returns the file's owner.
     * @return {String} The file's owner id.
     */
    ownerId: function ownerId() {
      return this.metaData().owner;
    },

    /**
    * Destroy the file.
    * @return {AV.Promise} A promise that is fulfilled when the destroy
    *     completes.
    */
    destroy: function destroy(options) {
      if (!this.id) {
        return AV.Promise.error('The file id is not eixsts.')._thenRunCallbacks(options);
      }
      var request = AVRequest("files", null, this.id, 'DELETE', options && options.sessionToken);
      return request._thenRunCallbacks(options);
    },

    /**
     * Request Qiniu upload token
     * @param {string} type
     * @return {AV.Promise} Resolved with the response
     * @private
     */
    _fileToken: function _fileToken(type) {
      var route = arguments.length <= 1 || arguments[1] === undefined ? 'fileTokens' : arguments[1];

      var name = this.attributes.name;

      // Create 16-bits uuid as qiniu key.
      var extName = extname(name);
      var hexOctet = function hexOctet() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      };
      var key = hexOctet() + hexOctet() + hexOctet() + hexOctet() + hexOctet() + extName;
      var data = {
        key: key,
        name: name,
        ACL: this._acl,
        mime_type: type,
        metaData: this.attributes.metaData
      };
      if (type && !this.attributes.metaData.mime_type) {
        this.attributes.metaData.mime_type = type;
      }
      this._qiniu_key = key;
      return AVRequest(route, null, null, 'POST', data);
    },


    /**
     * @callback UploadProgressCallback
     * @param {XMLHttpRequestProgressEvent} event - The progress event with 'loaded' and 'total' attributes
     */
    /**
     * Saves the file to the AV cloud.
     * @param {Object} saveOptions
     * @param {UploadProgressCallback} [saveOptions.onProgress]
     * @param {Object} options A Backbone-style options object.
     * @return {AV.Promise} Promise that is resolved when the save finishes.
     */
    save: function save() {
      var _this2 = this;

      if (this.id) {
        throw new Error('File already saved. If you want to manipulate a file, use AV.Query to get it.');
      }
      var options = undefined;
      var saveOptions = {};
      switch (arguments.length) {
        case 1:
          options = arguments.length <= 0 ? undefined : arguments[0];
          break;
        case 2:
          saveOptions = arguments.length <= 0 ? undefined : arguments[0];
          options = arguments.length <= 1 ? undefined : arguments[1];
          break;
      }
      if (!this._previousSave) {
        if (this._source) {
          this._previousSave = this._source.then(function (data, type) {
            return _this2._fileToken(type).then(function (uploadInfo) {
              var uploadPromise = undefined;
              switch (uploadInfo.provider) {
                case 's3':
                  uploadPromise = s3(uploadInfo, data, _this2, saveOptions);
                  break;
                case 'qcloud':
                  uploadPromise = cos(uploadInfo, data, _this2, saveOptions);
                  break;
                case 'qiniu':
                default:
                  uploadPromise = qiniu(uploadInfo, data, _this2, saveOptions);
                  break;
              }
              return uploadPromise.catch(function (err) {
                // destroy this file object when upload fails.
                _this2.destroy();
                throw err;
              });
            });
          });
        } else if (this.attributes.url && this.attributes.metaData.__source === 'external') {
          // external link file.
          var data = {
            name: this.attributes.name,
            ACL: this._acl,
            metaData: this.attributes.metaData,
            mime_type: this._guessedType,
            url: this.attributes.url
          };
          this._previousSave = AVRequest('files', this.attributes.name, null, 'post', data).then(function (response) {
            _this2.attributes.name = response.name;
            _this2.attributes.url = response.url;
            _this2.id = response.objectId;
            if (response.size) {
              _this2.attributes.metaData.size = response.size;
            }
            return _this2;
          });
        }
      }
      return this._previousSave._thenRunCallbacks(options);
    },

    /**
    * fetch the file from server. If the server's representation of the
    * model differs from its current attributes, they will be overriden,
    * @param {Object} fetchOptions Optional options to set 'keys' and
    *      'include' option.
    * @param {Object} options Optional Backbone-like options object to be
    *     passed in to set.
    * @return {AV.Promise} A promise that is fulfilled when the fetch
    *     completes.
    */
    fetch: function fetch() {
      var _this3 = this;

      var options = null;
      var fetchOptions = {};
      if (arguments.length === 1) {
        options = arguments[0];
      } else if (arguments.length === 2) {
        fetchOptions = arguments[0];
        options = arguments[1];
      }

      var request = AVRequest('files', null, this.id, 'GET', fetchOptions);
      return request.then(function (response) {
        var value = AV.Object.prototype.parse(response);
        value.attributes = {
          name: value.name,
          url: value.url
        };
        value.attributes.metaData = value.metaData || {};
        // clean
        delete value.objectId;
        delete value.metaData;
        delete value.url;
        delete value.name;
        _.extend(_this3, value);
        return _this3;
      })._thenRunCallbacks(options);
    }
  };
};
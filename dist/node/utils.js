/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _ = require('underscore');
var ajax = require('./ajax');
var Cache = require('./cache');
var md5 = require('md5');
var debug = require('debug')('utils');

// 计算 X-LC-Sign 的签名方法
var sign = function sign(key, isMasterKey) {
  var now = new Date().getTime();
  var signature = md5(now + key);
  if (isMasterKey) {
    return signature + ',' + now + ',master';
  } else {
    return signature + ',' + now;
  }
};

var init = function init(AV) {

  // 挂载一些配置
  var AVConfig = AV._config;

  // 服务器请求的节点 host
  var API_HOST = {
    cn: 'https://api.leancloud.cn',
    us: 'https://us-api.leancloud.cn'
  };

  _.extend(AVConfig, {

    // 服务器节点地区，默认中国大陆
    region: 'cn',

    // 服务器的 URL，默认初始化时被设置为大陆节点地址
    APIServerURL: AVConfig.APIServerURL || '',

    // 当前是否为 nodejs 环境
    isNode: false,

    // 禁用 currentUser，通常用于多用户环境
    disableCurrentUser: false
  });

  /**
   * Contains all AV API classes and functions.
   * @name AV
   * @namespace
   *
   * Contains all AV API classes and functions.
   */

  // Check whether we are running in Node.js.
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    AVConfig.isNode = true;
  }

  // Helpers
  // -------

  // Shared empty constructor function to aid in prototype-chain creation.
  var EmptyConstructor = function EmptyConstructor() {};

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function inherits(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      /** @ignore */
      child = function child() {
        parent.apply(this, arguments);
      };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    EmptyConstructor.prototype = parent.prototype;
    child.prototype = new EmptyConstructor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) {
      _.extend(child.prototype, protoProps);
    }

    // Add static properties to the constructor function, if supplied.
    if (staticProps) {
      _.extend(child, staticProps);
    }

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is
    // needed later.
    child.__super__ = parent.prototype;

    return child;
  };

  /**
   * Call this method first to set up authentication tokens for AV.
   * This method is for AV's own private use.
   * @param {String} applicationId Your AV Application ID.
   * @param {String} applicationKey Your AV Application Key
   */
  var initialize = function initialize(appId, appKey, masterKey) {
    if (AV.applicationId && appId !== AV.applicationId && appKey !== AV.applicationKey && masterKey !== AV.masterKey) {
      console.warn('LeanCloud SDK is already initialized, please do not reinitialize it.');
    }
    AV.applicationId = appId;
    AV.applicationKey = appKey;
    AV.masterKey = masterKey;
    AV._useMasterKey = false;
  };

  var setRegionServer = function setRegionServer() {
    var region = arguments.length <= 0 || arguments[0] === undefined ? 'cn' : arguments[0];

    AVConfig.region = region;
    // 如果用户在 init 之前设置了 APIServerURL，则跳过请求 router
    if (AVConfig.APIServerURL) {
      return;
    }
    AVConfig.APIServerURL = API_HOST[region];
    if (region === 'cn') {
      // TODO: remove appId match hack
      if (AV.applicationId.indexOf('-9Nh9j0Va') !== -1) {
        AVConfig.APIServerURL = 'https://e1-api.leancloud.cn';
      }
      Cache.get('APIServerURL').then(function (cachedServerURL) {
        if (cachedServerURL) {
          return cachedServerURL;
        } else {
          return ajax('get', 'https://app-router.leancloud.cn/1/route?appId=' + AV.applicationId).then(function (servers) {
            if (servers.api_server) {
              Cache.set('APIServerURL', servers.api_server, (typeof servers.ttl === 'number' ? servers.ttl : 3600) * 1000);
              return servers.api_server;
            }
          });
        }
      }).then(function (serverURL) {
        // 如果用户在 init 之后设置了 APIServerURL，保持用户设置
        if (AVConfig.APIServerURL === API_HOST[region]) {
          AVConfig.APIServerURL = 'https://' + serverURL;
        }
      });
    }
  };

  /**
    * Call this method first to set up your authentication tokens for AV.
    * You can get your app keys from the LeanCloud dashboard on http://leancloud.cn .
    * @function AV.init
    * @param args initialize options.
    * @param args.appId application id
    * @param args.appKey application key
    * @param args.masterKey application master key
  */

  AV.init = function () {

    var masterKeyWarn = function masterKeyWarn() {
      console.warn('MasterKey should not be used in the browser. ' + 'The permissions of MasterKey can be across all the server permissions,' + ' including the setting of ACL .');
    };

    switch (arguments.length) {
      case 1:
        var options = arguments.length <= 0 ? undefined : arguments[0];
        if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
          if (!AVConfig.isNode && options.masterKey) {
            masterKeyWarn();
          }
          initialize(options.appId, options.appKey, options.masterKey);
          setRegionServer(options.region);
          AVConfig.disableCurrentUser = options.disableCurrentUser;
        } else {
          throw new Error('AV.init(): Parameter is not correct.');
        }
        break;
      // 兼容旧版本的初始化方法
      case 2:
      case 3:
        console.warn('Please use AV.init() to replace AV.initialize() .');
        if (!AVConfig.isNode && arguments.length === 3) {
          masterKeyWarn();
        }
        initialize.apply(undefined, arguments);
        setRegionServer('cn');
        break;
    }
  };

  // If we're running in node.js, allow using the master key.
  if (AVConfig.isNode) {
    AV.Cloud = AV.Cloud || {};
    /**
     * Switches the LeanCloud SDK to using the Master key.  The Master key grants
     * priveleged access to the data in LeanCloud and can be used to bypass ACLs and
     * other restrictions that are applied to the client SDKs.
     * <p><strong><em>Available in Cloud Code and Node.js only.</em></strong>
     * </p>
     */
    AV.Cloud.useMasterKey = function () {
      AV._useMasterKey = true;
    };
  }

  // 兼容老版本的初始化方法
  AV.initialize = AV.init;

  /**
   * Call this method to set production environment variable.
   * @function AV.setProduction
   * @param {Boolean} production True is production environment,and
   *  it's true by default.
   */
  AV.setProduction = function (production) {
    if (!AV._isNullOrUndefined(production)) {
      //make sure it's a number
      production = production ? 1 : 0;
    }
    //default is 1
    AV.applicationProduction = AV._isNullOrUndefined(production) ? 1 : production;
  };

  /**
   * @deprecated Please use AV.init(), you can set the region of server .
  **/
  // TODO: 后续不再暴露此接口
  AV.useAVCloudCN = function () {
    setRegionServer('cn');
    console.warn('Do not use AV.useAVCloudCN. Please use AV.init(), you can set the region of server.');
  };

  /**
   * @deprecated Please use AV.init(), you can set the region of server .
  **/
  // TODO: 后续不再暴露此接口
  AV.useAVCloudUS = function () {
    setRegionServer('us');
    console.warn('Do not use AV.useAVCloudUS. Please use AV.init(), you can set the region of server.');
  };

  /**
   * Returns prefix for localStorage keys used by this instance of AV.
   * @param {String} path The relative suffix to append to it.
   *     null or undefined is treated as the empty string.
   * @return {String} The full key name.
   */
  AV._getAVPath = function (path) {
    if (!AV.applicationId) {
      throw "You need to call AV.initialize before using AV.";
    }
    if (!path) {
      path = "";
    }
    if (!_.isString(path)) {
      throw "Tried to get a localStorage path that wasn't a String.";
    }
    if (path[0] === "/") {
      path = path.substring(1);
    }
    return "AV/" + AV.applicationId + "/" + path;
  };

  /**
   * Returns the unique string for this app on this machine.
   * Gets reset when localStorage is cleared.
   */
  AV._installationId = null;
  AV._getInstallationId = function () {
    // See if it's cached in RAM.
    if (AV._installationId) {
      return AV.Promise.as(AV._installationId);
    }

    // Try to get it from localStorage.
    var path = AV._getAVPath("installationId");
    return AV.localStorage.getItemAsync(path).then(function (_installationId) {
      AV._installationId = _installationId;
      if (!AV._installationId) {
        // It wasn't in localStorage, so create a new one.
        var hexOctet = function hexOctet() {
          return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };
        AV._installationId = hexOctet() + hexOctet() + "-" + hexOctet() + "-" + hexOctet() + "-" + hexOctet() + "-" + hexOctet() + hexOctet() + hexOctet();
        return AV.localStorage.setItemAsync(path, AV._installationId);
      } else {
        return _installationId;
      }
    });
  };

  AV._parseDate = function (iso8601) {
    var regexp = new RegExp("^([0-9]{1,4})-([0-9]{1,2})-([0-9]{1,2})" + "T" + "([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})" + "(.([0-9]+))?" + "Z$");
    var match = regexp.exec(iso8601);
    if (!match) {
      return null;
    }

    var year = match[1] || 0;
    var month = (match[2] || 1) - 1;
    var day = match[3] || 0;
    var hour = match[4] || 0;
    var minute = match[5] || 0;
    var second = match[6] || 0;
    var milli = match[8] || 0;

    return new Date(Date.UTC(year, month, day, hour, minute, second, milli));
  };

  AV._ajax = ajax;

  // A self-propagating extend function.
  AV._extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

  /**
   * route is classes, users, login, etc.
   * objectId is null if there is no associated objectId.
   * method is the http method for the REST API.
   * dataObject is the payload as an object, or null if there is none.
   * @ignore
   */
  AV._request = function (route, className, objectId, method, dataObject, sessionToken) {
    if (!AV.applicationId) {
      throw "You must specify your applicationId using AV.initialize";
    }

    if (!AV.applicationKey && !AV.masterKey) {
      throw "You must specify a key using AV.initialize";
    }

    if (route !== "batch" && route !== "classes" && route !== "files" && route !== "date" && route !== "functions" && route !== "call" && route !== "login" && route !== "push" && route !== "search/select" && route !== "requestPasswordReset" && route !== "requestEmailVerify" && route !== "requestPasswordResetBySmsCode" && route !== "resetPasswordBySmsCode" && route !== "requestMobilePhoneVerify" && route !== "requestLoginSmsCode" && route !== "verifyMobilePhone" && route !== "requestSmsCode" && route !== "verifySmsCode" && route !== "users" && route !== "usersByMobilePhone" && route !== "cloudQuery" && route !== "qiniu" && route !== "fileTokens" && route !== "statuses" && route !== "bigquery" && route !== 'search/select' && route !== 'subscribe/statuses/count' && route !== 'subscribe/statuses' && route !== 'installations' && !/users\/[^\/]+\/updatePassword/.test(route) && !/users\/[^\/]+\/friendship\/[^\/]+/.test(route)) {
      throw "Bad route: '" + route + "'.";
    }

    dataObject = dataObject || {};

    // 兼容 AV.serverURL 旧方式设置 API Host，后续去掉
    var apiURL = AV.serverURL || AVConfig.APIServerURL;
    if (AV.serverURL) {
      AVConfig.APIServerURL = AV.serverURL;
      console.warn('Please use AV._config.APIServerURL to replace AV.serverURL .');
    }
    if (apiURL.charAt(apiURL.length - 1) !== "/") {
      apiURL += "/";
    }
    apiURL += "1.1/" + route;
    if (className) {
      apiURL += "/" + className;
    }
    if (objectId) {
      apiURL += "/" + objectId;
    }
    if ((route === 'users' || route === 'classes') && dataObject) {
      apiURL += '?';
      if (dataObject._fetchWhenSave) {
        delete dataObject._fetchWhenSave;
        apiURL += '&new=true';
      }
      if (dataObject._where) {
        apiURL += '&where=' + encodeURIComponent(JSON.stringify(dataObject._where));
        delete dataObject._where;
      }
    }

    var headers = {
      'X-LC-Id': AV.applicationId,
      'Content-Type': 'application/json;charset=UTF-8'
    };
    if (AV.masterKey && AV._useMasterKey) {
      headers['X-LC-Sign'] = sign(AV.masterKey, true);
    } else {
      headers['X-LC-Sign'] = sign(AV.applicationKey);
    }
    if (!AV._isNullOrUndefined(AV.applicationProduction)) {
      headers['X-LC-Prod'] = AV.applicationProduction;
    }
    if (!AVConfig.isNode) {
      headers['X-LC-UA'] = 'AV/' + AV.version;
    } else {
      headers['User-Agent'] = AV._config.userAgent || 'AV/' + AV.version + '; Node.js/' + process.version;
    }

    return AV.Promise.as().then(function () {
      // Pass the session token
      if (sessionToken) {
        headers['X-LC-Session'] = sessionToken;
      } else if (!AV._config.disableCurrentUser) {
        return AV.User.currentAsync().then(function (currentUser) {
          if (currentUser && currentUser._sessionToken) {
            headers['X-LC-Session'] = currentUser._sessionToken;
          }
        });
      }
    }).then(function () {
      if (method.toLowerCase() === 'get') {
        if (apiURL.indexOf('?') === -1) {
          apiURL += '?';
        }
        for (var k in dataObject) {
          if (_typeof(dataObject[k]) === 'object') {
            dataObject[k] = JSON.stringify(dataObject[k]);
          }
          apiURL += '&' + k + '=' + encodeURIComponent(dataObject[k]);
        }
      }

      return AV._ajax(method, apiURL, dataObject, headers).then(null, function (response) {
        // Transform the error into an instance of AV.Error by trying to parse
        // the error string as JSON.
        var error;
        if (response) {
          if (response.response) {
            error = new AV.Error(response.response.code, response.response.error);
          } else if (response.responseText) {
            try {
              var errorJSON = JSON.parse(response.responseText);
              if (errorJSON) {
                error = new AV.Error(errorJSON.code, errorJSON.error);
              }
            } catch (e) {
              // If we fail to parse the error text, that's okay.
            }
          }
        }
        error = error || new AV.Error(-1, response.responseText);
        // By explicitly returning a rejected Promise, this will work with
        // either jQuery or Promises/A semantics.
        return AV.Promise.error(error);
      });
    });
  };

  // Helper function to get a value from a Backbone object as a property
  // or as a function.
  AV._getValue = function (object, prop) {
    if (!(object && object[prop])) {
      return null;
    }
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
  };

  /**
   * Converts a value in a AV Object into the appropriate representation.
   * This is the JS equivalent of Java's AV.maybeReferenceAndEncode(Object)
   * if seenObjects is falsey. Otherwise any AV.Objects not in
   * seenObjects will be fully embedded rather than encoded
   * as a pointer.  This array will be used to prevent going into an infinite
   * loop because we have circular references.  If <seenObjects>
   * is set, then none of the AV Objects that are serialized can be dirty.
   */
  AV._encode = function (value, seenObjects, disallowObjects) {
    if (value instanceof AV.Object) {
      if (disallowObjects) {
        throw "AV.Objects not allowed here";
      }
      if (!seenObjects || _.include(seenObjects, value) || !value._hasData) {
        return value._toPointer();
      }
      if (!value.dirty()) {
        seenObjects = seenObjects.concat(value);
        return AV._encode(value._toFullJSON(seenObjects), seenObjects, disallowObjects);
      }
      throw "Tried to save an object with a pointer to a new, unsaved object.";
    }
    if (value instanceof AV.ACL) {
      return value.toJSON();
    }
    if (_.isDate(value)) {
      return { "__type": "Date", "iso": value.toJSON() };
    }
    if (value instanceof AV.GeoPoint) {
      return value.toJSON();
    }
    if (_.isArray(value)) {
      return _.map(value, function (x) {
        return AV._encode(x, seenObjects, disallowObjects);
      });
    }
    if (_.isRegExp(value)) {
      return value.source;
    }
    if (value instanceof AV.Relation) {
      return value.toJSON();
    }
    if (value instanceof AV.Op) {
      return value.toJSON();
    }
    if (value instanceof AV.File) {
      if (!value.url() && !value.id) {
        throw "Tried to save an object containing an unsaved file.";
      }
      return {
        __type: "File",
        id: value.id,
        name: value.name(),
        url: value.url()
      };
    }
    if (_.isObject(value)) {
      var output = {};
      AV._objectEach(value, function (v, k) {
        output[k] = AV._encode(v, seenObjects, disallowObjects);
      });
      return output;
    }
    return value;
  };

  /**
   * The inverse function of AV._encode.
   * TODO: make decode not mutate value.
   */
  AV._decode = function (key, value) {
    if (!_.isObject(value)) {
      return value;
    }
    if (_.isArray(value)) {
      AV._arrayEach(value, function (v, k) {
        value[k] = AV._decode(k, v);
      });
      return value;
    }
    if (value instanceof AV.Object) {
      return value;
    }
    if (value instanceof AV.File) {
      return value;
    }
    if (value instanceof AV.Op) {
      return value;
    }
    if (value.__op) {
      return AV.Op._decode(value);
    }
    var className;
    if (value.__type === "Pointer") {
      className = value.className;
      var pointer = AV.Object._create(className);
      if (Object.keys(value).length > 3) {
        delete value.__type;
        delete value.className;
        pointer._finishFetch(value, true);
      } else {
        pointer._finishFetch({ objectId: value.objectId }, false);
      }
      return pointer;
    }
    if (value.__type === "Object") {
      // It's an Object included in a query result.
      className = value.className;
      delete value.__type;
      delete value.className;
      var object = AV.Object._create(className);
      object._finishFetch(value, true);
      return object;
    }
    if (value.__type === "Date") {
      return AV._parseDate(value.iso);
    }
    if (value.__type === "GeoPoint") {
      return new AV.GeoPoint({
        latitude: value.latitude,
        longitude: value.longitude
      });
    }
    if (key === "ACL") {
      if (value instanceof AV.ACL) {
        return value;
      }
      return new AV.ACL(value);
    }
    if (value.__type === "Relation") {
      var relation = new AV.Relation(null, key);
      relation.targetClassName = value.className;
      return relation;
    }
    if (value.__type === 'File') {
      var file = new AV.File(value.name);
      file.attributes.metaData = value.metaData || {};
      file.attributes.url = value.url;
      file.id = value.objectId;
      return file;
    }
    AV._objectEach(value, function (v, k) {
      value[k] = AV._decode(k, v);
    });
    return value;
  };

  AV._encodeObjectOrArray = function (value) {
    var encodeAVObject = function encodeAVObject(object) {
      if (object && object._toFullJSON) {
        object = object._toFullJSON([]);
      }

      return _.mapObject(object, function (value) {
        return AV._encode(value, []);
      });
    };

    if (_.isArray(value)) {
      return value.map(function (object) {
        return encodeAVObject(object);
      });
    } else {
      return encodeAVObject(value);
    }
  };

  AV._arrayEach = _.each;

  /**
   * Does a deep traversal of every item in object, calling func on every one.
   * @param {Object} object The object or array to traverse deeply.
   * @param {Function} func The function to call for every item. It will
   *     be passed the item as an argument. If it returns a truthy value, that
   *     value will replace the item in its parent container.
   * @returns {} the result of calling func on the top-level object itself.
   */
  AV._traverse = function (object, func, seen) {
    if (object instanceof AV.Object) {
      seen = seen || [];
      if (_.indexOf(seen, object) >= 0) {
        // We've already visited this object in this call.
        return;
      }
      seen.push(object);
      AV._traverse(object.attributes, func, seen);
      return func(object);
    }
    if (object instanceof AV.Relation || object instanceof AV.File) {
      // Nothing needs to be done, but we don't want to recurse into the
      // object's parent infinitely, so we catch this case.
      return func(object);
    }
    if (_.isArray(object)) {
      _.each(object, function (child, index) {
        var newChild = AV._traverse(child, func, seen);
        if (newChild) {
          object[index] = newChild;
        }
      });
      return func(object);
    }
    if (_.isObject(object)) {
      AV._each(object, function (child, key) {
        var newChild = AV._traverse(child, func, seen);
        if (newChild) {
          object[key] = newChild;
        }
      });
      return func(object);
    }
    return func(object);
  };

  /**
   * This is like _.each, except:
   * * it doesn't work for so-called array-like objects,
   * * it does work for dictionaries with a "length" attribute.
   */
  AV._objectEach = AV._each = function (obj, callback) {
    if (_.isObject(obj)) {
      _.each(_.keys(obj), function (key) {
        callback(obj[key], key);
      });
    } else {
      _.each(obj, callback);
    }
  };

  // Helper function to check null or undefined.
  AV._isNullOrUndefined = function (x) {
    return _.isNull(x) || _.isUndefined(x);
  };
};

module.exports = {

  init: init
};
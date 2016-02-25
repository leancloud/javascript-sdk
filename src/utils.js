/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

'use strict';

const _ = require('underscore');

module.exports = function(AV) {

  // 挂载一些配置
  let AVConfig = AV._config;

  _.extend(AVConfig, {

    // 服务器请求的节点 host
    apiHost : {
      cn: 'https://api.leancloud.cn',
      us: 'https://us-api.leancloud.cn'
    },

    // 服务器节点地区，默认中国大陆
    region: 'cn'
  });

  /**
   * Contains all AV API classes and functions.
   * @name AV
   * @namespace
   *
   * Contains all AV API classes and functions.
   */

  // Check whether we are running in Node.js.
  if (typeof(process) !== 'undefined' && process.versions && process.versions.node) {
    AVConfig.isNode = true;
  }

  // Helpers
  // -------

  // Shared empty constructor function to aid in prototype-chain creation.
  var EmptyConstructor = function() {};


  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      /** @ignore */
      child = function(){ parent.apply(this, arguments); };
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
   const initialize = (applicationId, applicationKey, masterKey) => {
    if (AV.applicationId !== undefined &&
        applicationId !== AV.applicationId  &&
        applicationKey !== AV.applicationKey &&
        masterKey !== AV.masterKey) {
      console.warn('LeanCloud SDK is already initialized, please don\'t reinitialize it.');
    }
    AV.applicationId = applicationId;
    AV.applicationKey = applicationKey;
    AV.masterKey = masterKey;
    AV._useMasterKey = false;
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

  AV.init = (...args) => {
    switch (args.length) {
      case 1:
        const options = args[0];
        if (typeof options === 'object') {
          if (!AVConfig.isNode && options.masterKey) {
            throw new Error('AV.init(): Master Key is only used in Node.js.');
          }
          initialize(options.appId, options.appKey, options.masterKey);

          // 服务器地区选项，默认为中国大陆
          switch (options.region) {
            case 'us':
              AVConfig.region = 'us';
            break;
          }
        } else {
          throw new Error('AV.init(): Parameter is not correct.');
        }
      break;
      // 兼容旧版本的初始化方法
      case 2:
      case 3:
        console.warn('Please use AV.init() replace AV.initialize() .');
        if (!AVConfig.isNode && args.length === 3) {
          throw new Error('AV.init(): Master Key is only used in Node.js.');
        }
        initialize(...args);
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
    AV.Cloud.useMasterKey = function() {
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
  AV.setProduction = function(production){
    if(!AV._isNullOrUndefined(production)) {
      //make sure it's a number
      production = production ? 1 : 0;
    }
    //default is 1
    AV.applicationProduction = AV._isNullOrUndefined(production) ? 1: production;
  };

  /**
   * @deprecated Please use AV.init(), you can set the region of server .
  **/
  // TODO: 后续不再暴露此接口
  AV.useAVCloudCN = function(){
    AVConfig.region = 'cn';
    console.warn('Do not use AV.useAVCloudCN. Please use AV.init(), you can set the region of server.');
  };

  /**
   * @deprecated Please use AV.init(), you can set the region of server .
  **/
  // TODO: 后续不再暴露此接口
  AV.useAVCloudUS = function(){
    AVConfig.region = 'us';
    console.warn('Do not use AV.useAVCloudUS. Please use AV.init(), you can set the region of server.');
  };

  /**
   * Returns prefix for localStorage keys used by this instance of AV.
   * @param {String} path The relative suffix to append to it.
   *     null or undefined is treated as the empty string.
   * @return {String} The full key name.
   */
  AV._getAVPath = function(path) {
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
  AV._getInstallationId = function() {
    // See if it's cached in RAM.
    if (AV._installationId) {
      return AV.Promise.as(AV._installationId);
    }

    // Try to get it from localStorage.
    var path = AV._getAVPath("installationId");
    return AV.localStorage.getItemAsync(path).then(function(_installationId){
      AV._installationId = _installationId;
      if (!AV._installationId) {
        // It wasn't in localStorage, so create a new one.
        var hexOctet = function() {
          return Math.floor((1+Math.random())*0x10000).toString(16).substring(1);
        };
        AV._installationId = (
          hexOctet() + hexOctet() + "-" +
          hexOctet() + "-" +
          hexOctet() + "-" +
          hexOctet() + "-" +
          hexOctet() + hexOctet() + hexOctet());
        return AV.localStorage.setItemAsync(path, AV._installationId);
      }
      else {
        return _installationId;
      }
    });
  };

  AV._parseDate = function(iso8601) {
    var regexp = new RegExp(
      "^([0-9]{1,4})-([0-9]{1,2})-([0-9]{1,2})" + "T" +
      "([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})" +
      "(.([0-9]+))?" + "Z$");
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

  AV._ajax = require('./browserify-wrapper/ajax');

  // A self-propagating extend function.
  AV._extend = function(protoProps, classProps) {
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
  AV._request = function(route, className, objectId, method, dataObject) {
    if (!AV.applicationId) {
      throw "You must specify your applicationId using AV.initialize";
    }

    if (!AV.applicationKey && !AV.masterKey) {
      throw "You must specify a key using AV.initialize";
    }


    if (route !== "batch" &&
        route !== "classes" &&
        route !== "files" &&
        route !== "date" &&
        route !== "functions" &&
        route !== "call" &&
        route !== "login" &&
        route !== "push" &&
        route !== "search/select" &&
        route !== "requestPasswordReset" &&
        route !== "requestEmailVerify" &&
        route !== "requestPasswordResetBySmsCode" &&
        route !== "resetPasswordBySmsCode" &&
        route !== "requestMobilePhoneVerify" &&
        route !== "requestLoginSmsCode" &&
        route !== "verifyMobilePhone" &&
        route !== "requestSmsCode" &&
        route !== "verifySmsCode" &&
        route !== "users" &&
        route !== "usersByMobilePhone" &&
        route !== "cloudQuery" &&
        route !== "qiniu" &&
        route !== "statuses" &&
        route !== "bigquery" &&
        route !== 'search/select' &&
        route !== 'subscribe/statuses/count' &&
        route !== 'subscribe/statuses' &&
        route !== 'installations' &&
        !(/users\/[^\/]+\/updatePassword/.test(route)) &&
        !(/users\/[^\/]+\/friendship\/[^\/]+/.test(route))) {
      throw "Bad route: '" + route + "'.";
    }

    // 兼容 AV.serverURL 旧方式设置 API Host，后续去掉
    let apiUrl = AV.serverURL || AVConfig.apiHost[AVConfig.region];
    if (apiUrl.charAt(apiUrl.length - 1) !== "/") {
      apiUrl += "/";
    }
    apiUrl += "1.1/" + route;
    if (className) {
      apiUrl += "/" + className;
    }
    if (objectId) {
      apiUrl += "/" + objectId;
    }
    if ((route ==='users' || route === 'classes') && dataObject && dataObject._fetchWhenSave){
      delete dataObject._fetchWhenSave;
      apiUrl += '?new=true';
    }

    dataObject = _.clone(dataObject || {});
    if (method !== "POST") {
      dataObject._method = method;
      method = "POST";
    }

    dataObject._ApplicationId = AV.applicationId;
    dataObject._ApplicationKey = AV.applicationKey;
    if(!AV._isNullOrUndefined(AV.applicationProduction)) {
      dataObject._ApplicationProduction = AV.applicationProduction;
    }
    if(AV._useMasterKey)
        dataObject._MasterKey = AV.masterKey;
    dataObject._ClientVersion = AV.VERSION;
    // Pass the session token on every request.
    return AV.User.currentAsync().then(function(currentUser) {
      if (currentUser && currentUser._sessionToken) {
        dataObject._SessionToken = currentUser._sessionToken;
      }
      return AV._getInstallationId();
    }).then(function(_InstallationId) {
      dataObject._InstallationId = _InstallationId;

      var data = JSON.stringify(dataObject);
      return AV._ajax(method, apiUrl, data).then(null, function(response) {
        // Transform the error into an instance of AV.Error by trying to parse
        // the error string as JSON.
        var error;
        if (response && response.responseText) {
          try {
            var errorJSON = JSON.parse(response.responseText);
            if (errorJSON) {
              error = new AV.Error(errorJSON.code, errorJSON.error);
            }
          } catch (e) {
            // If we fail to parse the error text, that's okay.
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
  AV._getValue = function(object, prop) {
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
  AV._encode = function(value, seenObjects, disallowObjects) {
    if (value instanceof AV.Object) {
      if (disallowObjects) {
        throw "AV.Objects not allowed here";
      }
      if (!seenObjects || _.include(seenObjects, value) || !value._hasData) {
        return value._toPointer();
      }
      if (!value.dirty()) {
        seenObjects = seenObjects.concat(value);
        return AV._encode(value._toFullJSON(seenObjects),
                             seenObjects,
                             disallowObjects);
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
      return _.map(value, function(x) {
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
        id:  value.id,
        name: value.name(),
        url: value.url()
      };
    }
    if (_.isObject(value)) {
      var output = {};
      AV._objectEach(value, function(v, k) {
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
  AV._decode = function(key, value) {
    if (!_.isObject(value)) {
      return value;
    }
    if (_.isArray(value)) {
      AV._arrayEach(value, function(v, k) {
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
      if(Object.keys(value).length > 3) {
          delete value.__type;
          delete value.className;
          pointer._finishFetch(value, true);
      }else{
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
    if (value.__type === "File") {
      var file = new AV.File(value.name);
      file._metaData = value.metaData || {};
      file._url = value.url;
      file.id = value.objectId;
      return file;
    }
    AV._objectEach(value, function(v, k) {
      value[k] = AV._decode(k, v);
    });
    return value;
  };

  AV._encodeObjectOrArray = function(value) {
    var encodeAVObject = function(object) {
      if (object && object._toFullJSON){
        object = object._toFullJSON([]);
      }

      return _.mapObject(object, function(value) {
        return AV._encode(value, []);
      });
    };

    if (_.isArray(value)) {
      return value.map(function(object) {
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
  AV._traverse = function(object, func, seen) {
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
      _.each(object, function(child, index) {
        var newChild = AV._traverse(child, func, seen);
        if (newChild) {
          object[index] = newChild;
        }
      });
      return func(object);
    }
    if (_.isObject(object)) {
      AV._each(object, function(child, key) {
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
  AV._objectEach = AV._each = function(obj, callback) {
    if (_.isObject(obj)) {
      _.each(_.keys(obj), function(key) {
        callback(obj[key], key);
      });
    } else {
      _.each(obj, callback);
    }
  };

  // Helper function to check null or undefined.
  AV._isNullOrUndefined = function(x) {
    return _.isNull(x) || _.isUndefined(x);
  };
};

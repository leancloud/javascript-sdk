'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

var _ = require('underscore');
var request = require('./request');

// Helper function to check null or undefined.
var isNullOrUndefined = function isNullOrUndefined(x) {
  return _.isNull(x) || _.isUndefined(x);
};

var ensureArray = function ensureArray(target) {
  if (_.isArray(target)) {
    return target;
  }
  if (target === undefined || target === null) {
    return [];
  }
  return [target];
};

var init = function init(AV) {
  // 挂载一些配置
  var AVConfig = AV._config;

  _.extend(AVConfig, {

    // 服务器节点地区，默认中国大陆
    region: 'cn',

    // 服务器的 URL，默认初始化时被设置为大陆节点地址
    APIServerURL: AVConfig.APIServerURL || '',

    // 当前是否为 nodejs 环境
    isNode: false,

    // 禁用 currentUser，通常用于多用户环境
    disableCurrentUser: false,

    // Internal config can modifie the UserAgent
    userAgent: null,

    // set production environment or test environment
    // 1: production environment, 0: test environment, null: default environment
    applicationProduction: null
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
          request.setServerUrlByRegion(options.region);
          AVConfig.disableCurrentUser = options.disableCurrentUser;
        } else {
          throw new Error('AV.init(): Parameter is not correct.');
        }
        break;
      // 兼容旧版本的初始化方法
      case 2:
      case 3:
        console.warn('Please use AV.init() to replace AV.initialize(), ' + 'AV.init() need an Object param, like { appId: \'YOUR_APP_ID\', appKey: \'YOUR_APP_KEY\' } . ' + 'Docs: https://leancloud.cn/docs/sdk_setup-js.html');
        if (!AVConfig.isNode && arguments.length === 3) {
          masterKeyWarn();
        }
        initialize.apply(undefined, arguments);
        request.setServerUrlByRegion('cn');
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
    if (!isNullOrUndefined(production)) {
      AVConfig.applicationProduction = production ? 1 : 0;
    } else {
      // change to default value
      AVConfig.applicationProduction = null;
    }
  };

  /**
   * @deprecated Please use AV.init(), you can set the region of server .
  **/
  // TODO: 后续不再暴露此接口
  AV.useAVCloudCN = function () {
    request.setServerUrlByRegion('cn');
    console.warn('Do not use AV.useAVCloudCN. Please use AV.init(), you can set the region of server.');
  };

  /**
   * @deprecated Please use AV.init(), you can set the region of server .
  **/
  // TODO: 后续不再暴露此接口
  AV.useAVCloudUS = function () {
    request.setServerUrlByRegion('us');
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
      throw new Error('You need to call AV.init() before using AV.');
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

  // TODO: Next version remove
  AV._ajax = function () {
    console.warn('AV._ajax is deprecated, and will be removed in next release.');
    request.ajax.apply(request, arguments);
  };

  // TODO: Next version remove
  AV._request = function () {
    console.warn('AV._request is deprecated, and will be removed in next release.');
    request.request.apply(request, arguments);
  };

  // A self-propagating extend function.
  AV._extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
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
      var json = {
        __type: "File",
        id: value.id,
        objectId: value.id,
        name: value.name(),
        url: value.url()
      };
      var createdAt = value.get('createdAt');
      if (createdAt) json.createdAt = createdAt.toJSON();
      var updatedAt = value.get('updatedAt');
      if (updatedAt) json.updatedAt = updatedAt.toJSON();
      return json;
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
};

module.exports = {
  init: init,
  isNullOrUndefined: isNullOrUndefined,
  ensureArray: ensureArray
};
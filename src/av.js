const _ = require('underscore');
const uuid = require('uuid/v4');
const debug = require('debug');
const { inherits, parseDate } = require('./utils');
const version = require('./version');
const { setAdapters, adapterManager } = require('./adapter');

const AV = global.AV || {};

// All internal configuration items
AV._config = {
  serverURLs: {},
  useMasterKey: false,
  production: null,
  realtime: null,
  requestTimeout: null,
};

const initialUserAgent = `LeanCloud-JS-SDK/${version}`;

// configs shared by all AV instances
AV._sharedConfig = {
  userAgent: initialUserAgent,
  liveQueryRealtime: null,
};

adapterManager.on('platformInfo', platformInfo => {
  let ua = initialUserAgent;
  if (platformInfo) {
    if (platformInfo.userAgent) {
      ua = platformInfo.userAgent;
    } else {
      let comments = platformInfo.name;
      if (platformInfo.version) {
        comments += `/${platformInfo.version}`;
      }
      if (platformInfo.extra) {
        comments += `; ${platformInfo.extra}`;
      }
      ua += ` (${comments})`;
    }
  }
  AV._sharedConfig.userAgent = ua;
});

/**
 * Contains all AV API classes and functions.
 * @namespace AV
 */

/**
 * Returns prefix for localStorage keys used by this instance of AV.
 * @param {String} path The relative suffix to append to it.
 *     null or undefined is treated as the empty string.
 * @return {String} The full key name.
 * @private
 */
AV._getAVPath = function(path) {
  if (!AV.applicationId) {
    throw new Error('You need to call AV.initialize before using AV.');
  }
  if (!path) {
    path = '';
  }
  if (!_.isString(path)) {
    throw new Error("Tried to get a localStorage path that wasn't a String.");
  }
  if (path[0] === '/') {
    path = path.substring(1);
  }
  return 'AV/' + AV.applicationId + '/' + path;
};

/**
 * Returns the unique string for this app on this machine.
 * Gets reset when localStorage is cleared.
 * @private
 */
AV._installationId = null;
AV._getInstallationId = () => {
  // See if it's cached in RAM.
  if (AV._installationId) {
    return Promise.resolve(AV._installationId);
  }

  // Try to get it from localStorage.
  const path = AV._getAVPath('installationId');
  return AV.localStorage.getItemAsync(path).then(_installationId => {
    AV._installationId = _installationId;
    if (!AV._installationId) {
      // It wasn't in localStorage, so create a new one.
      AV._installationId = _installationId = uuid();
      return AV.localStorage
        .setItemAsync(path, _installationId)
        .then(() => _installationId);
    }
    return _installationId;
  });
};

AV._subscriptionId = null;
AV._refreshSubscriptionId = (path = AV._getAVPath('subscriptionId')) => {
  const subscriptionId = (AV._subscriptionId = uuid());
  return AV.localStorage
    .setItemAsync(path, subscriptionId)
    .then(() => subscriptionId);
};
AV._getSubscriptionId = () => {
  // See if it's cached in RAM.
  if (AV._subscriptionId) {
    return Promise.resolve(AV._subscriptionId);
  }

  // Try to get it from localStorage.
  const path = AV._getAVPath('subscriptionId');
  return AV.localStorage.getItemAsync(path).then(_subscriptionId => {
    AV._subscriptionId = _subscriptionId;
    if (!AV._subscriptionId) {
      // It wasn't in localStorage, so create a new one.
      _subscriptionId = AV._refreshSubscriptionId(path);
    }
    return _subscriptionId;
  });
};

AV._parseDate = parseDate;

// A self-propagating extend function.
AV._extend = function(protoProps, classProps) {
  var child = inherits(this, protoProps, classProps);
  child.extend = this.extend;
  return child;
};

/**
 * Converts a value in a AV Object into the appropriate representation.
 * This is the JS equivalent of Java's AV.maybeReferenceAndEncode(Object)
 * if seenObjects is falsey. Otherwise any AV.Objects not in
 * seenObjects will be fully embedded rather than encoded
 * as a pointer.  This array will be used to prevent going into an infinite
 * loop because we have circular references.  If <seenObjects>
 * is set, then none of the AV Objects that are serialized can be dirty.
 * @private
 */
AV._encode = function(value, seenObjects, disallowObjects, full = true) {
  if (value instanceof AV.Object) {
    if (disallowObjects) {
      throw new Error('AV.Objects not allowed here');
    }
    if (!seenObjects || _.include(seenObjects, value) || !value._hasData) {
      return value._toPointer();
    }
    return value._toFullJSON(seenObjects.concat(value), full);
  }
  if (value instanceof AV.ACL) {
    return value.toJSON();
  }
  if (_.isDate(value)) {
    return full ? { __type: 'Date', iso: value.toJSON() } : value.toJSON();
  }
  if (value instanceof AV.GeoPoint) {
    return value.toJSON();
  }
  if (_.isArray(value)) {
    return _.map(value, function(x) {
      return AV._encode(x, seenObjects, disallowObjects, full);
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
      throw new Error('Tried to save an object containing an unsaved file.');
    }
    return value._toFullJSON(seenObjects, full);
  }
  if (_.isObject(value)) {
    return _.mapObject(value, (v, k) =>
      AV._encode(v, seenObjects, disallowObjects, full)
    );
  }
  return value;
};

/**
 * The inverse function of AV._encode.
 * @private
 */
AV._decode = function(value, key) {
  if (!_.isObject(value) || _.isDate(value)) {
    return value;
  }
  if (_.isArray(value)) {
    return _.map(value, v => AV._decode(v));
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
  if (value instanceof AV.GeoPoint) {
    return value;
  }
  if (value instanceof AV.ACL) {
    return value;
  }
  if (key === 'ACL') {
    return new AV.ACL(value);
  }
  if (value.__op) {
    return AV.Op._decode(value);
  }
  var className;
  if (value.__type === 'Pointer') {
    className = value.className;
    var pointer = AV.Object._create(className);
    if (Object.keys(value).length > 3) {
      const v = _.clone(value);
      delete v.__type;
      delete v.className;
      pointer._finishFetch(v, true);
    } else {
      pointer._finishFetch({ objectId: value.objectId }, false);
    }
    return pointer;
  }
  if (value.__type === 'Object') {
    // It's an Object included in a query result.
    className = value.className;
    const v = _.clone(value);
    delete v.__type;
    delete v.className;
    var object = AV.Object._create(className);
    object._finishFetch(v, true);
    return object;
  }
  if (value.__type === 'Date') {
    return AV._parseDate(value.iso);
  }
  if (value.__type === 'GeoPoint') {
    return new AV.GeoPoint({
      latitude: value.latitude,
      longitude: value.longitude,
    });
  }
  if (value.__type === 'Relation') {
    if (!key) throw new Error('key missing decoding a Relation');
    var relation = new AV.Relation(null, key);
    relation.targetClassName = value.className;
    return relation;
  }
  if (value.__type === 'File') {
    var file = new AV.File(value.name);
    const v = _.clone(value);
    delete v.__type;
    file._finishFetch(v);
    return file;
  }
  return _.mapObject(value, AV._decode);
};

/**
 * The inverse function of {@link AV.Object#toFullJSON}.
 * @since 3.0.0
 * @method
 * @param {Object}
 * return {AV.Object|AV.File|any}
 */
AV.parseJSON = AV._decode;

/**
 * Similar to JSON.parse, except that AV internal types will be used if possible.
 * Inverse to {@link AV.stringify}
 * @since 3.14.0
 * @param {string} text the string to parse.
 * @return {AV.Object|AV.File|any}
 */
AV.parse = text => AV.parseJSON(JSON.parse(text));
/**
 * Serialize a target containing AV.Object, similar to JSON.stringify.
 * Inverse to {@link AV.parse}
 * @since 3.14.0
 * @return {string}
 */
AV.stringify = target => JSON.stringify(AV._encode(target, [], false, true));

AV._encodeObjectOrArray = function(value) {
  var encodeAVObject = function(object) {
    if (object && object._toFullJSON) {
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
 * @private
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
 * @private
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

/**
 * @namespace
 * @since 3.14.0
 */
AV.debug = {
  /**
   * Enable debug
   */
  enable: (namespaces = 'leancloud*') => debug.enable(namespaces),
  /**
   * Disable debug
   */
  disable: debug.disable,
};

/**
 * Specify Adapters
 * @since 4.4.0
 * @function
 * @param {Adapters} newAdapters See {@link https://url.leanapp.cn/adapter-type-definitions @leancloud/adapter-types} for detailed definitions.
 */
AV.setAdapters = setAdapters;

module.exports = AV;

const _ = require('underscore');

// Helper function to check null or undefined.
const isNullOrUndefined = x => _.isNull(x) || _.isUndefined(x);

const ensureArray = target => {
  if (_.isArray(target)) {
    return target;
  }
  if (target === undefined || target === null) {
    return [];
  }
  return [target];
};

const transformFetchOptions = ({ keys, include, includeACL } = {}) => {
  const fetchOptions = {};
  if (keys) {
    fetchOptions.keys = ensureArray(keys).join(',');
  }
  if (include) {
    fetchOptions.include = ensureArray(include).join(',');
  }
  if (includeACL) {
    fetchOptions.returnACL = includeACL;
  }
  return fetchOptions;
};

const getSessionToken = authOptions => {
  if (authOptions.sessionToken) {
    return authOptions.sessionToken;
  }
  if (
    authOptions.user &&
    typeof authOptions.user.getSessionToken === 'function'
  ) {
    return authOptions.user.getSessionToken();
  }
};

const tap = interceptor => value => (interceptor(value), value);

// Shared empty constructor function to aid in prototype-chain creation.
const EmptyConstructor = function() {};

// Helper function to correctly set up the prototype chain, for subclasses.
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
const inherits = function inherits(parent, protoProps, staticProps) {
  var child;

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  if (protoProps && protoProps.hasOwnProperty('constructor')) {
    child = protoProps.constructor;
  } else {
    /** @ignore */
    child = function() {
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

// Suppress the date string format warning in Weixin DevTools
// Link: https://developers.weixin.qq.com/community/minihome/doc/00080c6f244718053550067736b401
const parseDate =
  typeof wx === 'undefined'
    ? iso8601 => new Date(iso8601)
    : iso8601 => new Date(Date.parse(iso8601));

const setValue = (target, key, value) => {
  // '.' is not allowed in Class keys, escaping is not in concern now.
  const segs = key.split('.');
  const lastSeg = segs.pop();
  let currentTarget = target;
  segs.forEach(seg => {
    if (currentTarget[seg] === undefined) currentTarget[seg] = {};
    currentTarget = currentTarget[seg];
  });
  currentTarget[lastSeg] = value;
  return target;
};

const findValue = (target, key) => {
  const segs = key.split('.');
  const firstSeg = segs[0];
  const lastSeg = segs.pop();
  let currentTarget = target;
  for (let i = 0; i < segs.length; i++) {
    currentTarget = currentTarget[segs[i]];
    if (currentTarget === undefined) {
      return [undefined, undefined, lastSeg];
    }
  }
  const value = currentTarget[lastSeg];
  return [value, currentTarget, lastSeg, firstSeg];
};

const isPlainObject = obj =>
  _.isObject(obj) && Object.getPrototypeOf(obj) === Object.prototype;

const continueWhile = function(predicate, asyncFunction) {
  if (predicate()) {
    return asyncFunction().then(function() {
      return continueWhile(predicate, asyncFunction);
    });
  }
  return Promise.resolve();
};

module.exports = {
  isNullOrUndefined,
  ensureArray,
  transformFetchOptions,
  getSessionToken,
  tap,
  inherits,
  parseDate,
  setValue,
  findValue,
  isPlainObject,
  continueWhile,
};

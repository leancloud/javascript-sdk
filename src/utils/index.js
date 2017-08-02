const _ = require('underscore');
const request = require('superagent');
const debug = require('debug')('leancloud:request');
const Promise = require('../promise');

let requestsCount = 0;

const ajax = ({ method, url, query, data, headers = {}, onprogress }) => {
  const count = requestsCount++;

  debug(`request(${count})`, method, url, query, data, headers);

  const flattenedQuery = {};
  if (query) {
    for (const k in query) {
      if (typeof query[k] === 'object') {
        flattenedQuery[k] = JSON.stringify(query[k]);
      } else {
        flattenedQuery[k] = query[k];
      }
    }
  }

  return new Promise((resolve, reject) => {
    const req = request(method, url)
      .set(headers)
      .query(flattenedQuery)
      .send(data);
    if (onprogress) {
      req.on('progress', onprogress);
    }
    req.end((err, res) => {
      if (res) {
        debug(`response(${count})`, res.status, res.body || res.text, res.header);
      }
      if (err) {
        if (res) {
          err.statusCode = res.status;
          err.responseText = res.text;
          err.response = res.body;
        }
        return reject(err);
      }
      return resolve(res.body);
    });
  });
};


// Helper function to check null or undefined.
const isNullOrUndefined = (x) => _.isNull(x) || _.isUndefined(x);

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

const getSessionToken = (authOptions) => {
  if (authOptions.sessionToken) {
    return authOptions.sessionToken;
  }
  if (
    authOptions.user && typeof authOptions.user.getSessionToken === 'function'
  ) {
    return authOptions.user.getSessionToken();
  }
};

const tap = interceptor => value => ((interceptor(value), value));

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
    child = function(){ parent.apply(this, arguments); };
  }

  // Inherit class (static) properties from parent.
  for (const prop of Object.getOwnPropertyNames(parent)) {
    const propertyDescriptor = Object.getOwnPropertyDescriptor(parent, prop);
    Object.defineProperty(child, prop, propertyDescriptor);
  }

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

function parseDate(iso8601) {
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
}

module.exports = {
  ajax,
  isNullOrUndefined,
  ensureArray,
  transformFetchOptions,
  getSessionToken,
  tap,
  inherits,
  parseDate,
};

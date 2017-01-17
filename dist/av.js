"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

(function (f) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }g.AV = f();
  }
})(function () {
  var define, module, exports;return function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
        }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
          var n = t[o][1][e];return s(n ? n : e);
        }, l, l.exports, e, t, n, r);
      }return n[o].exports;
    }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
      s(r[o]);
    }return s;
  }({ 1: [function (require, module, exports) {}, {}], 2: [function (require, module, exports) {
      var charenc = {
        // UTF-8 encoding
        utf8: {
          // Convert a string to a byte array
          stringToBytes: function stringToBytes(str) {
            return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
          },

          // Convert a byte array to a string
          bytesToString: function bytesToString(bytes) {
            return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
          }
        },

        // Binary encoding
        bin: {
          // Convert a string to a byte array
          stringToBytes: function stringToBytes(str) {
            for (var bytes = [], i = 0; i < str.length; i++) {
              bytes.push(str.charCodeAt(i) & 0xFF);
            }return bytes;
          },

          // Convert a byte array to a string
          bytesToString: function bytesToString(bytes) {
            for (var str = [], i = 0; i < bytes.length; i++) {
              str.push(String.fromCharCode(bytes[i]));
            }return str.join('');
          }
        }
      };

      module.exports = charenc;
    }, {}], 3: [function (require, module, exports) {

      /**
       * Expose `Emitter`.
       */

      if (typeof module !== 'undefined') {
        module.exports = Emitter;
      }

      /**
       * Initialize a new `Emitter`.
       *
       * @api public
       */

      function Emitter(obj) {
        if (obj) return mixin(obj);
      };

      /**
       * Mixin the emitter properties.
       *
       * @param {Object} obj
       * @return {Object}
       * @api private
       */

      function mixin(obj) {
        for (var key in Emitter.prototype) {
          obj[key] = Emitter.prototype[key];
        }
        return obj;
      }

      /**
       * Listen on the given `event` with `fn`.
       *
       * @param {String} event
       * @param {Function} fn
       * @return {Emitter}
       * @api public
       */

      Emitter.prototype.on = Emitter.prototype.addEventListener = function (event, fn) {
        this._callbacks = this._callbacks || {};
        (this._callbacks['$' + event] = this._callbacks['$' + event] || []).push(fn);
        return this;
      };

      /**
       * Adds an `event` listener that will be invoked a single
       * time then automatically removed.
       *
       * @param {String} event
       * @param {Function} fn
       * @return {Emitter}
       * @api public
       */

      Emitter.prototype.once = function (event, fn) {
        function on() {
          this.off(event, on);
          fn.apply(this, arguments);
        }

        on.fn = fn;
        this.on(event, on);
        return this;
      };

      /**
       * Remove the given callback for `event` or all
       * registered callbacks.
       *
       * @param {String} event
       * @param {Function} fn
       * @return {Emitter}
       * @api public
       */

      Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function (event, fn) {
        this._callbacks = this._callbacks || {};

        // all
        if (0 == arguments.length) {
          this._callbacks = {};
          return this;
        }

        // specific event
        var callbacks = this._callbacks['$' + event];
        if (!callbacks) return this;

        // remove all handlers
        if (1 == arguments.length) {
          delete this._callbacks['$' + event];
          return this;
        }

        // remove specific handler
        var cb;
        for (var i = 0; i < callbacks.length; i++) {
          cb = callbacks[i];
          if (cb === fn || cb.fn === fn) {
            callbacks.splice(i, 1);
            break;
          }
        }
        return this;
      };

      /**
       * Emit `event` with the given args.
       *
       * @param {String} event
       * @param {Mixed} ...
       * @return {Emitter}
       */

      Emitter.prototype.emit = function (event) {
        this._callbacks = this._callbacks || {};
        var args = [].slice.call(arguments, 1),
            callbacks = this._callbacks['$' + event];

        if (callbacks) {
          callbacks = callbacks.slice(0);
          for (var i = 0, len = callbacks.length; i < len; ++i) {
            callbacks[i].apply(this, args);
          }
        }

        return this;
      };

      /**
       * Return array of callbacks for `event`.
       *
       * @param {String} event
       * @return {Array}
       * @api public
       */

      Emitter.prototype.listeners = function (event) {
        this._callbacks = this._callbacks || {};
        return this._callbacks['$' + event] || [];
      };

      /**
       * Check if this emitter has `event` handlers.
       *
       * @param {String} event
       * @return {Boolean}
       * @api public
       */

      Emitter.prototype.hasListeners = function (event) {
        return !!this.listeners(event).length;
      };
    }, {}], 4: [function (require, module, exports) {
      (function () {
        var base64map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
            crypt = {
          // Bit-wise rotation left
          rotl: function rotl(n, b) {
            return n << b | n >>> 32 - b;
          },

          // Bit-wise rotation right
          rotr: function rotr(n, b) {
            return n << 32 - b | n >>> b;
          },

          // Swap big-endian to little-endian and vice versa
          endian: function endian(n) {
            // If number given, swap endian
            if (n.constructor == Number) {
              return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
            }

            // Else, assume array and swap all items
            for (var i = 0; i < n.length; i++) {
              n[i] = crypt.endian(n[i]);
            }return n;
          },

          // Generate an array of any length of random bytes
          randomBytes: function randomBytes(n) {
            for (var bytes = []; n > 0; n--) {
              bytes.push(Math.floor(Math.random() * 256));
            }return bytes;
          },

          // Convert a byte array to big-endian 32-bit words
          bytesToWords: function bytesToWords(bytes) {
            for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8) {
              words[b >>> 5] |= bytes[i] << 24 - b % 32;
            }return words;
          },

          // Convert big-endian 32-bit words to a byte array
          wordsToBytes: function wordsToBytes(words) {
            for (var bytes = [], b = 0; b < words.length * 32; b += 8) {
              bytes.push(words[b >>> 5] >>> 24 - b % 32 & 0xFF);
            }return bytes;
          },

          // Convert a byte array to a hex string
          bytesToHex: function bytesToHex(bytes) {
            for (var hex = [], i = 0; i < bytes.length; i++) {
              hex.push((bytes[i] >>> 4).toString(16));
              hex.push((bytes[i] & 0xF).toString(16));
            }
            return hex.join('');
          },

          // Convert a hex string to a byte array
          hexToBytes: function hexToBytes(hex) {
            for (var bytes = [], c = 0; c < hex.length; c += 2) {
              bytes.push(parseInt(hex.substr(c, 2), 16));
            }return bytes;
          },

          // Convert a byte array to a base-64 string
          bytesToBase64: function bytesToBase64(bytes) {
            for (var base64 = [], i = 0; i < bytes.length; i += 3) {
              var triplet = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
              for (var j = 0; j < 4; j++) {
                if (i * 8 + j * 6 <= bytes.length * 8) base64.push(base64map.charAt(triplet >>> 6 * (3 - j) & 0x3F));else base64.push('=');
              }
            }
            return base64.join('');
          },

          // Convert a base-64 string to a byte array
          base64ToBytes: function base64ToBytes(base64) {
            // Remove non-base-64 characters
            base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

            for (var bytes = [], i = 0, imod4 = 0; i < base64.length; imod4 = ++i % 4) {
              if (imod4 == 0) continue;
              bytes.push((base64map.indexOf(base64.charAt(i - 1)) & Math.pow(2, -2 * imod4 + 8) - 1) << imod4 * 2 | base64map.indexOf(base64.charAt(i)) >>> 6 - imod4 * 2);
            }
            return bytes;
          }
        };

        module.exports = crypt;
      })();
    }, {}], 5: [function (require, module, exports) {
      /**
       * Helpers.
       */

      var s = 1000;
      var m = s * 60;
      var h = m * 60;
      var d = h * 24;
      var y = d * 365.25;

      /**
       * Parse or format the given `val`.
       *
       * Options:
       *
       *  - `long` verbose formatting [false]
       *
       * @param {String|Number} val
       * @param {Object} options
       * @throws {Error} throw an error if val is not a non-empty string or a number
       * @return {String|Number}
       * @api public
       */

      module.exports = function (val, options) {
        options = options || {};
        var type = typeof val === "undefined" ? "undefined" : _typeof(val);
        if (type === 'string' && val.length > 0) {
          return parse(val);
        } else if (type === 'number' && isNaN(val) === false) {
          return options.long ? fmtLong(val) : fmtShort(val);
        }
        throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val));
      };

      /**
       * Parse the given `str` and return milliseconds.
       *
       * @param {String} str
       * @return {Number}
       * @api private
       */

      function parse(str) {
        str = String(str);
        if (str.length > 10000) {
          return;
        }
        var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
        if (!match) {
          return;
        }
        var n = parseFloat(match[1]);
        var type = (match[2] || 'ms').toLowerCase();
        switch (type) {
          case 'years':
          case 'year':
          case 'yrs':
          case 'yr':
          case 'y':
            return n * y;
          case 'days':
          case 'day':
          case 'd':
            return n * d;
          case 'hours':
          case 'hour':
          case 'hrs':
          case 'hr':
          case 'h':
            return n * h;
          case 'minutes':
          case 'minute':
          case 'mins':
          case 'min':
          case 'm':
            return n * m;
          case 'seconds':
          case 'second':
          case 'secs':
          case 'sec':
          case 's':
            return n * s;
          case 'milliseconds':
          case 'millisecond':
          case 'msecs':
          case 'msec':
          case 'ms':
            return n;
          default:
            return undefined;
        }
      }

      /**
       * Short format for `ms`.
       *
       * @param {Number} ms
       * @return {String}
       * @api private
       */

      function fmtShort(ms) {
        if (ms >= d) {
          return Math.round(ms / d) + 'd';
        }
        if (ms >= h) {
          return Math.round(ms / h) + 'h';
        }
        if (ms >= m) {
          return Math.round(ms / m) + 'm';
        }
        if (ms >= s) {
          return Math.round(ms / s) + 's';
        }
        return ms + 'ms';
      }

      /**
       * Long format for `ms`.
       *
       * @param {Number} ms
       * @return {String}
       * @api private
       */

      function fmtLong(ms) {
        return plural(ms, d, 'day') || plural(ms, h, 'hour') || plural(ms, m, 'minute') || plural(ms, s, 'second') || ms + ' ms';
      }

      /**
       * Pluralization helper.
       */

      function plural(ms, n, name) {
        if (ms < n) {
          return;
        }
        if (ms < n * 1.5) {
          return Math.floor(ms / n) + ' ' + name;
        }
        return Math.ceil(ms / n) + ' ' + name + 's';
      }
    }, {}], 6: [function (require, module, exports) {
      (function (process) {
        /**
         * This is the web browser implementation of `debug()`.
         *
         * Expose `debug()` as the module.
         */

        exports = module.exports = require('./debug');
        exports.log = log;
        exports.formatArgs = formatArgs;
        exports.save = save;
        exports.load = load;
        exports.useColors = useColors;
        exports.storage = 'undefined' != typeof chrome && 'undefined' != typeof chrome.storage ? chrome.storage.local : localstorage();

        /**
         * Colors.
         */

        exports.colors = ['lightseagreen', 'forestgreen', 'goldenrod', 'dodgerblue', 'darkorchid', 'crimson'];

        /**
         * Currently only WebKit-based Web Inspectors, Firefox >= v31,
         * and the Firebug extension (any Firefox version) are known
         * to support "%c" CSS customizations.
         *
         * TODO: add a `localStorage` variable to explicitly enable/disable colors
         */

        function useColors() {
          // NB: In an Electron preload script, document will be defined but not fully
          // initialized. Since we know we're in Chrome, we'll just detect this case
          // explicitly
          if (typeof window !== 'undefined' && window && typeof window.process !== 'undefined' && window.process.type === 'renderer') {
            return true;
          }

          // is webkit? http://stackoverflow.com/a/16459606/376773
          // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
          return typeof document !== 'undefined' && document && 'WebkitAppearance' in document.documentElement.style ||
          // is firebug? http://stackoverflow.com/a/398120/376773
          typeof window !== 'undefined' && window && window.console && (console.firebug || console.exception && console.table) ||
          // is firefox >= v31?
          // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
          typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 ||
          // double check webkit in userAgent just in case we are in a worker
          typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
        }

        /**
         * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
         */

        exports.formatters.j = function (v) {
          try {
            return JSON.stringify(v);
          } catch (err) {
            return '[UnexpectedJSONParseError]: ' + err.message;
          }
        };

        /**
         * Colorize log arguments if enabled.
         *
         * @api public
         */

        function formatArgs(args) {
          var useColors = this.useColors;

          args[0] = (useColors ? '%c' : '') + this.namespace + (useColors ? ' %c' : ' ') + args[0] + (useColors ? '%c ' : ' ') + '+' + exports.humanize(this.diff);

          if (!useColors) return;

          var c = 'color: ' + this.color;
          args.splice(1, 0, c, 'color: inherit');

          // the final "%c" is somewhat tricky, because there could be other
          // arguments passed either before or after the %c, so we need to
          // figure out the correct index to insert the CSS into
          var index = 0;
          var lastC = 0;
          args[0].replace(/%[a-zA-Z%]/g, function (match) {
            if ('%%' === match) return;
            index++;
            if ('%c' === match) {
              // we only are interested in the *last* %c
              // (the user may have provided their own)
              lastC = index;
            }
          });

          args.splice(lastC, 0, c);
        }

        /**
         * Invokes `console.log()` when available.
         * No-op when `console.log` is not a "function".
         *
         * @api public
         */

        function log() {
          // this hackery is required for IE8/9, where
          // the `console.log` function doesn't have 'apply'
          return 'object' === (typeof console === "undefined" ? "undefined" : _typeof(console)) && console.log && Function.prototype.apply.call(console.log, console, arguments);
        }

        /**
         * Save `namespaces`.
         *
         * @param {String} namespaces
         * @api private
         */

        function save(namespaces) {
          try {
            if (null == namespaces) {
              exports.storage.removeItem('debug');
            } else {
              exports.storage.debug = namespaces;
            }
          } catch (e) {}
        }

        /**
         * Load `namespaces`.
         *
         * @return {String} returns the previously persisted debug modes
         * @api private
         */

        function load() {
          try {
            return exports.storage.debug;
          } catch (e) {}

          // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
          if (typeof process !== 'undefined' && 'env' in process) {
            return process.env.DEBUG;
          }
        }

        /**
         * Enable namespaces listed in `localStorage.debug` initially.
         */

        exports.enable(load());

        /**
         * Localstorage attempts to return the localstorage.
         *
         * This is necessary because safari throws
         * when a user disables cookies/localstorage
         * and you attempt to access it.
         *
         * @return {LocalStorage}
         * @api private
         */

        function localstorage() {
          try {
            return window.localStorage;
          } catch (e) {}
        }
      }).call(this, require('_process'));
    }, { "./debug": 7, "_process": 11 }], 7: [function (require, module, exports) {

      /**
       * This is the common logic for both the Node.js and web browser
       * implementations of `debug()`.
       *
       * Expose `debug()` as the module.
       */

      exports = module.exports = createDebug.debug = createDebug.default = createDebug;
      exports.coerce = coerce;
      exports.disable = disable;
      exports.enable = enable;
      exports.enabled = enabled;
      exports.humanize = require('ms');

      /**
       * The currently active debug mode names, and names to skip.
       */

      exports.names = [];
      exports.skips = [];

      /**
       * Map of special "%n" handling functions, for the debug "format" argument.
       *
       * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
       */

      exports.formatters = {};

      /**
       * Previous log timestamp.
       */

      var prevTime;

      /**
       * Select a color.
       * @param {String} namespace
       * @return {Number}
       * @api private
       */

      function selectColor(namespace) {
        var hash = 0,
            i;

        for (i in namespace) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i);
          hash |= 0; // Convert to 32bit integer
        }

        return exports.colors[Math.abs(hash) % exports.colors.length];
      }

      /**
       * Create a debugger with the given `namespace`.
       *
       * @param {String} namespace
       * @return {Function}
       * @api public
       */

      function createDebug(namespace) {

        function debug() {
          // disabled?
          if (!debug.enabled) return;

          var self = debug;

          // set `diff` timestamp
          var curr = +new Date();
          var ms = curr - (prevTime || curr);
          self.diff = ms;
          self.prev = prevTime;
          self.curr = curr;
          prevTime = curr;

          // turn the `arguments` into a proper Array
          var args = new Array(arguments.length);
          for (var i = 0; i < args.length; i++) {
            args[i] = arguments[i];
          }

          args[0] = exports.coerce(args[0]);

          if ('string' !== typeof args[0]) {
            // anything else let's inspect with %O
            args.unshift('%O');
          }

          // apply any `formatters` transformations
          var index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, function (match, format) {
            // if we encounter an escaped % then don't increase the array index
            if (match === '%%') return match;
            index++;
            var formatter = exports.formatters[format];
            if ('function' === typeof formatter) {
              var val = args[index];
              match = formatter.call(self, val);

              // now we need to remove `args[index]` since it's inlined in the `format`
              args.splice(index, 1);
              index--;
            }
            return match;
          });

          // apply env-specific formatting (colors, etc.)
          exports.formatArgs.call(self, args);

          var logFn = debug.log || exports.log || console.log.bind(console);
          logFn.apply(self, args);
        }

        debug.namespace = namespace;
        debug.enabled = exports.enabled(namespace);
        debug.useColors = exports.useColors();
        debug.color = selectColor(namespace);

        // env-specific initialization logic for debug instances
        if ('function' === typeof exports.init) {
          exports.init(debug);
        }

        return debug;
      }

      /**
       * Enables a debug mode by namespaces. This can include modes
       * separated by a colon and wildcards.
       *
       * @param {String} namespaces
       * @api public
       */

      function enable(namespaces) {
        exports.save(namespaces);

        var split = (namespaces || '').split(/[\s,]+/);
        var len = split.length;

        for (var i = 0; i < len; i++) {
          if (!split[i]) continue; // ignore empty strings
          namespaces = split[i].replace(/\*/g, '.*?');
          if (namespaces[0] === '-') {
            exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
          } else {
            exports.names.push(new RegExp('^' + namespaces + '$'));
          }
        }
      }

      /**
       * Disable debug output.
       *
       * @api public
       */

      function disable() {
        exports.enable('');
      }

      /**
       * Returns true if the given mode name is enabled, false otherwise.
       *
       * @param {String} name
       * @return {Boolean}
       * @api public
       */

      function enabled(name) {
        var i, len;
        for (i = 0, len = exports.skips.length; i < len; i++) {
          if (exports.skips[i].test(name)) {
            return false;
          }
        }
        for (i = 0, len = exports.names.length; i < len; i++) {
          if (exports.names[i].test(name)) {
            return true;
          }
        }
        return false;
      }

      /**
       * Coerce `val`.
       *
       * @param {Mixed} val
       * @return {Mixed}
       * @api private
       */

      function coerce(val) {
        if (val instanceof Error) return val.stack || val.message;
        return val;
      }
    }, { "ms": 5 }], 8: [function (require, module, exports) {
      /*!
       * Determine if an object is a Buffer
       *
       * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
       * @license  MIT
       */

      // The _isBuffer check is for Safari 5-7 support, because it's missing
      // Object.prototype.constructor. Remove this eventually
      module.exports = function (obj) {
        return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer);
      };

      function isBuffer(obj) {
        return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj);
      }

      // For Node v0.10 support. Remove this eventually.
      function isSlowBuffer(obj) {
        return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0));
      }
    }, {}], 9: [function (require, module, exports) {
      (function (root) {
        var localStorageMemory = {};
        var cache = {};

        /**
         * number of stored items.
         */
        localStorageMemory.length = 0;

        /**
         * returns item for passed key, or null
         *
         * @para {String} key
         *       name of item to be returned
         * @returns {String|null}
         */
        localStorageMemory.getItem = function (key) {
          return cache[key] || null;
        };

        /**
         * sets item for key to passed value, as String
         *
         * @para {String} key
         *       name of item to be set
         * @para {String} value
         *       value, will always be turned into a String
         * @returns {undefined}
         */
        localStorageMemory.setItem = function (key, value) {
          if (typeof value === 'undefined') {
            localStorageMemory.removeItem(key);
          } else {
            if (!cache.hasOwnProperty(key)) {
              localStorageMemory.length++;
            }

            cache[key] = '' + value;
          }
        };

        /**
         * removes item for passed key
         *
         * @para {String} key
         *       name of item to be removed
         * @returns {undefined}
         */
        localStorageMemory.removeItem = function (key) {
          if (cache.hasOwnProperty(key)) {
            delete cache[key];
            localStorageMemory.length--;
          }
        };

        /**
         * returns name of key at passed index
         *
         * @para {Number} index
         *       Position for key to be returned (starts at 0)
         * @returns {String|null}
         */
        localStorageMemory.key = function (index) {
          return Object.keys(cache)[index] || null;
        };

        /**
         * removes all stored items and sets length to 0
         *
         * @returns {undefined}
         */
        localStorageMemory.clear = function () {
          cache = {};
          localStorageMemory.length = 0;
        };

        if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object') {
          module.exports = localStorageMemory;
        } else {
          root.localStorageMemory = localStorageMemory;
        }
      })(this);
    }, {}], 10: [function (require, module, exports) {
      (function () {
        var crypt = require('crypt'),
            utf8 = require('charenc').utf8,
            isBuffer = require('is-buffer'),
            bin = require('charenc').bin,


        // The core
        md5 = function md5(message, options) {
          // Convert to byte array
          if (message.constructor == String) {
            if (options && options.encoding === 'binary') message = bin.stringToBytes(message);else message = utf8.stringToBytes(message);
          } else if (isBuffer(message)) message = Array.prototype.slice.call(message, 0);else if (!Array.isArray(message)) message = message.toString();
          // else, assume byte array already

          var m = crypt.bytesToWords(message),
              l = message.length * 8,
              a = 1732584193,
              b = -271733879,
              c = -1732584194,
              d = 271733878;

          // Swap endian
          for (var i = 0; i < m.length; i++) {
            m[i] = (m[i] << 8 | m[i] >>> 24) & 0x00FF00FF | (m[i] << 24 | m[i] >>> 8) & 0xFF00FF00;
          }

          // Padding
          m[l >>> 5] |= 0x80 << l % 32;
          m[(l + 64 >>> 9 << 4) + 14] = l;

          // Method shortcuts
          var FF = md5._ff,
              GG = md5._gg,
              HH = md5._hh,
              II = md5._ii;

          for (var i = 0; i < m.length; i += 16) {

            var aa = a,
                bb = b,
                cc = c,
                dd = d;

            a = FF(a, b, c, d, m[i + 0], 7, -680876936);
            d = FF(d, a, b, c, m[i + 1], 12, -389564586);
            c = FF(c, d, a, b, m[i + 2], 17, 606105819);
            b = FF(b, c, d, a, m[i + 3], 22, -1044525330);
            a = FF(a, b, c, d, m[i + 4], 7, -176418897);
            d = FF(d, a, b, c, m[i + 5], 12, 1200080426);
            c = FF(c, d, a, b, m[i + 6], 17, -1473231341);
            b = FF(b, c, d, a, m[i + 7], 22, -45705983);
            a = FF(a, b, c, d, m[i + 8], 7, 1770035416);
            d = FF(d, a, b, c, m[i + 9], 12, -1958414417);
            c = FF(c, d, a, b, m[i + 10], 17, -42063);
            b = FF(b, c, d, a, m[i + 11], 22, -1990404162);
            a = FF(a, b, c, d, m[i + 12], 7, 1804603682);
            d = FF(d, a, b, c, m[i + 13], 12, -40341101);
            c = FF(c, d, a, b, m[i + 14], 17, -1502002290);
            b = FF(b, c, d, a, m[i + 15], 22, 1236535329);

            a = GG(a, b, c, d, m[i + 1], 5, -165796510);
            d = GG(d, a, b, c, m[i + 6], 9, -1069501632);
            c = GG(c, d, a, b, m[i + 11], 14, 643717713);
            b = GG(b, c, d, a, m[i + 0], 20, -373897302);
            a = GG(a, b, c, d, m[i + 5], 5, -701558691);
            d = GG(d, a, b, c, m[i + 10], 9, 38016083);
            c = GG(c, d, a, b, m[i + 15], 14, -660478335);
            b = GG(b, c, d, a, m[i + 4], 20, -405537848);
            a = GG(a, b, c, d, m[i + 9], 5, 568446438);
            d = GG(d, a, b, c, m[i + 14], 9, -1019803690);
            c = GG(c, d, a, b, m[i + 3], 14, -187363961);
            b = GG(b, c, d, a, m[i + 8], 20, 1163531501);
            a = GG(a, b, c, d, m[i + 13], 5, -1444681467);
            d = GG(d, a, b, c, m[i + 2], 9, -51403784);
            c = GG(c, d, a, b, m[i + 7], 14, 1735328473);
            b = GG(b, c, d, a, m[i + 12], 20, -1926607734);

            a = HH(a, b, c, d, m[i + 5], 4, -378558);
            d = HH(d, a, b, c, m[i + 8], 11, -2022574463);
            c = HH(c, d, a, b, m[i + 11], 16, 1839030562);
            b = HH(b, c, d, a, m[i + 14], 23, -35309556);
            a = HH(a, b, c, d, m[i + 1], 4, -1530992060);
            d = HH(d, a, b, c, m[i + 4], 11, 1272893353);
            c = HH(c, d, a, b, m[i + 7], 16, -155497632);
            b = HH(b, c, d, a, m[i + 10], 23, -1094730640);
            a = HH(a, b, c, d, m[i + 13], 4, 681279174);
            d = HH(d, a, b, c, m[i + 0], 11, -358537222);
            c = HH(c, d, a, b, m[i + 3], 16, -722521979);
            b = HH(b, c, d, a, m[i + 6], 23, 76029189);
            a = HH(a, b, c, d, m[i + 9], 4, -640364487);
            d = HH(d, a, b, c, m[i + 12], 11, -421815835);
            c = HH(c, d, a, b, m[i + 15], 16, 530742520);
            b = HH(b, c, d, a, m[i + 2], 23, -995338651);

            a = II(a, b, c, d, m[i + 0], 6, -198630844);
            d = II(d, a, b, c, m[i + 7], 10, 1126891415);
            c = II(c, d, a, b, m[i + 14], 15, -1416354905);
            b = II(b, c, d, a, m[i + 5], 21, -57434055);
            a = II(a, b, c, d, m[i + 12], 6, 1700485571);
            d = II(d, a, b, c, m[i + 3], 10, -1894986606);
            c = II(c, d, a, b, m[i + 10], 15, -1051523);
            b = II(b, c, d, a, m[i + 1], 21, -2054922799);
            a = II(a, b, c, d, m[i + 8], 6, 1873313359);
            d = II(d, a, b, c, m[i + 15], 10, -30611744);
            c = II(c, d, a, b, m[i + 6], 15, -1560198380);
            b = II(b, c, d, a, m[i + 13], 21, 1309151649);
            a = II(a, b, c, d, m[i + 4], 6, -145523070);
            d = II(d, a, b, c, m[i + 11], 10, -1120210379);
            c = II(c, d, a, b, m[i + 2], 15, 718787259);
            b = II(b, c, d, a, m[i + 9], 21, -343485551);

            a = a + aa >>> 0;
            b = b + bb >>> 0;
            c = c + cc >>> 0;
            d = d + dd >>> 0;
          }

          return crypt.endian([a, b, c, d]);
        };

        // Auxiliary functions
        md5._ff = function (a, b, c, d, x, s, t) {
          var n = a + (b & c | ~b & d) + (x >>> 0) + t;
          return (n << s | n >>> 32 - s) + b;
        };
        md5._gg = function (a, b, c, d, x, s, t) {
          var n = a + (b & d | c & ~d) + (x >>> 0) + t;
          return (n << s | n >>> 32 - s) + b;
        };
        md5._hh = function (a, b, c, d, x, s, t) {
          var n = a + (b ^ c ^ d) + (x >>> 0) + t;
          return (n << s | n >>> 32 - s) + b;
        };
        md5._ii = function (a, b, c, d, x, s, t) {
          var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
          return (n << s | n >>> 32 - s) + b;
        };

        // Package private blocksize
        md5._blocksize = 16;
        md5._digestsize = 16;

        module.exports = function (message, options) {
          if (message === undefined || message === null) throw new Error('Illegal argument ' + message);

          var digestbytes = crypt.wordsToBytes(md5(message, options));
          return options && options.asBytes ? digestbytes : options && options.asString ? bin.bytesToString(digestbytes) : crypt.bytesToHex(digestbytes);
        };
      })();
    }, { "charenc": 2, "crypt": 4, "is-buffer": 8 }], 11: [function (require, module, exports) {
      // shim for using process in browser
      var process = module.exports = {};

      // cached from whatever global is present so that test runners that stub it
      // don't break things.  But we need to wrap it in a try catch in case it is
      // wrapped in strict mode code which doesn't define any globals.  It's inside a
      // function because try/catches deoptimize in certain engines.

      var cachedSetTimeout;
      var cachedClearTimeout;

      function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
      }
      function defaultClearTimeout() {
        throw new Error('clearTimeout has not been defined');
      }
      (function () {
        try {
          if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
          } else {
            cachedSetTimeout = defaultSetTimout;
          }
        } catch (e) {
          cachedSetTimeout = defaultSetTimout;
        }
        try {
          if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
          } else {
            cachedClearTimeout = defaultClearTimeout;
          }
        } catch (e) {
          cachedClearTimeout = defaultClearTimeout;
        }
      })();
      function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
          //normal enviroments in sane situations
          return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
        }
        try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedSetTimeout(fun, 0);
        } catch (e) {
          try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
          } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
          }
        }
      }
      function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
          //normal enviroments in sane situations
          return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
        }
        try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedClearTimeout(marker);
        } catch (e) {
          try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
          } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
          }
        }
      }
      var queue = [];
      var draining = false;
      var currentQueue;
      var queueIndex = -1;

      function cleanUpNextTick() {
        if (!draining || !currentQueue) {
          return;
        }
        draining = false;
        if (currentQueue.length) {
          queue = currentQueue.concat(queue);
        } else {
          queueIndex = -1;
        }
        if (queue.length) {
          drainQueue();
        }
      }

      function drainQueue() {
        if (draining) {
          return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;

        var len = queue.length;
        while (len) {
          currentQueue = queue;
          queue = [];
          while (++queueIndex < len) {
            if (currentQueue) {
              currentQueue[queueIndex].run();
            }
          }
          queueIndex = -1;
          len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
      }

      process.nextTick = function (fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
          }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
        }
      };

      // v8 likes predictible objects
      function Item(fun, array) {
        this.fun = fun;
        this.array = array;
      }
      Item.prototype.run = function () {
        this.fun.apply(null, this.array);
      };
      process.title = 'browser';
      process.browser = true;
      process.env = {};
      process.argv = [];
      process.version = ''; // empty string to avoid regexp issues
      process.versions = {};

      function noop() {}

      process.on = noop;
      process.addListener = noop;
      process.once = noop;
      process.off = noop;
      process.removeListener = noop;
      process.removeAllListeners = noop;
      process.emit = noop;

      process.binding = function (name) {
        throw new Error('process.binding is not supported');
      };

      process.cwd = function () {
        return '/';
      };
      process.chdir = function (dir) {
        throw new Error('process.chdir is not supported');
      };
      process.umask = function () {
        return 0;
      };
    }, {}], 12: [function (require, module, exports) {
      /**
       * Root reference for iframes.
       */

      var root;
      if (typeof window !== 'undefined') {
        // Browser window
        root = window;
      } else if (typeof self !== 'undefined') {
        // Web Worker
        root = self;
      } else {
        // Other environments
        console.warn("Using browser-only version of superagent in non-browser environment");
        root = this;
      }

      var Emitter = require('emitter');
      var RequestBase = require('./request-base');
      var isObject = require('./is-object');
      var isFunction = require('./is-function');
      var ResponseBase = require('./response-base');

      /**
       * Noop.
       */

      function noop() {};

      /**
       * Expose `request`.
       */

      var request = exports = module.exports = function (method, url) {
        // callback
        if ('function' == typeof url) {
          return new exports.Request('GET', method).end(url);
        }

        // url first
        if (1 == arguments.length) {
          return new exports.Request('GET', method);
        }

        return new exports.Request(method, url);
      };

      exports.Request = Request;

      /**
       * Determine XHR.
       */

      request.getXHR = function () {
        if (root.XMLHttpRequest && (!root.location || 'file:' != root.location.protocol || !root.ActiveXObject)) {
          return new XMLHttpRequest();
        } else {
          try {
            return new ActiveXObject('Microsoft.XMLHTTP');
          } catch (e) {}
          try {
            return new ActiveXObject('Msxml2.XMLHTTP.6.0');
          } catch (e) {}
          try {
            return new ActiveXObject('Msxml2.XMLHTTP.3.0');
          } catch (e) {}
          try {
            return new ActiveXObject('Msxml2.XMLHTTP');
          } catch (e) {}
        }
        throw Error("Browser-only verison of superagent could not find XHR");
      };

      /**
       * Removes leading and trailing whitespace, added to support IE.
       *
       * @param {String} s
       * @return {String}
       * @api private
       */

      var trim = ''.trim ? function (s) {
        return s.trim();
      } : function (s) {
        return s.replace(/(^\s*|\s*$)/g, '');
      };

      /**
       * Serialize the given `obj`.
       *
       * @param {Object} obj
       * @return {String}
       * @api private
       */

      function serialize(obj) {
        if (!isObject(obj)) return obj;
        var pairs = [];
        for (var key in obj) {
          pushEncodedKeyValuePair(pairs, key, obj[key]);
        }
        return pairs.join('&');
      }

      /**
       * Helps 'serialize' with serializing arrays.
       * Mutates the pairs array.
       *
       * @param {Array} pairs
       * @param {String} key
       * @param {Mixed} val
       */

      function pushEncodedKeyValuePair(pairs, key, val) {
        if (val != null) {
          if (Array.isArray(val)) {
            val.forEach(function (v) {
              pushEncodedKeyValuePair(pairs, key, v);
            });
          } else if (isObject(val)) {
            for (var subkey in val) {
              pushEncodedKeyValuePair(pairs, key + '[' + subkey + ']', val[subkey]);
            }
          } else {
            pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
          }
        } else if (val === null) {
          pairs.push(encodeURIComponent(key));
        }
      }

      /**
       * Expose serialization method.
       */

      request.serializeObject = serialize;

      /**
       * Parse the given x-www-form-urlencoded `str`.
       *
       * @param {String} str
       * @return {Object}
       * @api private
       */

      function parseString(str) {
        var obj = {};
        var pairs = str.split('&');
        var pair;
        var pos;

        for (var i = 0, len = pairs.length; i < len; ++i) {
          pair = pairs[i];
          pos = pair.indexOf('=');
          if (pos == -1) {
            obj[decodeURIComponent(pair)] = '';
          } else {
            obj[decodeURIComponent(pair.slice(0, pos))] = decodeURIComponent(pair.slice(pos + 1));
          }
        }

        return obj;
      }

      /**
       * Expose parser.
       */

      request.parseString = parseString;

      /**
       * Default MIME type map.
       *
       *     superagent.types.xml = 'application/xml';
       *
       */

      request.types = {
        html: 'text/html',
        json: 'application/json',
        xml: 'application/xml',
        urlencoded: 'application/x-www-form-urlencoded',
        'form': 'application/x-www-form-urlencoded',
        'form-data': 'application/x-www-form-urlencoded'
      };

      /**
       * Default serialization map.
       *
       *     superagent.serialize['application/xml'] = function(obj){
       *       return 'generated xml here';
       *     };
       *
       */

      request.serialize = {
        'application/x-www-form-urlencoded': serialize,
        'application/json': JSON.stringify
      };

      /**
       * Default parsers.
       *
       *     superagent.parse['application/xml'] = function(str){
       *       return { object parsed from str };
       *     };
       *
       */

      request.parse = {
        'application/x-www-form-urlencoded': parseString,
        'application/json': JSON.parse
      };

      /**
       * Parse the given header `str` into
       * an object containing the mapped fields.
       *
       * @param {String} str
       * @return {Object}
       * @api private
       */

      function parseHeader(str) {
        var lines = str.split(/\r?\n/);
        var fields = {};
        var index;
        var line;
        var field;
        var val;

        lines.pop(); // trailing CRLF

        for (var i = 0, len = lines.length; i < len; ++i) {
          line = lines[i];
          index = line.indexOf(':');
          field = line.slice(0, index).toLowerCase();
          val = trim(line.slice(index + 1));
          fields[field] = val;
        }

        return fields;
      }

      /**
       * Check if `mime` is json or has +json structured syntax suffix.
       *
       * @param {String} mime
       * @return {Boolean}
       * @api private
       */

      function isJSON(mime) {
        return (/[\/+]json\b/.test(mime)
        );
      }

      /**
       * Initialize a new `Response` with the given `xhr`.
       *
       *  - set flags (.ok, .error, etc)
       *  - parse header
       *
       * Examples:
       *
       *  Aliasing `superagent` as `request` is nice:
       *
       *      request = superagent;
       *
       *  We can use the promise-like API, or pass callbacks:
       *
       *      request.get('/').end(function(res){});
       *      request.get('/', function(res){});
       *
       *  Sending data can be chained:
       *
       *      request
       *        .post('/user')
       *        .send({ name: 'tj' })
       *        .end(function(res){});
       *
       *  Or passed to `.send()`:
       *
       *      request
       *        .post('/user')
       *        .send({ name: 'tj' }, function(res){});
       *
       *  Or passed to `.post()`:
       *
       *      request
       *        .post('/user', { name: 'tj' })
       *        .end(function(res){});
       *
       * Or further reduced to a single call for simple cases:
       *
       *      request
       *        .post('/user', { name: 'tj' }, function(res){});
       *
       * @param {XMLHTTPRequest} xhr
       * @param {Object} options
       * @api private
       */

      function Response(req, options) {
        options = options || {};
        this.req = req;
        this.xhr = this.req.xhr;
        // responseText is accessible only if responseType is '' or 'text' and on older browsers
        this.text = this.req.method != 'HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text') || typeof this.xhr.responseType === 'undefined' ? this.xhr.responseText : null;
        this.statusText = this.req.xhr.statusText;
        var status = this.xhr.status;
        // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
        if (status === 1223) {
          status = 204;
        }
        this._setStatusProperties(status);
        this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
        // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
        // getResponseHeader still works. so we get content-type even if getting
        // other headers fails.
        this.header['content-type'] = this.xhr.getResponseHeader('content-type');
        this._setHeaderProperties(this.header);

        if (null === this.text && req._responseType) {
          this.body = this.xhr.response;
        } else {
          this.body = this.req.method != 'HEAD' ? this._parseBody(this.text ? this.text : this.xhr.response) : null;
        }
      }

      ResponseBase(Response.prototype);

      /**
       * Parse the given body `str`.
       *
       * Used for auto-parsing of bodies. Parsers
       * are defined on the `superagent.parse` object.
       *
       * @param {String} str
       * @return {Mixed}
       * @api private
       */

      Response.prototype._parseBody = function (str) {
        var parse = request.parse[this.type];
        if (this.req._parser) {
          return this.req._parser(this, str);
        }
        if (!parse && isJSON(this.type)) {
          parse = request.parse['application/json'];
        }
        return parse && str && (str.length || str instanceof Object) ? parse(str) : null;
      };

      /**
       * Return an `Error` representative of this response.
       *
       * @return {Error}
       * @api public
       */

      Response.prototype.toError = function () {
        var req = this.req;
        var method = req.method;
        var url = req.url;

        var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
        var err = new Error(msg);
        err.status = this.status;
        err.method = method;
        err.url = url;

        return err;
      };

      /**
       * Expose `Response`.
       */

      request.Response = Response;

      /**
       * Initialize a new `Request` with the given `method` and `url`.
       *
       * @param {String} method
       * @param {String} url
       * @api public
       */

      function Request(method, url) {
        var self = this;
        this._query = this._query || [];
        this.method = method;
        this.url = url;
        this.header = {}; // preserves header name case
        this._header = {}; // coerces header names to lowercase
        this.on('end', function () {
          var err = null;
          var res = null;

          try {
            res = new Response(self);
          } catch (e) {
            err = new Error('Parser is unable to parse the response');
            err.parse = true;
            err.original = e;
            // issue #675: return the raw response if the response parsing fails
            if (self.xhr) {
              // ie9 doesn't have 'response' property
              err.rawResponse = typeof self.xhr.responseType == 'undefined' ? self.xhr.responseText : self.xhr.response;
              // issue #876: return the http status code if the response parsing fails
              err.status = self.xhr.status ? self.xhr.status : null;
              err.statusCode = err.status; // backwards-compat only
            } else {
              err.rawResponse = null;
              err.status = null;
            }

            return self.callback(err);
          }

          self.emit('response', res);

          var new_err;
          try {
            if (!self._isResponseOK(res)) {
              new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
              new_err.original = err;
              new_err.response = res;
              new_err.status = res.status;
            }
          } catch (e) {
            new_err = e; // #985 touching res may cause INVALID_STATE_ERR on old Android
          }

          // #1000 don't catch errors from the callback to avoid double calling it
          if (new_err) {
            self.callback(new_err, res);
          } else {
            self.callback(null, res);
          }
        });
      }

      /**
       * Mixin `Emitter` and `RequestBase`.
       */

      Emitter(Request.prototype);
      RequestBase(Request.prototype);

      /**
       * Set Content-Type to `type`, mapping values from `request.types`.
       *
       * Examples:
       *
       *      superagent.types.xml = 'application/xml';
       *
       *      request.post('/')
       *        .type('xml')
       *        .send(xmlstring)
       *        .end(callback);
       *
       *      request.post('/')
       *        .type('application/xml')
       *        .send(xmlstring)
       *        .end(callback);
       *
       * @param {String} type
       * @return {Request} for chaining
       * @api public
       */

      Request.prototype.type = function (type) {
        this.set('Content-Type', request.types[type] || type);
        return this;
      };

      /**
       * Set Accept to `type`, mapping values from `request.types`.
       *
       * Examples:
       *
       *      superagent.types.json = 'application/json';
       *
       *      request.get('/agent')
       *        .accept('json')
       *        .end(callback);
       *
       *      request.get('/agent')
       *        .accept('application/json')
       *        .end(callback);
       *
       * @param {String} accept
       * @return {Request} for chaining
       * @api public
       */

      Request.prototype.accept = function (type) {
        this.set('Accept', request.types[type] || type);
        return this;
      };

      /**
       * Set Authorization field value with `user` and `pass`.
       *
       * @param {String} user
       * @param {String} pass
       * @param {Object} options with 'type' property 'auto' or 'basic' (default 'basic')
       * @return {Request} for chaining
       * @api public
       */

      Request.prototype.auth = function (user, pass, options) {
        if (!options) {
          options = {
            type: 'function' === typeof btoa ? 'basic' : 'auto'
          };
        }

        switch (options.type) {
          case 'basic':
            this.set('Authorization', 'Basic ' + btoa(user + ':' + pass));
            break;

          case 'auto':
            this.username = user;
            this.password = pass;
            break;
        }
        return this;
      };

      /**
      * Add query-string `val`.
      *
      * Examples:
      *
      *   request.get('/shoes')
      *     .query('size=10')
      *     .query({ color: 'blue' })
      *
      * @param {Object|String} val
      * @return {Request} for chaining
      * @api public
      */

      Request.prototype.query = function (val) {
        if ('string' != typeof val) val = serialize(val);
        if (val) this._query.push(val);
        return this;
      };

      /**
       * Queue the given `file` as an attachment to the specified `field`,
       * with optional `options` (or filename).
       *
       * ``` js
       * request.post('/upload')
       *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
       *   .end(callback);
       * ```
       *
       * @param {String} field
       * @param {Blob|File} file
       * @param {String|Object} options
       * @return {Request} for chaining
       * @api public
       */

      Request.prototype.attach = function (field, file, options) {
        if (this._data) {
          throw Error("superagent can't mix .send() and .attach()");
        }

        this._getFormData().append(field, file, options || file.name);
        return this;
      };

      Request.prototype._getFormData = function () {
        if (!this._formData) {
          this._formData = new root.FormData();
        }
        return this._formData;
      };

      /**
       * Invoke the callback with `err` and `res`
       * and handle arity check.
       *
       * @param {Error} err
       * @param {Response} res
       * @api private
       */

      Request.prototype.callback = function (err, res) {
        var fn = this._callback;
        this.clearTimeout();

        if (err) {
          this.emit('error', err);
        }

        fn(err, res);
      };

      /**
       * Invoke callback with x-domain error.
       *
       * @api private
       */

      Request.prototype.crossDomainError = function () {
        var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
        err.crossDomain = true;

        err.status = this.status;
        err.method = this.method;
        err.url = this.url;

        this.callback(err);
      };

      // This only warns, because the request is still likely to work
      Request.prototype.buffer = Request.prototype.ca = Request.prototype.agent = function () {
        console.warn("This is not supported in browser version of superagent");
        return this;
      };

      // This throws, because it can't send/receive data as expected
      Request.prototype.pipe = Request.prototype.write = function () {
        throw Error("Streaming is not supported in browser version of superagent");
      };

      /**
       * Compose querystring to append to req.url
       *
       * @api private
       */

      Request.prototype._appendQueryString = function () {
        var query = this._query.join('&');
        if (query) {
          this.url += (this.url.indexOf('?') >= 0 ? '&' : '?') + query;
        }

        if (this._sort) {
          var index = this.url.indexOf('?');
          if (index >= 0) {
            var queryArr = this.url.substring(index + 1).split('&');
            if (isFunction(this._sort)) {
              queryArr.sort(this._sort);
            } else {
              queryArr.sort();
            }
            this.url = this.url.substring(0, index) + '?' + queryArr.join('&');
          }
        }
      };

      /**
       * Check if `obj` is a host object,
       * we don't want to serialize these :)
       *
       * @param {Object} obj
       * @return {Boolean}
       * @api private
       */
      Request.prototype._isHost = function _isHost(obj) {
        // Native objects stringify to [object File], [object Blob], [object FormData], etc.
        return obj && 'object' === (typeof obj === "undefined" ? "undefined" : _typeof(obj)) && !Array.isArray(obj) && Object.prototype.toString.call(obj) !== '[object Object]';
      };

      /**
       * Initiate request, invoking callback `fn(res)`
       * with an instanceof `Response`.
       *
       * @param {Function} fn
       * @return {Request} for chaining
       * @api public
       */

      Request.prototype.end = function (fn) {
        var self = this;
        var xhr = this.xhr = request.getXHR();
        var data = this._formData || this._data;

        if (this._endCalled) {
          console.warn("Warning: .end() was called twice. This is not supported in superagent");
        }
        this._endCalled = true;

        // store callback
        this._callback = fn || noop;

        // state change
        xhr.onreadystatechange = function () {
          var readyState = xhr.readyState;
          if (readyState >= 2 && self._responseTimeoutTimer) {
            clearTimeout(self._responseTimeoutTimer);
          }
          if (4 != readyState) {
            return;
          }

          // In IE9, reads to any property (e.g. status) off of an aborted XHR will
          // result in the error "Could not complete the operation due to error c00c023f"
          var status;
          try {
            status = xhr.status;
          } catch (e) {
            status = 0;
          }

          if (!status) {
            if (self.timedout || self._aborted) return;
            return self.crossDomainError();
          }
          self.emit('end');
        };

        // progress
        var handleProgress = function handleProgress(direction, e) {
          if (e.total > 0) {
            e.percent = e.loaded / e.total * 100;
          }
          e.direction = direction;
          self.emit('progress', e);
        };
        if (this.hasListeners('progress')) {
          try {
            xhr.onprogress = handleProgress.bind(null, 'download');
            if (xhr.upload) {
              xhr.upload.onprogress = handleProgress.bind(null, 'upload');
            }
          } catch (e) {
            // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
            // Reported here:
            // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
          }
        }

        // querystring
        this._appendQueryString();

        this._setTimeouts();

        // initiate request
        try {
          if (this.username && this.password) {
            xhr.open(this.method, this.url, true, this.username, this.password);
          } else {
            xhr.open(this.method, this.url, true);
          }
        } catch (err) {
          // see #1149
          return this.callback(err);
        }

        // CORS
        if (this._withCredentials) xhr.withCredentials = true;

        // body
        if (!this._formData && 'GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !this._isHost(data)) {
          // serialize stuff
          var contentType = this._header['content-type'];
          var serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];
          if (!serialize && isJSON(contentType)) {
            serialize = request.serialize['application/json'];
          }
          if (serialize) data = serialize(data);
        }

        // set header fields
        for (var field in this.header) {
          if (null == this.header[field]) continue;
          xhr.setRequestHeader(field, this.header[field]);
        }

        if (this._responseType) {
          xhr.responseType = this._responseType;
        }

        // send stuff
        this.emit('request', this);

        // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
        // We need null here if data is undefined
        xhr.send(typeof data !== 'undefined' ? data : null);
        return this;
      };

      /**
       * GET `url` with optional callback `fn(res)`.
       *
       * @param {String} url
       * @param {Mixed|Function} [data] or fn
       * @param {Function} [fn]
       * @return {Request}
       * @api public
       */

      request.get = function (url, data, fn) {
        var req = request('GET', url);
        if ('function' == typeof data) fn = data, data = null;
        if (data) req.query(data);
        if (fn) req.end(fn);
        return req;
      };

      /**
       * HEAD `url` with optional callback `fn(res)`.
       *
       * @param {String} url
       * @param {Mixed|Function} [data] or fn
       * @param {Function} [fn]
       * @return {Request}
       * @api public
       */

      request.head = function (url, data, fn) {
        var req = request('HEAD', url);
        if ('function' == typeof data) fn = data, data = null;
        if (data) req.send(data);
        if (fn) req.end(fn);
        return req;
      };

      /**
       * OPTIONS query to `url` with optional callback `fn(res)`.
       *
       * @param {String} url
       * @param {Mixed|Function} [data] or fn
       * @param {Function} [fn]
       * @return {Request}
       * @api public
       */

      request.options = function (url, data, fn) {
        var req = request('OPTIONS', url);
        if ('function' == typeof data) fn = data, data = null;
        if (data) req.send(data);
        if (fn) req.end(fn);
        return req;
      };

      /**
       * DELETE `url` with optional callback `fn(res)`.
       *
       * @param {String} url
       * @param {Function} [fn]
       * @return {Request}
       * @api public
       */

      function del(url, fn) {
        var req = request('DELETE', url);
        if (fn) req.end(fn);
        return req;
      };

      request['del'] = del;
      request['delete'] = del;

      /**
       * PATCH `url` with optional `data` and callback `fn(res)`.
       *
       * @param {String} url
       * @param {Mixed} [data]
       * @param {Function} [fn]
       * @return {Request}
       * @api public
       */

      request.patch = function (url, data, fn) {
        var req = request('PATCH', url);
        if ('function' == typeof data) fn = data, data = null;
        if (data) req.send(data);
        if (fn) req.end(fn);
        return req;
      };

      /**
       * POST `url` with optional `data` and callback `fn(res)`.
       *
       * @param {String} url
       * @param {Mixed} [data]
       * @param {Function} [fn]
       * @return {Request}
       * @api public
       */

      request.post = function (url, data, fn) {
        var req = request('POST', url);
        if ('function' == typeof data) fn = data, data = null;
        if (data) req.send(data);
        if (fn) req.end(fn);
        return req;
      };

      /**
       * PUT `url` with optional `data` and callback `fn(res)`.
       *
       * @param {String} url
       * @param {Mixed|Function} [data] or fn
       * @param {Function} [fn]
       * @return {Request}
       * @api public
       */

      request.put = function (url, data, fn) {
        var req = request('PUT', url);
        if ('function' == typeof data) fn = data, data = null;
        if (data) req.send(data);
        if (fn) req.end(fn);
        return req;
      };
    }, { "./is-function": 13, "./is-object": 14, "./request-base": 15, "./response-base": 16, "emitter": 3 }], 13: [function (require, module, exports) {
      /**
       * Check if `fn` is a function.
       *
       * @param {Function} fn
       * @return {Boolean}
       * @api private
       */
      var isObject = require('./is-object');

      function isFunction(fn) {
        var tag = isObject(fn) ? Object.prototype.toString.call(fn) : '';
        return tag === '[object Function]';
      }

      module.exports = isFunction;
    }, { "./is-object": 14 }], 14: [function (require, module, exports) {
      /**
       * Check if `obj` is an object.
       *
       * @param {Object} obj
       * @return {Boolean}
       * @api private
       */

      function isObject(obj) {
        return null !== obj && 'object' === (typeof obj === "undefined" ? "undefined" : _typeof(obj));
      }

      module.exports = isObject;
    }, {}], 15: [function (require, module, exports) {
      /**
       * Module of mixed-in functions shared between node and client code
       */
      var isObject = require('./is-object');

      /**
       * Expose `RequestBase`.
       */

      module.exports = RequestBase;

      /**
       * Initialize a new `RequestBase`.
       *
       * @api public
       */

      function RequestBase(obj) {
        if (obj) return mixin(obj);
      }

      /**
       * Mixin the prototype properties.
       *
       * @param {Object} obj
       * @return {Object}
       * @api private
       */

      function mixin(obj) {
        for (var key in RequestBase.prototype) {
          obj[key] = RequestBase.prototype[key];
        }
        return obj;
      }

      /**
       * Clear previous timeout.
       *
       * @return {Request} for chaining
       * @api public
       */

      RequestBase.prototype.clearTimeout = function _clearTimeout() {
        this._timeout = 0;
        this._responseTimeout = 0;
        clearTimeout(this._timer);
        clearTimeout(this._responseTimeoutTimer);
        return this;
      };

      /**
       * Override default response body parser
       *
       * This function will be called to convert incoming data into request.body
       *
       * @param {Function}
       * @api public
       */

      RequestBase.prototype.parse = function parse(fn) {
        this._parser = fn;
        return this;
      };

      /**
       * Set format of binary response body.
       * In browser valid formats are 'blob' and 'arraybuffer',
       * which return Blob and ArrayBuffer, respectively.
       *
       * In Node all values result in Buffer.
       *
       * Examples:
       *
       *      req.get('/')
       *        .responseType('blob')
       *        .end(callback);
       *
       * @param {String} val
       * @return {Request} for chaining
       * @api public
       */

      RequestBase.prototype.responseType = function (val) {
        this._responseType = val;
        return this;
      };

      /**
       * Override default request body serializer
       *
       * This function will be called to convert data set via .send or .attach into payload to send
       *
       * @param {Function}
       * @api public
       */

      RequestBase.prototype.serialize = function serialize(fn) {
        this._serializer = fn;
        return this;
      };

      /**
       * Set timeouts.
       *
       * - response timeout is time between sending request and receiving the first byte of the response. Includes DNS and connection time.
       * - deadline is the time from start of the request to receiving response body in full. If the deadline is too short large files may not load at all on slow connections.
       *
       * Value of 0 or false means no timeout.
       *
       * @param {Number|Object} ms or {response, read, deadline}
       * @return {Request} for chaining
       * @api public
       */

      RequestBase.prototype.timeout = function timeout(options) {
        if (!options || 'object' !== (typeof options === "undefined" ? "undefined" : _typeof(options))) {
          this._timeout = options;
          this._responseTimeout = 0;
          return this;
        }

        if ('undefined' !== typeof options.deadline) {
          this._timeout = options.deadline;
        }
        if ('undefined' !== typeof options.response) {
          this._responseTimeout = options.response;
        }
        return this;
      };

      /**
       * Promise support
       *
       * @param {Function} resolve
       * @param {Function} [reject]
       * @return {Request}
       */

      RequestBase.prototype.then = function then(resolve, reject) {
        if (!this._fullfilledPromise) {
          var self = this;
          if (this._endCalled) {
            console.warn("Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises");
          }
          this._fullfilledPromise = new Promise(function (innerResolve, innerReject) {
            self.end(function (err, res) {
              if (err) innerReject(err);else innerResolve(res);
            });
          });
        }
        return this._fullfilledPromise.then(resolve, reject);
      };

      RequestBase.prototype.catch = function (cb) {
        return this.then(undefined, cb);
      };

      /**
       * Allow for extension
       */

      RequestBase.prototype.use = function use(fn) {
        fn(this);
        return this;
      };

      RequestBase.prototype.ok = function (cb) {
        if ('function' !== typeof cb) throw Error("Callback required");
        this._okCallback = cb;
        return this;
      };

      RequestBase.prototype._isResponseOK = function (res) {
        if (!res) {
          return false;
        }

        if (this._okCallback) {
          return this._okCallback(res);
        }

        return res.status >= 200 && res.status < 300;
      };

      /**
       * Get request header `field`.
       * Case-insensitive.
       *
       * @param {String} field
       * @return {String}
       * @api public
       */

      RequestBase.prototype.get = function (field) {
        return this._header[field.toLowerCase()];
      };

      /**
       * Get case-insensitive header `field` value.
       * This is a deprecated internal API. Use `.get(field)` instead.
       *
       * (getHeader is no longer used internally by the superagent code base)
       *
       * @param {String} field
       * @return {String}
       * @api private
       * @deprecated
       */

      RequestBase.prototype.getHeader = RequestBase.prototype.get;

      /**
       * Set header `field` to `val`, or multiple fields with one object.
       * Case-insensitive.
       *
       * Examples:
       *
       *      req.get('/')
       *        .set('Accept', 'application/json')
       *        .set('X-API-Key', 'foobar')
       *        .end(callback);
       *
       *      req.get('/')
       *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
       *        .end(callback);
       *
       * @param {String|Object} field
       * @param {String} val
       * @return {Request} for chaining
       * @api public
       */

      RequestBase.prototype.set = function (field, val) {
        if (isObject(field)) {
          for (var key in field) {
            this.set(key, field[key]);
          }
          return this;
        }
        this._header[field.toLowerCase()] = val;
        this.header[field] = val;
        return this;
      };

      /**
       * Remove header `field`.
       * Case-insensitive.
       *
       * Example:
       *
       *      req.get('/')
       *        .unset('User-Agent')
       *        .end(callback);
       *
       * @param {String} field
       */
      RequestBase.prototype.unset = function (field) {
        delete this._header[field.toLowerCase()];
        delete this.header[field];
        return this;
      };

      /**
       * Write the field `name` and `val`, or multiple fields with one object
       * for "multipart/form-data" request bodies.
       *
       * ``` js
       * request.post('/upload')
       *   .field('foo', 'bar')
       *   .end(callback);
       *
       * request.post('/upload')
       *   .field({ foo: 'bar', baz: 'qux' })
       *   .end(callback);
       * ```
       *
       * @param {String|Object} name
       * @param {String|Blob|File|Buffer|fs.ReadStream} val
       * @return {Request} for chaining
       * @api public
       */
      RequestBase.prototype.field = function (name, val) {

        // name should be either a string or an object.
        if (null === name || undefined === name) {
          throw new Error('.field(name, val) name can not be empty');
        }

        if (this._data) {
          console.error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()");
        }

        if (isObject(name)) {
          for (var key in name) {
            this.field(key, name[key]);
          }
          return this;
        }

        if (Array.isArray(val)) {
          for (var i in val) {
            this.field(name, val[i]);
          }
          return this;
        }

        // val should be defined now
        if (null === val || undefined === val) {
          throw new Error('.field(name, val) val can not be empty');
        }
        if ('boolean' === typeof val) {
          val = '' + val;
        }
        this._getFormData().append(name, val);
        return this;
      };

      /**
       * Abort the request, and clear potential timeout.
       *
       * @return {Request}
       * @api public
       */
      RequestBase.prototype.abort = function () {
        if (this._aborted) {
          return this;
        }
        this._aborted = true;
        this.xhr && this.xhr.abort(); // browser
        this.req && this.req.abort(); // node
        this.clearTimeout();
        this.emit('abort');
        return this;
      };

      /**
       * Enable transmission of cookies with x-domain requests.
       *
       * Note that for this to work the origin must not be
       * using "Access-Control-Allow-Origin" with a wildcard,
       * and also must set "Access-Control-Allow-Credentials"
       * to "true".
       *
       * @api public
       */

      RequestBase.prototype.withCredentials = function () {
        // This is browser-only functionality. Node side is no-op.
        this._withCredentials = true;
        return this;
      };

      /**
       * Set the max redirects to `n`. Does noting in browser XHR implementation.
       *
       * @param {Number} n
       * @return {Request} for chaining
       * @api public
       */

      RequestBase.prototype.redirects = function (n) {
        this._maxRedirects = n;
        return this;
      };

      /**
       * Convert to a plain javascript object (not JSON string) of scalar properties.
       * Note as this method is designed to return a useful non-this value,
       * it cannot be chained.
       *
       * @return {Object} describing method, url, and data of this request
       * @api public
       */

      RequestBase.prototype.toJSON = function () {
        return {
          method: this.method,
          url: this.url,
          data: this._data,
          headers: this._header
        };
      };

      /**
       * Send `data` as the request body, defaulting the `.type()` to "json" when
       * an object is given.
       *
       * Examples:
       *
       *       // manual json
       *       request.post('/user')
       *         .type('json')
       *         .send('{"name":"tj"}')
       *         .end(callback)
       *
       *       // auto json
       *       request.post('/user')
       *         .send({ name: 'tj' })
       *         .end(callback)
       *
       *       // manual x-www-form-urlencoded
       *       request.post('/user')
       *         .type('form')
       *         .send('name=tj')
       *         .end(callback)
       *
       *       // auto x-www-form-urlencoded
       *       request.post('/user')
       *         .type('form')
       *         .send({ name: 'tj' })
       *         .end(callback)
       *
       *       // defaults to x-www-form-urlencoded
       *      request.post('/user')
       *        .send('name=tobi')
       *        .send('species=ferret')
       *        .end(callback)
       *
       * @param {String|Object} data
       * @return {Request} for chaining
       * @api public
       */

      RequestBase.prototype.send = function (data) {
        var isObj = isObject(data);
        var type = this._header['content-type'];

        if (this._formData) {
          console.error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()");
        }

        if (isObj && !this._data) {
          if (Array.isArray(data)) {
            this._data = [];
          } else if (!this._isHost(data)) {
            this._data = {};
          }
        } else if (data && this._data && this._isHost(this._data)) {
          throw Error("Can't merge these send calls");
        }

        // merge
        if (isObj && isObject(this._data)) {
          for (var key in data) {
            this._data[key] = data[key];
          }
        } else if ('string' == typeof data) {
          // default to x-www-form-urlencoded
          if (!type) this.type('form');
          type = this._header['content-type'];
          if ('application/x-www-form-urlencoded' == type) {
            this._data = this._data ? this._data + '&' + data : data;
          } else {
            this._data = (this._data || '') + data;
          }
        } else {
          this._data = data;
        }

        if (!isObj || this._isHost(data)) {
          return this;
        }

        // default to json
        if (!type) this.type('json');
        return this;
      };

      /**
       * Sort `querystring` by the sort function
       *
       *
       * Examples:
       *
       *       // default order
       *       request.get('/user')
       *         .query('name=Nick')
       *         .query('search=Manny')
       *         .sortQuery()
       *         .end(callback)
       *
       *       // customized sort function
       *       request.get('/user')
       *         .query('name=Nick')
       *         .query('search=Manny')
       *         .sortQuery(function(a, b){
       *           return a.length - b.length;
       *         })
       *         .end(callback)
       *
       *
       * @param {Function} sort
       * @return {Request} for chaining
       * @api public
       */

      RequestBase.prototype.sortQuery = function (sort) {
        // _sort default to true but otherwise can be a function or boolean
        this._sort = typeof sort === 'undefined' ? true : sort;
        return this;
      };

      /**
       * Invoke callback with timeout error.
       *
       * @api private
       */

      RequestBase.prototype._timeoutError = function (reason, timeout) {
        if (this._aborted) {
          return;
        }
        var err = new Error(reason + timeout + 'ms exceeded');
        err.timeout = timeout;
        err.code = 'ECONNABORTED';
        this.timedout = true;
        this.abort();
        this.callback(err);
      };

      RequestBase.prototype._setTimeouts = function () {
        var self = this;

        // deadline
        if (this._timeout && !this._timer) {
          this._timer = setTimeout(function () {
            self._timeoutError('Timeout of ', self._timeout);
          }, this._timeout);
        }
        // response timeout
        if (this._responseTimeout && !this._responseTimeoutTimer) {
          this._responseTimeoutTimer = setTimeout(function () {
            self._timeoutError('Response timeout of ', self._responseTimeout);
          }, this._responseTimeout);
        }
      };
    }, { "./is-object": 14 }], 16: [function (require, module, exports) {

      /**
       * Module dependencies.
       */

      var utils = require('./utils');

      /**
       * Expose `ResponseBase`.
       */

      module.exports = ResponseBase;

      /**
       * Initialize a new `ResponseBase`.
       *
       * @api public
       */

      function ResponseBase(obj) {
        if (obj) return mixin(obj);
      }

      /**
       * Mixin the prototype properties.
       *
       * @param {Object} obj
       * @return {Object}
       * @api private
       */

      function mixin(obj) {
        for (var key in ResponseBase.prototype) {
          obj[key] = ResponseBase.prototype[key];
        }
        return obj;
      }

      /**
       * Get case-insensitive `field` value.
       *
       * @param {String} field
       * @return {String}
       * @api public
       */

      ResponseBase.prototype.get = function (field) {
        return this.header[field.toLowerCase()];
      };

      /**
       * Set header related properties:
       *
       *   - `.type` the content type without params
       *
       * A response of "Content-Type: text/plain; charset=utf-8"
       * will provide you with a `.type` of "text/plain".
       *
       * @param {Object} header
       * @api private
       */

      ResponseBase.prototype._setHeaderProperties = function (header) {
        // TODO: moar!
        // TODO: make this a util

        // content-type
        var ct = header['content-type'] || '';
        this.type = utils.type(ct);

        // params
        var params = utils.params(ct);
        for (var key in params) {
          this[key] = params[key];
        }this.links = {};

        // links
        try {
          if (header.link) {
            this.links = utils.parseLinks(header.link);
          }
        } catch (err) {
          // ignore
        }
      };

      /**
       * Set flags such as `.ok` based on `status`.
       *
       * For example a 2xx response will give you a `.ok` of __true__
       * whereas 5xx will be __false__ and `.error` will be __true__. The
       * `.clientError` and `.serverError` are also available to be more
       * specific, and `.statusType` is the class of error ranging from 1..5
       * sometimes useful for mapping respond colors etc.
       *
       * "sugar" properties are also defined for common cases. Currently providing:
       *
       *   - .noContent
       *   - .badRequest
       *   - .unauthorized
       *   - .notAcceptable
       *   - .notFound
       *
       * @param {Number} status
       * @api private
       */

      ResponseBase.prototype._setStatusProperties = function (status) {
        var type = status / 100 | 0;

        // status / class
        this.status = this.statusCode = status;
        this.statusType = type;

        // basics
        this.info = 1 == type;
        this.ok = 2 == type;
        this.redirect = 3 == type;
        this.clientError = 4 == type;
        this.serverError = 5 == type;
        this.error = 4 == type || 5 == type ? this.toError() : false;

        // sugar
        this.accepted = 202 == status;
        this.noContent = 204 == status;
        this.badRequest = 400 == status;
        this.unauthorized = 401 == status;
        this.notAcceptable = 406 == status;
        this.forbidden = 403 == status;
        this.notFound = 404 == status;
      };
    }, { "./utils": 17 }], 17: [function (require, module, exports) {

      /**
       * Return the mime type for the given `str`.
       *
       * @param {String} str
       * @return {String}
       * @api private
       */

      exports.type = function (str) {
        return str.split(/ *; */).shift();
      };

      /**
       * Return header field parameters.
       *
       * @param {String} str
       * @return {Object}
       * @api private
       */

      exports.params = function (str) {
        return str.split(/ *; */).reduce(function (obj, str) {
          var parts = str.split(/ *= */);
          var key = parts.shift();
          var val = parts.shift();

          if (key && val) obj[key] = val;
          return obj;
        }, {});
      };

      /**
       * Parse Link header fields.
       *
       * @param {String} str
       * @return {Object}
       * @api private
       */

      exports.parseLinks = function (str) {
        return str.split(/ *, */).reduce(function (obj, str) {
          var parts = str.split(/ *; */);
          var url = parts[0].slice(1, -1);
          var rel = parts[1].split(/ *= */)[1].slice(1, -1);
          obj[rel] = url;
          return obj;
        }, {});
      };

      /**
       * Strip content related fields from `header`.
       *
       * @param {Object} header
       * @return {Object} header
       * @api private
       */

      exports.cleanHeader = function (header, shouldStripCookie) {
        delete header['content-type'];
        delete header['content-length'];
        delete header['transfer-encoding'];
        delete header['host'];
        if (shouldStripCookie) {
          delete header['cookie'];
        }
        return header;
      };
    }, {}], 18: [function (require, module, exports) {
      //     Underscore.js 1.8.3
      //     http://underscorejs.org
      //     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
      //     Underscore may be freely distributed under the MIT license.

      (function () {

        // Baseline setup
        // --------------

        // Establish the root object, `window` in the browser, or `exports` on the server.
        var root = this;

        // Save the previous value of the `_` variable.
        var previousUnderscore = root._;

        // Save bytes in the minified (but not gzipped) version:
        var ArrayProto = Array.prototype,
            ObjProto = Object.prototype,
            FuncProto = Function.prototype;

        // Create quick reference variables for speed access to core prototypes.
        var push = ArrayProto.push,
            slice = ArrayProto.slice,
            toString = ObjProto.toString,
            hasOwnProperty = ObjProto.hasOwnProperty;

        // All **ECMAScript 5** native function implementations that we hope to use
        // are declared here.
        var nativeIsArray = Array.isArray,
            nativeKeys = Object.keys,
            nativeBind = FuncProto.bind,
            nativeCreate = Object.create;

        // Naked function reference for surrogate-prototype-swapping.
        var Ctor = function Ctor() {};

        // Create a safe reference to the Underscore object for use below.
        var _ = function _(obj) {
          if (obj instanceof _) return obj;
          if (!(this instanceof _)) return new _(obj);
          this._wrapped = obj;
        };

        // Export the Underscore object for **Node.js**, with
        // backwards-compatibility for the old `require()` API. If we're in
        // the browser, add `_` as a global object.
        if (typeof exports !== 'undefined') {
          if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _;
          }
          exports._ = _;
        } else {
          root._ = _;
        }

        // Current version.
        _.VERSION = '1.8.3';

        // Internal function that returns an efficient (for current engines) version
        // of the passed-in callback, to be repeatedly applied in other Underscore
        // functions.
        var optimizeCb = function optimizeCb(func, context, argCount) {
          if (context === void 0) return func;
          switch (argCount == null ? 3 : argCount) {
            case 1:
              return function (value) {
                return func.call(context, value);
              };
            case 2:
              return function (value, other) {
                return func.call(context, value, other);
              };
            case 3:
              return function (value, index, collection) {
                return func.call(context, value, index, collection);
              };
            case 4:
              return function (accumulator, value, index, collection) {
                return func.call(context, accumulator, value, index, collection);
              };
          }
          return function () {
            return func.apply(context, arguments);
          };
        };

        // A mostly-internal function to generate callbacks that can be applied
        // to each element in a collection, returning the desired result — either
        // identity, an arbitrary callback, a property matcher, or a property accessor.
        var cb = function cb(value, context, argCount) {
          if (value == null) return _.identity;
          if (_.isFunction(value)) return optimizeCb(value, context, argCount);
          if (_.isObject(value)) return _.matcher(value);
          return _.property(value);
        };
        _.iteratee = function (value, context) {
          return cb(value, context, Infinity);
        };

        // An internal function for creating assigner functions.
        var createAssigner = function createAssigner(keysFunc, undefinedOnly) {
          return function (obj) {
            var length = arguments.length;
            if (length < 2 || obj == null) return obj;
            for (var index = 1; index < length; index++) {
              var source = arguments[index],
                  keys = keysFunc(source),
                  l = keys.length;
              for (var i = 0; i < l; i++) {
                var key = keys[i];
                if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
              }
            }
            return obj;
          };
        };

        // An internal function for creating a new object that inherits from another.
        var baseCreate = function baseCreate(prototype) {
          if (!_.isObject(prototype)) return {};
          if (nativeCreate) return nativeCreate(prototype);
          Ctor.prototype = prototype;
          var result = new Ctor();
          Ctor.prototype = null;
          return result;
        };

        var property = function property(key) {
          return function (obj) {
            return obj == null ? void 0 : obj[key];
          };
        };

        // Helper for collection methods to determine whether a collection
        // should be iterated as an array or as an object
        // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
        // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
        var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
        var getLength = property('length');
        var isArrayLike = function isArrayLike(collection) {
          var length = getLength(collection);
          return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
        };

        // Collection Functions
        // --------------------

        // The cornerstone, an `each` implementation, aka `forEach`.
        // Handles raw objects in addition to array-likes. Treats all
        // sparse array-likes as if they were dense.
        _.each = _.forEach = function (obj, iteratee, context) {
          iteratee = optimizeCb(iteratee, context);
          var i, length;
          if (isArrayLike(obj)) {
            for (i = 0, length = obj.length; i < length; i++) {
              iteratee(obj[i], i, obj);
            }
          } else {
            var keys = _.keys(obj);
            for (i = 0, length = keys.length; i < length; i++) {
              iteratee(obj[keys[i]], keys[i], obj);
            }
          }
          return obj;
        };

        // Return the results of applying the iteratee to each element.
        _.map = _.collect = function (obj, iteratee, context) {
          iteratee = cb(iteratee, context);
          var keys = !isArrayLike(obj) && _.keys(obj),
              length = (keys || obj).length,
              results = Array(length);
          for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            results[index] = iteratee(obj[currentKey], currentKey, obj);
          }
          return results;
        };

        // Create a reducing function iterating left or right.
        function createReduce(dir) {
          // Optimized iterator function as using arguments.length
          // in the main function will deoptimize the, see #1991.
          function iterator(obj, iteratee, memo, keys, index, length) {
            for (; index >= 0 && index < length; index += dir) {
              var currentKey = keys ? keys[index] : index;
              memo = iteratee(memo, obj[currentKey], currentKey, obj);
            }
            return memo;
          }

          return function (obj, iteratee, memo, context) {
            iteratee = optimizeCb(iteratee, context, 4);
            var keys = !isArrayLike(obj) && _.keys(obj),
                length = (keys || obj).length,
                index = dir > 0 ? 0 : length - 1;
            // Determine the initial value if none is provided.
            if (arguments.length < 3) {
              memo = obj[keys ? keys[index] : index];
              index += dir;
            }
            return iterator(obj, iteratee, memo, keys, index, length);
          };
        }

        // **Reduce** builds up a single result from a list of values, aka `inject`,
        // or `foldl`.
        _.reduce = _.foldl = _.inject = createReduce(1);

        // The right-associative version of reduce, also known as `foldr`.
        _.reduceRight = _.foldr = createReduce(-1);

        // Return the first value which passes a truth test. Aliased as `detect`.
        _.find = _.detect = function (obj, predicate, context) {
          var key;
          if (isArrayLike(obj)) {
            key = _.findIndex(obj, predicate, context);
          } else {
            key = _.findKey(obj, predicate, context);
          }
          if (key !== void 0 && key !== -1) return obj[key];
        };

        // Return all the elements that pass a truth test.
        // Aliased as `select`.
        _.filter = _.select = function (obj, predicate, context) {
          var results = [];
          predicate = cb(predicate, context);
          _.each(obj, function (value, index, list) {
            if (predicate(value, index, list)) results.push(value);
          });
          return results;
        };

        // Return all the elements for which a truth test fails.
        _.reject = function (obj, predicate, context) {
          return _.filter(obj, _.negate(cb(predicate)), context);
        };

        // Determine whether all of the elements match a truth test.
        // Aliased as `all`.
        _.every = _.all = function (obj, predicate, context) {
          predicate = cb(predicate, context);
          var keys = !isArrayLike(obj) && _.keys(obj),
              length = (keys || obj).length;
          for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            if (!predicate(obj[currentKey], currentKey, obj)) return false;
          }
          return true;
        };

        // Determine if at least one element in the object matches a truth test.
        // Aliased as `any`.
        _.some = _.any = function (obj, predicate, context) {
          predicate = cb(predicate, context);
          var keys = !isArrayLike(obj) && _.keys(obj),
              length = (keys || obj).length;
          for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            if (predicate(obj[currentKey], currentKey, obj)) return true;
          }
          return false;
        };

        // Determine if the array or object contains a given item (using `===`).
        // Aliased as `includes` and `include`.
        _.contains = _.includes = _.include = function (obj, item, fromIndex, guard) {
          if (!isArrayLike(obj)) obj = _.values(obj);
          if (typeof fromIndex != 'number' || guard) fromIndex = 0;
          return _.indexOf(obj, item, fromIndex) >= 0;
        };

        // Invoke a method (with arguments) on every item in a collection.
        _.invoke = function (obj, method) {
          var args = slice.call(arguments, 2);
          var isFunc = _.isFunction(method);
          return _.map(obj, function (value) {
            var func = isFunc ? method : value[method];
            return func == null ? func : func.apply(value, args);
          });
        };

        // Convenience version of a common use case of `map`: fetching a property.
        _.pluck = function (obj, key) {
          return _.map(obj, _.property(key));
        };

        // Convenience version of a common use case of `filter`: selecting only objects
        // containing specific `key:value` pairs.
        _.where = function (obj, attrs) {
          return _.filter(obj, _.matcher(attrs));
        };

        // Convenience version of a common use case of `find`: getting the first object
        // containing specific `key:value` pairs.
        _.findWhere = function (obj, attrs) {
          return _.find(obj, _.matcher(attrs));
        };

        // Return the maximum element (or element-based computation).
        _.max = function (obj, iteratee, context) {
          var result = -Infinity,
              lastComputed = -Infinity,
              value,
              computed;
          if (iteratee == null && obj != null) {
            obj = isArrayLike(obj) ? obj : _.values(obj);
            for (var i = 0, length = obj.length; i < length; i++) {
              value = obj[i];
              if (value > result) {
                result = value;
              }
            }
          } else {
            iteratee = cb(iteratee, context);
            _.each(obj, function (value, index, list) {
              computed = iteratee(value, index, list);
              if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
                result = value;
                lastComputed = computed;
              }
            });
          }
          return result;
        };

        // Return the minimum element (or element-based computation).
        _.min = function (obj, iteratee, context) {
          var result = Infinity,
              lastComputed = Infinity,
              value,
              computed;
          if (iteratee == null && obj != null) {
            obj = isArrayLike(obj) ? obj : _.values(obj);
            for (var i = 0, length = obj.length; i < length; i++) {
              value = obj[i];
              if (value < result) {
                result = value;
              }
            }
          } else {
            iteratee = cb(iteratee, context);
            _.each(obj, function (value, index, list) {
              computed = iteratee(value, index, list);
              if (computed < lastComputed || computed === Infinity && result === Infinity) {
                result = value;
                lastComputed = computed;
              }
            });
          }
          return result;
        };

        // Shuffle a collection, using the modern version of the
        // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
        _.shuffle = function (obj) {
          var set = isArrayLike(obj) ? obj : _.values(obj);
          var length = set.length;
          var shuffled = Array(length);
          for (var index = 0, rand; index < length; index++) {
            rand = _.random(0, index);
            if (rand !== index) shuffled[index] = shuffled[rand];
            shuffled[rand] = set[index];
          }
          return shuffled;
        };

        // Sample **n** random values from a collection.
        // If **n** is not specified, returns a single random element.
        // The internal `guard` argument allows it to work with `map`.
        _.sample = function (obj, n, guard) {
          if (n == null || guard) {
            if (!isArrayLike(obj)) obj = _.values(obj);
            return obj[_.random(obj.length - 1)];
          }
          return _.shuffle(obj).slice(0, Math.max(0, n));
        };

        // Sort the object's values by a criterion produced by an iteratee.
        _.sortBy = function (obj, iteratee, context) {
          iteratee = cb(iteratee, context);
          return _.pluck(_.map(obj, function (value, index, list) {
            return {
              value: value,
              index: index,
              criteria: iteratee(value, index, list)
            };
          }).sort(function (left, right) {
            var a = left.criteria;
            var b = right.criteria;
            if (a !== b) {
              if (a > b || a === void 0) return 1;
              if (a < b || b === void 0) return -1;
            }
            return left.index - right.index;
          }), 'value');
        };

        // An internal function used for aggregate "group by" operations.
        var group = function group(behavior) {
          return function (obj, iteratee, context) {
            var result = {};
            iteratee = cb(iteratee, context);
            _.each(obj, function (value, index) {
              var key = iteratee(value, index, obj);
              behavior(result, value, key);
            });
            return result;
          };
        };

        // Groups the object's values by a criterion. Pass either a string attribute
        // to group by, or a function that returns the criterion.
        _.groupBy = group(function (result, value, key) {
          if (_.has(result, key)) result[key].push(value);else result[key] = [value];
        });

        // Indexes the object's values by a criterion, similar to `groupBy`, but for
        // when you know that your index values will be unique.
        _.indexBy = group(function (result, value, key) {
          result[key] = value;
        });

        // Counts instances of an object that group by a certain criterion. Pass
        // either a string attribute to count by, or a function that returns the
        // criterion.
        _.countBy = group(function (result, value, key) {
          if (_.has(result, key)) result[key]++;else result[key] = 1;
        });

        // Safely create a real, live array from anything iterable.
        _.toArray = function (obj) {
          if (!obj) return [];
          if (_.isArray(obj)) return slice.call(obj);
          if (isArrayLike(obj)) return _.map(obj, _.identity);
          return _.values(obj);
        };

        // Return the number of elements in an object.
        _.size = function (obj) {
          if (obj == null) return 0;
          return isArrayLike(obj) ? obj.length : _.keys(obj).length;
        };

        // Split a collection into two arrays: one whose elements all satisfy the given
        // predicate, and one whose elements all do not satisfy the predicate.
        _.partition = function (obj, predicate, context) {
          predicate = cb(predicate, context);
          var pass = [],
              fail = [];
          _.each(obj, function (value, key, obj) {
            (predicate(value, key, obj) ? pass : fail).push(value);
          });
          return [pass, fail];
        };

        // Array Functions
        // ---------------

        // Get the first element of an array. Passing **n** will return the first N
        // values in the array. Aliased as `head` and `take`. The **guard** check
        // allows it to work with `_.map`.
        _.first = _.head = _.take = function (array, n, guard) {
          if (array == null) return void 0;
          if (n == null || guard) return array[0];
          return _.initial(array, array.length - n);
        };

        // Returns everything but the last entry of the array. Especially useful on
        // the arguments object. Passing **n** will return all the values in
        // the array, excluding the last N.
        _.initial = function (array, n, guard) {
          return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
        };

        // Get the last element of an array. Passing **n** will return the last N
        // values in the array.
        _.last = function (array, n, guard) {
          if (array == null) return void 0;
          if (n == null || guard) return array[array.length - 1];
          return _.rest(array, Math.max(0, array.length - n));
        };

        // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
        // Especially useful on the arguments object. Passing an **n** will return
        // the rest N values in the array.
        _.rest = _.tail = _.drop = function (array, n, guard) {
          return slice.call(array, n == null || guard ? 1 : n);
        };

        // Trim out all falsy values from an array.
        _.compact = function (array) {
          return _.filter(array, _.identity);
        };

        // Internal implementation of a recursive `flatten` function.
        var flatten = function flatten(input, shallow, strict, startIndex) {
          var output = [],
              idx = 0;
          for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
            var value = input[i];
            if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
              //flatten current level of array or arguments object
              if (!shallow) value = flatten(value, shallow, strict);
              var j = 0,
                  len = value.length;
              output.length += len;
              while (j < len) {
                output[idx++] = value[j++];
              }
            } else if (!strict) {
              output[idx++] = value;
            }
          }
          return output;
        };

        // Flatten out an array, either recursively (by default), or just one level.
        _.flatten = function (array, shallow) {
          return flatten(array, shallow, false);
        };

        // Return a version of the array that does not contain the specified value(s).
        _.without = function (array) {
          return _.difference(array, slice.call(arguments, 1));
        };

        // Produce a duplicate-free version of the array. If the array has already
        // been sorted, you have the option of using a faster algorithm.
        // Aliased as `unique`.
        _.uniq = _.unique = function (array, isSorted, iteratee, context) {
          if (!_.isBoolean(isSorted)) {
            context = iteratee;
            iteratee = isSorted;
            isSorted = false;
          }
          if (iteratee != null) iteratee = cb(iteratee, context);
          var result = [];
          var seen = [];
          for (var i = 0, length = getLength(array); i < length; i++) {
            var value = array[i],
                computed = iteratee ? iteratee(value, i, array) : value;
            if (isSorted) {
              if (!i || seen !== computed) result.push(value);
              seen = computed;
            } else if (iteratee) {
              if (!_.contains(seen, computed)) {
                seen.push(computed);
                result.push(value);
              }
            } else if (!_.contains(result, value)) {
              result.push(value);
            }
          }
          return result;
        };

        // Produce an array that contains the union: each distinct element from all of
        // the passed-in arrays.
        _.union = function () {
          return _.uniq(flatten(arguments, true, true));
        };

        // Produce an array that contains every item shared between all the
        // passed-in arrays.
        _.intersection = function (array) {
          var result = [];
          var argsLength = arguments.length;
          for (var i = 0, length = getLength(array); i < length; i++) {
            var item = array[i];
            if (_.contains(result, item)) continue;
            for (var j = 1; j < argsLength; j++) {
              if (!_.contains(arguments[j], item)) break;
            }
            if (j === argsLength) result.push(item);
          }
          return result;
        };

        // Take the difference between one array and a number of other arrays.
        // Only the elements present in just the first array will remain.
        _.difference = function (array) {
          var rest = flatten(arguments, true, true, 1);
          return _.filter(array, function (value) {
            return !_.contains(rest, value);
          });
        };

        // Zip together multiple lists into a single array -- elements that share
        // an index go together.
        _.zip = function () {
          return _.unzip(arguments);
        };

        // Complement of _.zip. Unzip accepts an array of arrays and groups
        // each array's elements on shared indices
        _.unzip = function (array) {
          var length = array && _.max(array, getLength).length || 0;
          var result = Array(length);

          for (var index = 0; index < length; index++) {
            result[index] = _.pluck(array, index);
          }
          return result;
        };

        // Converts lists into objects. Pass either a single array of `[key, value]`
        // pairs, or two parallel arrays of the same length -- one of keys, and one of
        // the corresponding values.
        _.object = function (list, values) {
          var result = {};
          for (var i = 0, length = getLength(list); i < length; i++) {
            if (values) {
              result[list[i]] = values[i];
            } else {
              result[list[i][0]] = list[i][1];
            }
          }
          return result;
        };

        // Generator function to create the findIndex and findLastIndex functions
        function createPredicateIndexFinder(dir) {
          return function (array, predicate, context) {
            predicate = cb(predicate, context);
            var length = getLength(array);
            var index = dir > 0 ? 0 : length - 1;
            for (; index >= 0 && index < length; index += dir) {
              if (predicate(array[index], index, array)) return index;
            }
            return -1;
          };
        }

        // Returns the first index on an array-like that passes a predicate test
        _.findIndex = createPredicateIndexFinder(1);
        _.findLastIndex = createPredicateIndexFinder(-1);

        // Use a comparator function to figure out the smallest index at which
        // an object should be inserted so as to maintain order. Uses binary search.
        _.sortedIndex = function (array, obj, iteratee, context) {
          iteratee = cb(iteratee, context, 1);
          var value = iteratee(obj);
          var low = 0,
              high = getLength(array);
          while (low < high) {
            var mid = Math.floor((low + high) / 2);
            if (iteratee(array[mid]) < value) low = mid + 1;else high = mid;
          }
          return low;
        };

        // Generator function to create the indexOf and lastIndexOf functions
        function createIndexFinder(dir, predicateFind, sortedIndex) {
          return function (array, item, idx) {
            var i = 0,
                length = getLength(array);
            if (typeof idx == 'number') {
              if (dir > 0) {
                i = idx >= 0 ? idx : Math.max(idx + length, i);
              } else {
                length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
              }
            } else if (sortedIndex && idx && length) {
              idx = sortedIndex(array, item);
              return array[idx] === item ? idx : -1;
            }
            if (item !== item) {
              idx = predicateFind(slice.call(array, i, length), _.isNaN);
              return idx >= 0 ? idx + i : -1;
            }
            for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
              if (array[idx] === item) return idx;
            }
            return -1;
          };
        }

        // Return the position of the first occurrence of an item in an array,
        // or -1 if the item is not included in the array.
        // If the array is large and already in sort order, pass `true`
        // for **isSorted** to use binary search.
        _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
        _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

        // Generate an integer Array containing an arithmetic progression. A port of
        // the native Python `range()` function. See
        // [the Python documentation](http://docs.python.org/library/functions.html#range).
        _.range = function (start, stop, step) {
          if (stop == null) {
            stop = start || 0;
            start = 0;
          }
          step = step || 1;

          var length = Math.max(Math.ceil((stop - start) / step), 0);
          var range = Array(length);

          for (var idx = 0; idx < length; idx++, start += step) {
            range[idx] = start;
          }

          return range;
        };

        // Function (ahem) Functions
        // ------------------

        // Determines whether to execute a function as a constructor
        // or a normal function with the provided arguments
        var executeBound = function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
          if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
          var self = baseCreate(sourceFunc.prototype);
          var result = sourceFunc.apply(self, args);
          if (_.isObject(result)) return result;
          return self;
        };

        // Create a function bound to a given object (assigning `this`, and arguments,
        // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
        // available.
        _.bind = function (func, context) {
          if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
          if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
          var args = slice.call(arguments, 2);
          var bound = function bound() {
            return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
          };
          return bound;
        };

        // Partially apply a function by creating a version that has had some of its
        // arguments pre-filled, without changing its dynamic `this` context. _ acts
        // as a placeholder, allowing any combination of arguments to be pre-filled.
        _.partial = function (func) {
          var boundArgs = slice.call(arguments, 1);
          var bound = function bound() {
            var position = 0,
                length = boundArgs.length;
            var args = Array(length);
            for (var i = 0; i < length; i++) {
              args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
            }
            while (position < arguments.length) {
              args.push(arguments[position++]);
            }return executeBound(func, bound, this, this, args);
          };
          return bound;
        };

        // Bind a number of an object's methods to that object. Remaining arguments
        // are the method names to be bound. Useful for ensuring that all callbacks
        // defined on an object belong to it.
        _.bindAll = function (obj) {
          var i,
              length = arguments.length,
              key;
          if (length <= 1) throw new Error('bindAll must be passed function names');
          for (i = 1; i < length; i++) {
            key = arguments[i];
            obj[key] = _.bind(obj[key], obj);
          }
          return obj;
        };

        // Memoize an expensive function by storing its results.
        _.memoize = function (func, hasher) {
          var memoize = function memoize(key) {
            var cache = memoize.cache;
            var address = '' + (hasher ? hasher.apply(this, arguments) : key);
            if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
            return cache[address];
          };
          memoize.cache = {};
          return memoize;
        };

        // Delays a function for the given number of milliseconds, and then calls
        // it with the arguments supplied.
        _.delay = function (func, wait) {
          var args = slice.call(arguments, 2);
          return setTimeout(function () {
            return func.apply(null, args);
          }, wait);
        };

        // Defers a function, scheduling it to run after the current call stack has
        // cleared.
        _.defer = _.partial(_.delay, _, 1);

        // Returns a function, that, when invoked, will only be triggered at most once
        // during a given window of time. Normally, the throttled function will run
        // as much as it can, without ever going more than once per `wait` duration;
        // but if you'd like to disable the execution on the leading edge, pass
        // `{leading: false}`. To disable execution on the trailing edge, ditto.
        _.throttle = function (func, wait, options) {
          var context, args, result;
          var timeout = null;
          var previous = 0;
          if (!options) options = {};
          var later = function later() {
            previous = options.leading === false ? 0 : _.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
          };
          return function () {
            var now = _.now();
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
              if (timeout) {
                clearTimeout(timeout);
                timeout = null;
              }
              previous = now;
              result = func.apply(context, args);
              if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
              timeout = setTimeout(later, remaining);
            }
            return result;
          };
        };

        // Returns a function, that, as long as it continues to be invoked, will not
        // be triggered. The function will be called after it stops being called for
        // N milliseconds. If `immediate` is passed, trigger the function on the
        // leading edge, instead of the trailing.
        _.debounce = function (func, wait, immediate) {
          var timeout, args, context, timestamp, result;

          var later = function later() {
            var last = _.now() - timestamp;

            if (last < wait && last >= 0) {
              timeout = setTimeout(later, wait - last);
            } else {
              timeout = null;
              if (!immediate) {
                result = func.apply(context, args);
                if (!timeout) context = args = null;
              }
            }
          };

          return function () {
            context = this;
            args = arguments;
            timestamp = _.now();
            var callNow = immediate && !timeout;
            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
              result = func.apply(context, args);
              context = args = null;
            }

            return result;
          };
        };

        // Returns the first function passed as an argument to the second,
        // allowing you to adjust arguments, run code before and after, and
        // conditionally execute the original function.
        _.wrap = function (func, wrapper) {
          return _.partial(wrapper, func);
        };

        // Returns a negated version of the passed-in predicate.
        _.negate = function (predicate) {
          return function () {
            return !predicate.apply(this, arguments);
          };
        };

        // Returns a function that is the composition of a list of functions, each
        // consuming the return value of the function that follows.
        _.compose = function () {
          var args = arguments;
          var start = args.length - 1;
          return function () {
            var i = start;
            var result = args[start].apply(this, arguments);
            while (i--) {
              result = args[i].call(this, result);
            }return result;
          };
        };

        // Returns a function that will only be executed on and after the Nth call.
        _.after = function (times, func) {
          return function () {
            if (--times < 1) {
              return func.apply(this, arguments);
            }
          };
        };

        // Returns a function that will only be executed up to (but not including) the Nth call.
        _.before = function (times, func) {
          var memo;
          return function () {
            if (--times > 0) {
              memo = func.apply(this, arguments);
            }
            if (times <= 1) func = null;
            return memo;
          };
        };

        // Returns a function that will be executed at most one time, no matter how
        // often you call it. Useful for lazy initialization.
        _.once = _.partial(_.before, 2);

        // Object Functions
        // ----------------

        // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
        var hasEnumBug = !{ toString: null }.propertyIsEnumerable('toString');
        var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

        function collectNonEnumProps(obj, keys) {
          var nonEnumIdx = nonEnumerableProps.length;
          var constructor = obj.constructor;
          var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

          // Constructor is a special case.
          var prop = 'constructor';
          if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

          while (nonEnumIdx--) {
            prop = nonEnumerableProps[nonEnumIdx];
            if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
              keys.push(prop);
            }
          }
        }

        // Retrieve the names of an object's own properties.
        // Delegates to **ECMAScript 5**'s native `Object.keys`
        _.keys = function (obj) {
          if (!_.isObject(obj)) return [];
          if (nativeKeys) return nativeKeys(obj);
          var keys = [];
          for (var key in obj) {
            if (_.has(obj, key)) keys.push(key);
          } // Ahem, IE < 9.
          if (hasEnumBug) collectNonEnumProps(obj, keys);
          return keys;
        };

        // Retrieve all the property names of an object.
        _.allKeys = function (obj) {
          if (!_.isObject(obj)) return [];
          var keys = [];
          for (var key in obj) {
            keys.push(key);
          } // Ahem, IE < 9.
          if (hasEnumBug) collectNonEnumProps(obj, keys);
          return keys;
        };

        // Retrieve the values of an object's properties.
        _.values = function (obj) {
          var keys = _.keys(obj);
          var length = keys.length;
          var values = Array(length);
          for (var i = 0; i < length; i++) {
            values[i] = obj[keys[i]];
          }
          return values;
        };

        // Returns the results of applying the iteratee to each element of the object
        // In contrast to _.map it returns an object
        _.mapObject = function (obj, iteratee, context) {
          iteratee = cb(iteratee, context);
          var keys = _.keys(obj),
              length = keys.length,
              results = {},
              currentKey;
          for (var index = 0; index < length; index++) {
            currentKey = keys[index];
            results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
          }
          return results;
        };

        // Convert an object into a list of `[key, value]` pairs.
        _.pairs = function (obj) {
          var keys = _.keys(obj);
          var length = keys.length;
          var pairs = Array(length);
          for (var i = 0; i < length; i++) {
            pairs[i] = [keys[i], obj[keys[i]]];
          }
          return pairs;
        };

        // Invert the keys and values of an object. The values must be serializable.
        _.invert = function (obj) {
          var result = {};
          var keys = _.keys(obj);
          for (var i = 0, length = keys.length; i < length; i++) {
            result[obj[keys[i]]] = keys[i];
          }
          return result;
        };

        // Return a sorted list of the function names available on the object.
        // Aliased as `methods`
        _.functions = _.methods = function (obj) {
          var names = [];
          for (var key in obj) {
            if (_.isFunction(obj[key])) names.push(key);
          }
          return names.sort();
        };

        // Extend a given object with all the properties in passed-in object(s).
        _.extend = createAssigner(_.allKeys);

        // Assigns a given object with all the own properties in the passed-in object(s)
        // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
        _.extendOwn = _.assign = createAssigner(_.keys);

        // Returns the first key on an object that passes a predicate test
        _.findKey = function (obj, predicate, context) {
          predicate = cb(predicate, context);
          var keys = _.keys(obj),
              key;
          for (var i = 0, length = keys.length; i < length; i++) {
            key = keys[i];
            if (predicate(obj[key], key, obj)) return key;
          }
        };

        // Return a copy of the object only containing the whitelisted properties.
        _.pick = function (object, oiteratee, context) {
          var result = {},
              obj = object,
              iteratee,
              keys;
          if (obj == null) return result;
          if (_.isFunction(oiteratee)) {
            keys = _.allKeys(obj);
            iteratee = optimizeCb(oiteratee, context);
          } else {
            keys = flatten(arguments, false, false, 1);
            iteratee = function iteratee(value, key, obj) {
              return key in obj;
            };
            obj = Object(obj);
          }
          for (var i = 0, length = keys.length; i < length; i++) {
            var key = keys[i];
            var value = obj[key];
            if (iteratee(value, key, obj)) result[key] = value;
          }
          return result;
        };

        // Return a copy of the object without the blacklisted properties.
        _.omit = function (obj, iteratee, context) {
          if (_.isFunction(iteratee)) {
            iteratee = _.negate(iteratee);
          } else {
            var keys = _.map(flatten(arguments, false, false, 1), String);
            iteratee = function iteratee(value, key) {
              return !_.contains(keys, key);
            };
          }
          return _.pick(obj, iteratee, context);
        };

        // Fill in a given object with default properties.
        _.defaults = createAssigner(_.allKeys, true);

        // Creates an object that inherits from the given prototype object.
        // If additional properties are provided then they will be added to the
        // created object.
        _.create = function (prototype, props) {
          var result = baseCreate(prototype);
          if (props) _.extendOwn(result, props);
          return result;
        };

        // Create a (shallow-cloned) duplicate of an object.
        _.clone = function (obj) {
          if (!_.isObject(obj)) return obj;
          return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
        };

        // Invokes interceptor with the obj, and then returns obj.
        // The primary purpose of this method is to "tap into" a method chain, in
        // order to perform operations on intermediate results within the chain.
        _.tap = function (obj, interceptor) {
          interceptor(obj);
          return obj;
        };

        // Returns whether an object has a given set of `key:value` pairs.
        _.isMatch = function (object, attrs) {
          var keys = _.keys(attrs),
              length = keys.length;
          if (object == null) return !length;
          var obj = Object(object);
          for (var i = 0; i < length; i++) {
            var key = keys[i];
            if (attrs[key] !== obj[key] || !(key in obj)) return false;
          }
          return true;
        };

        // Internal recursive comparison function for `isEqual`.
        var eq = function eq(a, b, aStack, bStack) {
          // Identical objects are equal. `0 === -0`, but they aren't identical.
          // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
          if (a === b) return a !== 0 || 1 / a === 1 / b;
          // A strict comparison is necessary because `null == undefined`.
          if (a == null || b == null) return a === b;
          // Unwrap any wrapped objects.
          if (a instanceof _) a = a._wrapped;
          if (b instanceof _) b = b._wrapped;
          // Compare `[[Class]]` names.
          var className = toString.call(a);
          if (className !== toString.call(b)) return false;
          switch (className) {
            // Strings, numbers, regular expressions, dates, and booleans are compared by value.
            case '[object RegExp]':
            // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
            case '[object String]':
              // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
              // equivalent to `new String("5")`.
              return '' + a === '' + b;
            case '[object Number]':
              // `NaN`s are equivalent, but non-reflexive.
              // Object(NaN) is equivalent to NaN
              if (+a !== +a) return +b !== +b;
              // An `egal` comparison is performed for other numeric values.
              return +a === 0 ? 1 / +a === 1 / b : +a === +b;
            case '[object Date]':
            case '[object Boolean]':
              // Coerce dates and booleans to numeric primitive values. Dates are compared by their
              // millisecond representations. Note that invalid dates with millisecond representations
              // of `NaN` are not equivalent.
              return +a === +b;
          }

          var areArrays = className === '[object Array]';
          if (!areArrays) {
            if ((typeof a === "undefined" ? "undefined" : _typeof(a)) != 'object' || (typeof b === "undefined" ? "undefined" : _typeof(b)) != 'object') return false;

            // Objects with different constructors are not equivalent, but `Object`s or `Array`s
            // from different frames are.
            var aCtor = a.constructor,
                bCtor = b.constructor;
            if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor) && 'constructor' in a && 'constructor' in b) {
              return false;
            }
          }
          // Assume equality for cyclic structures. The algorithm for detecting cyclic
          // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

          // Initializing stack of traversed objects.
          // It's done here since we only need them for objects and arrays comparison.
          aStack = aStack || [];
          bStack = bStack || [];
          var length = aStack.length;
          while (length--) {
            // Linear search. Performance is inversely proportional to the number of
            // unique nested structures.
            if (aStack[length] === a) return bStack[length] === b;
          }

          // Add the first object to the stack of traversed objects.
          aStack.push(a);
          bStack.push(b);

          // Recursively compare objects and arrays.
          if (areArrays) {
            // Compare array lengths to determine if a deep comparison is necessary.
            length = a.length;
            if (length !== b.length) return false;
            // Deep compare the contents, ignoring non-numeric properties.
            while (length--) {
              if (!eq(a[length], b[length], aStack, bStack)) return false;
            }
          } else {
            // Deep compare objects.
            var keys = _.keys(a),
                key;
            length = keys.length;
            // Ensure that both objects contain the same number of properties before comparing deep equality.
            if (_.keys(b).length !== length) return false;
            while (length--) {
              // Deep compare each member
              key = keys[length];
              if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
            }
          }
          // Remove the first object from the stack of traversed objects.
          aStack.pop();
          bStack.pop();
          return true;
        };

        // Perform a deep comparison to check if two objects are equal.
        _.isEqual = function (a, b) {
          return eq(a, b);
        };

        // Is a given array, string, or object empty?
        // An "empty" object has no enumerable own-properties.
        _.isEmpty = function (obj) {
          if (obj == null) return true;
          if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
          return _.keys(obj).length === 0;
        };

        // Is a given value a DOM element?
        _.isElement = function (obj) {
          return !!(obj && obj.nodeType === 1);
        };

        // Is a given value an array?
        // Delegates to ECMA5's native Array.isArray
        _.isArray = nativeIsArray || function (obj) {
          return toString.call(obj) === '[object Array]';
        };

        // Is a given variable an object?
        _.isObject = function (obj) {
          var type = typeof obj === "undefined" ? "undefined" : _typeof(obj);
          return type === 'function' || type === 'object' && !!obj;
        };

        // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
        _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function (name) {
          _['is' + name] = function (obj) {
            return toString.call(obj) === '[object ' + name + ']';
          };
        });

        // Define a fallback version of the method in browsers (ahem, IE < 9), where
        // there isn't any inspectable "Arguments" type.
        if (!_.isArguments(arguments)) {
          _.isArguments = function (obj) {
            return _.has(obj, 'callee');
          };
        }

        // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
        // IE 11 (#1621), and in Safari 8 (#1929).
        if (typeof /./ != 'function' && (typeof Int8Array === "undefined" ? "undefined" : _typeof(Int8Array)) != 'object') {
          _.isFunction = function (obj) {
            return typeof obj == 'function' || false;
          };
        }

        // Is a given object a finite number?
        _.isFinite = function (obj) {
          return isFinite(obj) && !isNaN(parseFloat(obj));
        };

        // Is the given value `NaN`? (NaN is the only number which does not equal itself).
        _.isNaN = function (obj) {
          return _.isNumber(obj) && obj !== +obj;
        };

        // Is a given value a boolean?
        _.isBoolean = function (obj) {
          return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
        };

        // Is a given value equal to null?
        _.isNull = function (obj) {
          return obj === null;
        };

        // Is a given variable undefined?
        _.isUndefined = function (obj) {
          return obj === void 0;
        };

        // Shortcut function for checking if an object has a given property directly
        // on itself (in other words, not on a prototype).
        _.has = function (obj, key) {
          return obj != null && hasOwnProperty.call(obj, key);
        };

        // Utility Functions
        // -----------------

        // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
        // previous owner. Returns a reference to the Underscore object.
        _.noConflict = function () {
          root._ = previousUnderscore;
          return this;
        };

        // Keep the identity function around for default iteratees.
        _.identity = function (value) {
          return value;
        };

        // Predicate-generating functions. Often useful outside of Underscore.
        _.constant = function (value) {
          return function () {
            return value;
          };
        };

        _.noop = function () {};

        _.property = property;

        // Generates a function for a given object that returns a given property.
        _.propertyOf = function (obj) {
          return obj == null ? function () {} : function (key) {
            return obj[key];
          };
        };

        // Returns a predicate for checking whether an object has a given set of
        // `key:value` pairs.
        _.matcher = _.matches = function (attrs) {
          attrs = _.extendOwn({}, attrs);
          return function (obj) {
            return _.isMatch(obj, attrs);
          };
        };

        // Run a function **n** times.
        _.times = function (n, iteratee, context) {
          var accum = Array(Math.max(0, n));
          iteratee = optimizeCb(iteratee, context, 1);
          for (var i = 0; i < n; i++) {
            accum[i] = iteratee(i);
          }return accum;
        };

        // Return a random integer between min and max (inclusive).
        _.random = function (min, max) {
          if (max == null) {
            max = min;
            min = 0;
          }
          return min + Math.floor(Math.random() * (max - min + 1));
        };

        // A (possibly faster) way to get the current timestamp as an integer.
        _.now = Date.now || function () {
          return new Date().getTime();
        };

        // List of HTML entities for escaping.
        var escapeMap = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '`': '&#x60;'
        };
        var unescapeMap = _.invert(escapeMap);

        // Functions for escaping and unescaping strings to/from HTML interpolation.
        var createEscaper = function createEscaper(map) {
          var escaper = function escaper(match) {
            return map[match];
          };
          // Regexes for identifying a key that needs to be escaped
          var source = '(?:' + _.keys(map).join('|') + ')';
          var testRegexp = RegExp(source);
          var replaceRegexp = RegExp(source, 'g');
          return function (string) {
            string = string == null ? '' : '' + string;
            return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
          };
        };
        _.escape = createEscaper(escapeMap);
        _.unescape = createEscaper(unescapeMap);

        // If the value of the named `property` is a function then invoke it with the
        // `object` as context; otherwise, return it.
        _.result = function (object, property, fallback) {
          var value = object == null ? void 0 : object[property];
          if (value === void 0) {
            value = fallback;
          }
          return _.isFunction(value) ? value.call(object) : value;
        };

        // Generate a unique integer id (unique within the entire client session).
        // Useful for temporary DOM ids.
        var idCounter = 0;
        _.uniqueId = function (prefix) {
          var id = ++idCounter + '';
          return prefix ? prefix + id : id;
        };

        // By default, Underscore uses ERB-style template delimiters, change the
        // following template settings to use alternative delimiters.
        _.templateSettings = {
          evaluate: /<%([\s\S]+?)%>/g,
          interpolate: /<%=([\s\S]+?)%>/g,
          escape: /<%-([\s\S]+?)%>/g
        };

        // When customizing `templateSettings`, if you don't want to define an
        // interpolation, evaluation or escaping regex, we need one that is
        // guaranteed not to match.
        var noMatch = /(.)^/;

        // Certain characters need to be escaped so that they can be put into a
        // string literal.
        var escapes = {
          "'": "'",
          '\\': '\\',
          '\r': 'r',
          '\n': 'n',
          "\u2028": 'u2028',
          "\u2029": 'u2029'
        };

        var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

        var escapeChar = function escapeChar(match) {
          return '\\' + escapes[match];
        };

        // JavaScript micro-templating, similar to John Resig's implementation.
        // Underscore templating handles arbitrary delimiters, preserves whitespace,
        // and correctly escapes quotes within interpolated code.
        // NB: `oldSettings` only exists for backwards compatibility.
        _.template = function (text, settings, oldSettings) {
          if (!settings && oldSettings) settings = oldSettings;
          settings = _.defaults({}, settings, _.templateSettings);

          // Combine delimiters into one regular expression via alternation.
          var matcher = RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g');

          // Compile the template source, escaping string literals appropriately.
          var index = 0;
          var source = "__p+='";
          text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset).replace(escaper, escapeChar);
            index = offset + match.length;

            if (escape) {
              source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            } else if (interpolate) {
              source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            } else if (evaluate) {
              source += "';\n" + evaluate + "\n__p+='";
            }

            // Adobe VMs need the match returned to produce the correct offest.
            return match;
          });
          source += "';\n";

          // If a variable is not specified, place data values in local scope.
          if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

          source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + 'return __p;\n';

          try {
            var render = new Function(settings.variable || 'obj', '_', source);
          } catch (e) {
            e.source = source;
            throw e;
          }

          var template = function template(data) {
            return render.call(this, data, _);
          };

          // Provide the compiled source as a convenience for precompilation.
          var argument = settings.variable || 'obj';
          template.source = 'function(' + argument + '){\n' + source + '}';

          return template;
        };

        // Add a "chain" function. Start chaining a wrapped Underscore object.
        _.chain = function (obj) {
          var instance = _(obj);
          instance._chain = true;
          return instance;
        };

        // OOP
        // ---------------
        // If Underscore is called as a function, it returns a wrapped object that
        // can be used OO-style. This wrapper holds altered versions of all the
        // underscore functions. Wrapped objects may be chained.

        // Helper function to continue chaining intermediate results.
        var result = function result(instance, obj) {
          return instance._chain ? _(obj).chain() : obj;
        };

        // Add your own custom functions to the Underscore object.
        _.mixin = function (obj) {
          _.each(_.functions(obj), function (name) {
            var func = _[name] = obj[name];
            _.prototype[name] = function () {
              var args = [this._wrapped];
              push.apply(args, arguments);
              return result(this, func.apply(_, args));
            };
          });
        };

        // Add all of the Underscore functions to the wrapper object.
        _.mixin(_);

        // Add all mutator Array functions to the wrapper.
        _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
          var method = ArrayProto[name];
          _.prototype[name] = function () {
            var obj = this._wrapped;
            method.apply(obj, arguments);
            if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
            return result(this, obj);
          };
        });

        // Add all accessor Array functions to the wrapper.
        _.each(['concat', 'join', 'slice'], function (name) {
          var method = ArrayProto[name];
          _.prototype[name] = function () {
            return result(this, method.apply(this._wrapped, arguments));
          };
        });

        // Extracts the result from a wrapped and chained object.
        _.prototype.value = function () {
          return this._wrapped;
        };

        // Provide unwrapping proxy for some methods used in engine operations
        // such as arithmetic and JSON stringification.
        _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

        _.prototype.toString = function () {
          return '' + this._wrapped;
        };

        // AMD registration happens at the end for compatibility with AMD loaders
        // that may not enforce next-turn semantics on modules. Even though general
        // practice for AMD registration is to be anonymous, underscore registers
        // as a named module because, like jQuery, it is a base library that is
        // popular enough to be bundled in a third party lib, but not be part of
        // an AMD load request. Those cases could generate an error when an
        // anonymous define() is called outside of a loader request.
        if (typeof define === 'function' && define.amd) {
          define('underscore', [], function () {
            return _;
          });
        }
      }).call(this);
    }, {}], 19: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      'use strict';

      var _ = require('underscore');

      /*global navigator: false */
      module.exports = function (AV) {
        var PUBLIC_KEY = "*";

        /**
         * Creates a new ACL.
         * If no argument is given, the ACL has no permissions for anyone.
         * If the argument is a AV.User, the ACL will have read and write
         *   permission for only that user.
         * If the argument is any other JSON object, that object will be interpretted
         *   as a serialized ACL created with toJSON().
         * @see AV.Object#setACL
         * @class
         *
         * <p>An ACL, or Access Control List can be added to any
         * <code>AV.Object</code> to restrict access to only a subset of users
         * of your application.</p>
         */
        AV.ACL = function (arg1) {
          var self = this;
          self.permissionsById = {};
          if (_.isObject(arg1)) {
            if (arg1 instanceof AV.User) {
              self.setReadAccess(arg1, true);
              self.setWriteAccess(arg1, true);
            } else {
              if (_.isFunction(arg1)) {
                throw "AV.ACL() called with a function.  Did you forget ()?";
              }
              AV._objectEach(arg1, function (accessList, userId) {
                if (!_.isString(userId)) {
                  throw "Tried to create an ACL with an invalid userId.";
                }
                self.permissionsById[userId] = {};
                AV._objectEach(accessList, function (allowed, permission) {
                  if (permission !== "read" && permission !== "write") {
                    throw "Tried to create an ACL with an invalid permission type.";
                  }
                  if (!_.isBoolean(allowed)) {
                    throw "Tried to create an ACL with an invalid permission value.";
                  }
                  self.permissionsById[userId][permission] = allowed;
                });
              });
            }
          }
        };

        /**
         * Returns a JSON-encoded version of the ACL.
         * @return {Object}
         */
        AV.ACL.prototype.toJSON = function () {
          return _.clone(this.permissionsById);
        };

        AV.ACL.prototype._setAccess = function (accessType, userId, allowed) {
          if (userId instanceof AV.User) {
            userId = userId.id;
          } else if (userId instanceof AV.Role) {
            userId = "role:" + userId.getName();
          }
          if (!_.isString(userId)) {
            throw "userId must be a string.";
          }
          if (!_.isBoolean(allowed)) {
            throw "allowed must be either true or false.";
          }
          var permissions = this.permissionsById[userId];
          if (!permissions) {
            if (!allowed) {
              // The user already doesn't have this permission, so no action needed.
              return;
            } else {
              permissions = {};
              this.permissionsById[userId] = permissions;
            }
          }

          if (allowed) {
            this.permissionsById[userId][accessType] = true;
          } else {
            delete permissions[accessType];
            if (_.isEmpty(permissions)) {
              delete permissions[userId];
            }
          }
        };

        AV.ACL.prototype._getAccess = function (accessType, userId) {
          if (userId instanceof AV.User) {
            userId = userId.id;
          } else if (userId instanceof AV.Role) {
            userId = "role:" + userId.getName();
          }
          var permissions = this.permissionsById[userId];
          if (!permissions) {
            return false;
          }
          return permissions[accessType] ? true : false;
        };

        /**
         * Set whether the given user is allowed to read this object.
         * @param userId An instance of AV.User or its objectId.
         * @param {Boolean} allowed Whether that user should have read access.
         */
        AV.ACL.prototype.setReadAccess = function (userId, allowed) {
          this._setAccess("read", userId, allowed);
        };

        /**
         * Get whether the given user id is *explicitly* allowed to read this object.
         * Even if this returns false, the user may still be able to access it if
         * getPublicReadAccess returns true or a role that the user belongs to has
         * write access.
         * @param userId An instance of AV.User or its objectId, or a AV.Role.
         * @return {Boolean}
         */
        AV.ACL.prototype.getReadAccess = function (userId) {
          return this._getAccess("read", userId);
        };

        /**
         * Set whether the given user id is allowed to write this object.
         * @param userId An instance of AV.User or its objectId, or a AV.Role..
         * @param {Boolean} allowed Whether that user should have write access.
         */
        AV.ACL.prototype.setWriteAccess = function (userId, allowed) {
          this._setAccess("write", userId, allowed);
        };

        /**
         * Get whether the given user id is *explicitly* allowed to write this object.
         * Even if this returns false, the user may still be able to write it if
         * getPublicWriteAccess returns true or a role that the user belongs to has
         * write access.
         * @param userId An instance of AV.User or its objectId, or a AV.Role.
         * @return {Boolean}
         */
        AV.ACL.prototype.getWriteAccess = function (userId) {
          return this._getAccess("write", userId);
        };

        /**
         * Set whether the public is allowed to read this object.
         * @param {Boolean} allowed
         */
        AV.ACL.prototype.setPublicReadAccess = function (allowed) {
          this.setReadAccess(PUBLIC_KEY, allowed);
        };

        /**
         * Get whether the public is allowed to read this object.
         * @return {Boolean}
         */
        AV.ACL.prototype.getPublicReadAccess = function () {
          return this.getReadAccess(PUBLIC_KEY);
        };

        /**
         * Set whether the public is allowed to write this object.
         * @param {Boolean} allowed
         */
        AV.ACL.prototype.setPublicWriteAccess = function (allowed) {
          this.setWriteAccess(PUBLIC_KEY, allowed);
        };

        /**
         * Get whether the public is allowed to write this object.
         * @return {Boolean}
         */
        AV.ACL.prototype.getPublicWriteAccess = function () {
          return this.getWriteAccess(PUBLIC_KEY);
        };

        /**
         * Get whether users belonging to the given role are allowed
         * to read this object. Even if this returns false, the role may
         * still be able to write it if a parent role has read access.
         *
         * @param role The name of the role, or a AV.Role object.
         * @return {Boolean} true if the role has read access. false otherwise.
         * @throws {String} If role is neither a AV.Role nor a String.
         */
        AV.ACL.prototype.getRoleReadAccess = function (role) {
          if (role instanceof AV.Role) {
            // Normalize to the String name
            role = role.getName();
          }
          if (_.isString(role)) {
            return this.getReadAccess("role:" + role);
          }
          throw "role must be a AV.Role or a String";
        };

        /**
         * Get whether users belonging to the given role are allowed
         * to write this object. Even if this returns false, the role may
         * still be able to write it if a parent role has write access.
         *
         * @param role The name of the role, or a AV.Role object.
         * @return {Boolean} true if the role has write access. false otherwise.
         * @throws {String} If role is neither a AV.Role nor a String.
         */
        AV.ACL.prototype.getRoleWriteAccess = function (role) {
          if (role instanceof AV.Role) {
            // Normalize to the String name
            role = role.getName();
          }
          if (_.isString(role)) {
            return this.getWriteAccess("role:" + role);
          }
          throw "role must be a AV.Role or a String";
        };

        /**
         * Set whether users belonging to the given role are allowed
         * to read this object.
         *
         * @param role The name of the role, or a AV.Role object.
         * @param {Boolean} allowed Whether the given role can read this object.
         * @throws {String} If role is neither a AV.Role nor a String.
         */
        AV.ACL.prototype.setRoleReadAccess = function (role, allowed) {
          if (role instanceof AV.Role) {
            // Normalize to the String name
            role = role.getName();
          }
          if (_.isString(role)) {
            this.setReadAccess("role:" + role, allowed);
            return;
          }
          throw "role must be a AV.Role or a String";
        };

        /**
         * Set whether users belonging to the given role are allowed
         * to write this object.
         *
         * @param role The name of the role, or a AV.Role object.
         * @param {Boolean} allowed Whether the given role can write this object.
         * @throws {String} If role is neither a AV.Role nor a String.
         */
        AV.ACL.prototype.setRoleWriteAccess = function (role, allowed) {
          if (role instanceof AV.Role) {
            // Normalize to the String name
            role = role.getName();
          }
          if (_.isString(role)) {
            this.setWriteAccess("role:" + role, allowed);
            return;
          }
          throw "role must be a AV.Role or a String";
        };
      };
    }, { "underscore": 18 }], 20: [function (require, module, exports) {
      (function (global) {
        module.exports = global.AV || {};
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {}], 21: [function (require, module, exports) {
      (function (global) {
        /**
         * 每位工程师都有保持代码优雅的义务
         * Each engineer has a duty to keep the code elegant
        **/

        'use strict';

        var _ = require('underscore');
        var Promise = require('../promise');

        // interface Storage {
        //   readonly attribute boolean async;
        //   string getItem(string key);
        //   void setItem(string key, string value);
        //   void removeItem(string key);
        //   void clear();
        //   Promise getItemAsync(string key);
        //   Promise setItemAsync(string key, string value);
        //   Promise removeItemAsync(string key);
        //   Promise clearAsync();
        // }
        var Storage = {};
        var apiNames = ['getItem', 'setItem', 'removeItem', 'clear'];

        if (global.localStorage) {

          var localStorage = global.localStorage;

          try {
            var testKey = '__storejs__';
            localStorage.setItem(testKey, testKey);
            if (localStorage.getItem(testKey) != testKey) {
              throw new Error();
            }
            localStorage.removeItem(testKey);
          } catch (e) {
            localStorage = require('localstorage-memory');
          }

          // in browser, `localStorage.async = false` will excute `localStorage.setItem('async', false)`
          _(apiNames).each(function (apiName) {
            Storage[apiName] = function () {
              return global.localStorage[apiName].apply(global.localStorage, arguments);
            };
          });
          Storage.async = false;
        } else {
          var AsyncStorage = require('react-native').AsyncStorage;
          _(apiNames).each(function (apiName) {
            Storage[apiName + 'Async'] = function () {
              return Promise.as(AsyncStorage[apiName].apply(AsyncStorage, arguments));
            };
          });
          Storage.async = true;
        }

        module.exports = Storage;
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, { "../promise": 34, "localstorage-memory": 9, "react-native": 1, "underscore": 18 }], 22: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      'use strict';

      var dataURItoBlob = function dataURItoBlob(dataURI, type) {
        var byteString;

        // 传入的 base64，不是 dataURL
        if (dataURI.indexOf('base64') < 0) {
          byteString = atob(dataURI);
        } else if (dataURI.split(',')[0].indexOf('base64') >= 0) {
          byteString = atob(dataURI.split(',')[1]);
        } else {
          byteString = unescape(dataURI.split(',')[1]);
        }
        // separate out the mime component
        var mimeString = type || dataURI.split(',')[0].split(':')[1].split(';')[0];
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ia], { type: mimeString });
      };

      module.exports = dataURItoBlob;
    }, {}], 23: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      var storage = require('./localstorage');
      var AV = require('./av');

      var removeAsync = exports.removeAsync = storage.removeItemAsync.bind(storage);

      var getCacheData = function getCacheData(cacheData, key) {
        try {
          cacheData = JSON.parse(cacheData);
        } catch (e) {
          return null;
        }
        if (cacheData) {
          var expired = cacheData.expiredAt && cacheData.expiredAt < Date.now();
          if (!expired) {
            return cacheData.value;
          }
          return removeAsync(key).then(function () {
            return null;
          });
        }
        return null;
      };

      exports.getAsync = function (key) {
        key = AV.applicationId + "/" + key;
        return storage.getItemAsync(key).then(function (cache) {
          return getCacheData(cache, key);
        });
      };

      exports.setAsync = function (key, value, ttl) {
        var cache = { value: value };
        if (typeof ttl === 'number') {
          cache.expiredAt = Date.now() + ttl;
        }
        return storage.setItemAsync(AV.applicationId + "/" + key, JSON.stringify(cache));
      };
    }, { "./av": 20, "./localstorage": 31 }], 24: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      var _ = require('underscore');
      var AVRequest = require('./request').request;

      module.exports = function (AV) {
        /**
         * @namespace Contains functions for calling and declaring
         * <a href="/docs/cloud_code_guide#functions">cloud functions</a>.
         * <p><strong><em>
         *   Some functions are only available from Cloud Code.
         * </em></strong></p>
         */
        AV.Cloud = AV.Cloud || {};

        _.extend(AV.Cloud, /** @lends AV.Cloud */{
          /**
           * Makes a call to a cloud function.
           * @param {String} name The function name.
           * @param {Object} data The parameters to send to the cloud function.
           * @param {Object} options A Backbone-style options object
           * options.success, if set, should be a function to handle a successful
           * call to a cloud function.  options.error should be a function that
           * handles an error running the cloud function.  Both functions are
           * optional.  Both functions take a single argument.
           * @return {AV.Promise} A promise that will be resolved with the result
           * of the function.
           */
          run: function run(name, data, options) {
            var request = AVRequest('functions', name, null, 'POST', AV._encode(data, null, true), options && options.sessionToken);

            return request.then(function (resp) {
              return AV._decode(null, resp).result;
            })._thenRunCallbacks(options);
          },

          /**
           * Makes a call to a cloud function, you can send {AV.Object} as param or a field of param; the response
           * from server will also be parsed as an {AV.Object}, array of {AV.Object}, or object includes {AV.Object}
           * @param {String} name The function name.
           * @param {Object} data The parameters to send to the cloud function.
           * @param {Object} options A Backbone-style options object.
           * @return {AV.Promise} A promise that will be resolved with the result of the function.
           */
          rpc: function rpc(name, data, options) {
            if (_.isArray(data)) {
              return AV.Promise.error(new Error('Can\'t pass Array as the param of rpc function in JavaScript SDK.'))._thenRunCallbacks(options);
            }

            return AVRequest('call', name, null, 'POST', AV._encodeObjectOrArray(data), options && options.sessionToken).then(function (resp) {
              return AV._decode('', resp).result;
            })._thenRunCallbacks(options);
          },

          /**
           * Make a call to request server date time.
           * @param {Object} options A Backbone-style options object
           * options.success, if set, should be a function to handle a successful
           * call to a cloud function.  options.error should be a function that
           * handles an error running the cloud function.  Both functions are
           * optional.  Both functions take a single argument.
           * @return {AV.Promise} A promise that will be resolved with the result
           * of the function.
           * @since 0.5.9
           */
          getServerDate: function getServerDate(options) {
            var request = AVRequest("date", null, null, 'GET');

            return request.then(function (resp) {
              return AV._decode(null, resp);
            })._thenRunCallbacks(options);
          },

          /**
           * Makes a call to request a sms code for operation verification.
           * @param {Object} data The mobile phone number string or a JSON
           *    object that contains mobilePhoneNumber,template,op,ttl,name etc.
           * @param {Object} options A Backbone-style options object
           * @return {AV.Promise} A promise that will be resolved with the result
           * of the function.
           */
          requestSmsCode: function requestSmsCode(data, options) {
            if (_.isString(data)) {
              data = { mobilePhoneNumber: data };
            }
            if (!data.mobilePhoneNumber) {
              throw "Missing mobilePhoneNumber.";
            }
            var request = AVRequest("requestSmsCode", null, null, 'POST', data);
            return request._thenRunCallbacks(options);
          },

          /**
           * Makes a call to verify sms code that sent by AV.Cloud.requestSmsCode
           * @param {String} code The sms code sent by AV.Cloud.requestSmsCode
           * @param {phone} phone The mobile phoner number(optional).
           * @param {Object} options A Backbone-style options object
           * @return {AV.Promise} A promise that will be resolved with the result
           * of the function.
           */
          verifySmsCode: function verifySmsCode(code, phone, options) {
            if (!code) throw "Missing sms code.";
            var params = {};
            if (_.isString(phone)) {
              params['mobilePhoneNumber'] = phone;
            } else {
              // To be compatible with old versions.
              options = phone;
            }

            var request = AVRequest("verifySmsCode", code, null, 'POST', params);
            return request._thenRunCallbacks(options);
          }
        });
      };
    }, { "./request": 38, "underscore": 18 }], 25: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      var _ = require('underscore');

      // Class used for all objects passed to error callbacks
      function AVError(code, message) {
        var error = new Error(message);
        error.code = code;
        return error;
      }

      _.extend(AVError, {
        /**
         * Error code indicating some error other than those enumerated here.
         * @constant
         */
        OTHER_CAUSE: -1,

        /**
         * Error code indicating that something has gone wrong with the server.
         * If you get this error code, it is AV's fault. Contact us at
         * https://avoscloud.com/help
         * @constant
         */
        INTERNAL_SERVER_ERROR: 1,

        /**
         * Error code indicating the connection to the AV servers failed.
         * @constant
         */
        CONNECTION_FAILED: 100,

        /**
         * Error code indicating the specified object doesn't exist.
         * @constant
         */
        OBJECT_NOT_FOUND: 101,

        /**
         * Error code indicating you tried to query with a datatype that doesn't
         * support it, like exact matching an array or object.
         * @constant
         */
        INVALID_QUERY: 102,

        /**
         * Error code indicating a missing or invalid classname. Classnames are
         * case-sensitive. They must start with a letter, and a-zA-Z0-9_ are the
         * only valid characters.
         * @constant
         */
        INVALID_CLASS_NAME: 103,

        /**
         * Error code indicating an unspecified object id.
         * @constant
         */
        MISSING_OBJECT_ID: 104,

        /**
         * Error code indicating an invalid key name. Keys are case-sensitive. They
         * must start with a letter, and a-zA-Z0-9_ are the only valid characters.
         * @constant
         */
        INVALID_KEY_NAME: 105,

        /**
         * Error code indicating a malformed pointer. You should not see this unless
         * you have been mucking about changing internal AV code.
         * @constant
         */
        INVALID_POINTER: 106,

        /**
         * Error code indicating that badly formed JSON was received upstream. This
         * either indicates you have done something unusual with modifying how
         * things encode to JSON, or the network is failing badly.
         * @constant
         */
        INVALID_JSON: 107,

        /**
         * Error code indicating that the feature you tried to access is only
         * available internally for testing purposes.
         * @constant
         */
        COMMAND_UNAVAILABLE: 108,

        /**
         * You must call AV.initialize before using the AV library.
         * @constant
         */
        NOT_INITIALIZED: 109,

        /**
         * Error code indicating that a field was set to an inconsistent type.
         * @constant
         */
        INCORRECT_TYPE: 111,

        /**
         * Error code indicating an invalid channel name. A channel name is either
         * an empty string (the broadcast channel) or contains only a-zA-Z0-9_
         * characters.
         * @constant
         */
        INVALID_CHANNEL_NAME: 112,

        /**
         * Error code indicating that push is misconfigured.
         * @constant
         */
        PUSH_MISCONFIGURED: 115,

        /**
         * Error code indicating that the object is too large.
         * @constant
         */
        OBJECT_TOO_LARGE: 116,

        /**
         * Error code indicating that the operation isn't allowed for clients.
         * @constant
         */
        OPERATION_FORBIDDEN: 119,

        /**
         * Error code indicating the result was not found in the cache.
         * @constant
         */
        CACHE_MISS: 120,

        /**
         * Error code indicating that an invalid key was used in a nested
         * JSONObject.
         * @constant
         */
        INVALID_NESTED_KEY: 121,

        /**
         * Error code indicating that an invalid filename was used for AVFile.
         * A valid file name contains only a-zA-Z0-9_. characters and is between 1
         * and 128 characters.
         * @constant
         */
        INVALID_FILE_NAME: 122,

        /**
         * Error code indicating an invalid ACL was provided.
         * @constant
         */
        INVALID_ACL: 123,

        /**
         * Error code indicating that the request timed out on the server. Typically
         * this indicates that the request is too expensive to run.
         * @constant
         */
        TIMEOUT: 124,

        /**
         * Error code indicating that the email address was invalid.
         * @constant
         */
        INVALID_EMAIL_ADDRESS: 125,

        /**
         * Error code indicating a missing content type.
         * @constant
         */
        MISSING_CONTENT_TYPE: 126,

        /**
         * Error code indicating a missing content length.
         * @constant
         */
        MISSING_CONTENT_LENGTH: 127,

        /**
         * Error code indicating an invalid content length.
         * @constant
         */
        INVALID_CONTENT_LENGTH: 128,

        /**
         * Error code indicating a file that was too large.
         * @constant
         */
        FILE_TOO_LARGE: 129,

        /**
         * Error code indicating an error saving a file.
         * @constant
         */
        FILE_SAVE_ERROR: 130,

        /**
         * Error code indicating an error deleting a file.
         * @constant
         */
        FILE_DELETE_ERROR: 153,

        /**
         * Error code indicating that a unique field was given a value that is
         * already taken.
         * @constant
         */
        DUPLICATE_VALUE: 137,

        /**
         * Error code indicating that a role's name is invalid.
         * @constant
         */
        INVALID_ROLE_NAME: 139,

        /**
         * Error code indicating that an application quota was exceeded.  Upgrade to
         * resolve.
         * @constant
         */
        EXCEEDED_QUOTA: 140,

        /**
         * Error code indicating that a Cloud Code script failed.
         * @constant
         */
        SCRIPT_FAILED: 141,

        /**
         * Error code indicating that a Cloud Code validation failed.
         * @constant
         */
        VALIDATION_ERROR: 142,

        /**
         * Error code indicating that invalid image data was provided.
         * @constant
         */
        INVALID_IMAGE_DATA: 150,

        /**
         * Error code indicating an unsaved file.
         * @constant
         */
        UNSAVED_FILE_ERROR: 151,

        /**
         * Error code indicating an invalid push time.
         */
        INVALID_PUSH_TIME_ERROR: 152,

        /**
         * Error code indicating that the username is missing or empty.
         * @constant
         */
        USERNAME_MISSING: 200,

        /**
         * Error code indicating that the password is missing or empty.
         * @constant
         */
        PASSWORD_MISSING: 201,

        /**
         * Error code indicating that the username has already been taken.
         * @constant
         */
        USERNAME_TAKEN: 202,

        /**
         * Error code indicating that the email has already been taken.
         * @constant
         */
        EMAIL_TAKEN: 203,

        /**
         * Error code indicating that the email is missing, but must be specified.
         * @constant
         */
        EMAIL_MISSING: 204,

        /**
         * Error code indicating that a user with the specified email was not found.
         * @constant
         */
        EMAIL_NOT_FOUND: 205,

        /**
         * Error code indicating that a user object without a valid session could
         * not be altered.
         * @constant
         */
        SESSION_MISSING: 206,

        /**
         * Error code indicating that a user can only be created through signup.
         * @constant
         */
        MUST_CREATE_USER_THROUGH_SIGNUP: 207,

        /**
         * Error code indicating that an an account being linked is already linked
         * to another user.
         * @constant
         */
        ACCOUNT_ALREADY_LINKED: 208,

        /**
         * Error code indicating that a user cannot be linked to an account because
         * that account's id could not be found.
         * @constant
         */
        LINKED_ID_MISSING: 250,

        /**
         * Error code indicating that a user with a linked (e.g. Facebook) account
         * has an invalid session.
         * @constant
         */
        INVALID_LINKED_SESSION: 251,

        /**
         * Error code indicating that a service being linked (e.g. Facebook or
         * Twitter) is unsupported.
         * @constant
         */
        UNSUPPORTED_SERVICE: 252,
        /**
         * Error code indicating a real error code is unavailable because
         * we had to use an XDomainRequest object to allow CORS requests in
         * Internet Explorer, which strips the body from HTTP responses that have
         * a non-2XX status code.
         * @constant
         */
        X_DOMAIN_REQUEST: 602
      });

      module.exports = AVError;
    }, { "underscore": 18 }], 26: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      /*global _: false */
      module.exports = function (AV) {
        var eventSplitter = /\s+/;
        var slice = Array.prototype.slice;

        /**
         * @class
         *
         * <p>AV.Events is a fork of Backbone's Events module, provided for your
         * convenience.</p>
         *
         * <p>A module that can be mixed in to any object in order to provide
         * it with custom events. You may bind callback functions to an event
         * with `on`, or remove these functions with `off`.
         * Triggering an event fires all callbacks in the order that `on` was
         * called.
         *
         * <pre>
         *     var object = {};
         *     _.extend(object, AV.Events);
         *     object.on('expand', function(){ alert('expanded'); });
         *     object.trigger('expand');</pre></p>
         *
         * <p>For more information, see the
         * <a href="http://documentcloud.github.com/backbone/#Events">Backbone
         * documentation</a>.</p>
         */
        AV.Events = {
          /**
           * Bind one or more space separated events, `events`, to a `callback`
           * function. Passing `"all"` will bind the callback to all events fired.
           */
          on: function on(events, callback, context) {

            var calls, event, node, tail, list;
            if (!callback) {
              return this;
            }
            events = events.split(eventSplitter);
            calls = this._callbacks || (this._callbacks = {});

            // Create an immutable callback list, allowing traversal during
            // modification.  The tail is an empty object that will always be used
            // as the next node.
            event = events.shift();
            while (event) {
              list = calls[event];
              node = list ? list.tail : {};
              node.next = tail = {};
              node.context = context;
              node.callback = callback;
              calls[event] = { tail: tail, next: list ? list.next : node };
              event = events.shift();
            }

            return this;
          },

          /**
           * Remove one or many callbacks. If `context` is null, removes all callbacks
           * with that function. If `callback` is null, removes all callbacks for the
           * event. If `events` is null, removes all bound callbacks for all events.
           */
          off: function off(events, callback, context) {
            var event, calls, node, tail, cb, ctx;

            // No events, or removing *all* events.
            if (!(calls = this._callbacks)) {
              return;
            }
            if (!(events || callback || context)) {
              delete this._callbacks;
              return this;
            }

            // Loop through the listed events and contexts, splicing them out of the
            // linked list of callbacks if appropriate.
            events = events ? events.split(eventSplitter) : _.keys(calls);
            event = events.shift();
            while (event) {
              node = calls[event];
              delete calls[event];
              if (!node || !(callback || context)) {
                continue;
              }
              // Create a new list, omitting the indicated callbacks.
              tail = node.tail;
              node = node.next;
              while (node !== tail) {
                cb = node.callback;
                ctx = node.context;
                if (callback && cb !== callback || context && ctx !== context) {
                  this.on(event, cb, ctx);
                }
                node = node.next;
              }
              event = events.shift();
            }

            return this;
          },

          /**
           * Trigger one or many events, firing all bound callbacks. Callbacks are
           * passed the same arguments as `trigger` is, apart from the event name
           * (unless you're listening on `"all"`, which will cause your callback to
           * receive the true name of the event as the first argument).
           */
          trigger: function trigger(events) {
            var event, node, calls, tail, args, all, rest;
            if (!(calls = this._callbacks)) {
              return this;
            }
            all = calls.all;
            events = events.split(eventSplitter);
            rest = slice.call(arguments, 1);

            // For each event, walk through the linked list of callbacks twice,
            // first to trigger the event, then to trigger any `"all"` callbacks.
            event = events.shift();
            while (event) {
              node = calls[event];
              if (node) {
                tail = node.tail;
                while ((node = node.next) !== tail) {
                  node.callback.apply(node.context || this, rest);
                }
              }
              node = all;
              if (node) {
                tail = node.tail;
                args = [event].concat(rest);
                while ((node = node.next) !== tail) {
                  node.callback.apply(node.context || this, args);
                }
              }
              event = events.shift();
            }

            return this;
          }
        };

        /**
         * @function
         */
        AV.Events.bind = AV.Events.on;

        /**
         * @function
         */
        AV.Events.unbind = AV.Events.off;
      };
    }, {}], 27: [function (require, module, exports) {
      (function (global) {
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

            var owner = void 0;
            if (data && data.owner) {
              owner = data.owner;
            } else if (!AV._config.disableCurrentUser) {
              try {
                owner = AV.User.current();
              } catch (error) {
                if ('SYNC_API_NOT_AVAILABLE' === error.code) {
                  console.warn('Get current user failed. It seems this runtime use an async storage system, please create AV.File in the callback of AV.User.currentAsync().');
                } else {
                  throw error;
                }
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
              if (data.size) {
                this.attributes.metaData.size = data.size;
              }
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
            className: '_File',

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

              for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }

              switch (args.length) {
                case 1:
                  // 传入一个 Object
                  for (var k in args[0]) {
                    set(k, args[0][k]);
                  }
                  break;
                case 2:
                  set(args[0], args[1]);
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
              var options = void 0;
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
                      var uploadPromise = void 0;
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
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, { "./browserify-wrapper/parse-base64": 22, "./error": 25, "./request": 38, "./uploader/cos": 42, "./uploader/qiniu": 43, "./uploader/s3": 44, "underscore": 18 }], 28: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      var _ = require('underscore');

      /*global navigator: false */
      module.exports = function (AV) {
        /**
         * Creates a new GeoPoint with any of the following forms:<br>
         *   <pre>
         *   new GeoPoint(otherGeoPoint)
         *   new GeoPoint(30, 30)
         *   new GeoPoint([30, 30])
         *   new GeoPoint({latitude: 30, longitude: 30})
         *   new GeoPoint()  // defaults to (0, 0)
         *   </pre>
         * @class
         *
         * <p>Represents a latitude / longitude point that may be associated
         * with a key in a AVObject or used as a reference point for geo queries.
         * This allows proximity-based queries on the key.</p>
         *
         * <p>Only one key in a class may contain a GeoPoint.</p>
         *
         * <p>Example:<pre>
         *   var point = new AV.GeoPoint(30.0, -20.0);
         *   var object = new AV.Object("PlaceObject");
         *   object.set("location", point);
         *   object.save();</pre></p>
         */
        AV.GeoPoint = function (arg1, arg2) {
          if (_.isArray(arg1)) {
            AV.GeoPoint._validate(arg1[0], arg1[1]);
            this.latitude = arg1[0];
            this.longitude = arg1[1];
          } else if (_.isObject(arg1)) {
            AV.GeoPoint._validate(arg1.latitude, arg1.longitude);
            this.latitude = arg1.latitude;
            this.longitude = arg1.longitude;
          } else if (_.isNumber(arg1) && _.isNumber(arg2)) {
            AV.GeoPoint._validate(arg1, arg2);
            this.latitude = arg1;
            this.longitude = arg2;
          } else {
            this.latitude = 0;
            this.longitude = 0;
          }

          // Add properties so that anyone using Webkit or Mozilla will get an error
          // if they try to set values that are out of bounds.
          var self = this;
          if (this.__defineGetter__ && this.__defineSetter__) {
            // Use _latitude and _longitude to actually store the values, and add
            // getters and setters for latitude and longitude.
            this._latitude = this.latitude;
            this._longitude = this.longitude;
            this.__defineGetter__("latitude", function () {
              return self._latitude;
            });
            this.__defineGetter__("longitude", function () {
              return self._longitude;
            });
            this.__defineSetter__("latitude", function (val) {
              AV.GeoPoint._validate(val, self.longitude);
              self._latitude = val;
            });
            this.__defineSetter__("longitude", function (val) {
              AV.GeoPoint._validate(self.latitude, val);
              self._longitude = val;
            });
          }
        };

        /**
         * @lends AV.GeoPoint.prototype
         * @property {float} latitude North-south portion of the coordinate, in range
         *   [-90, 90].  Throws an exception if set out of range in a modern browser.
         * @property {float} longitude East-west portion of the coordinate, in range
         *   [-180, 180].  Throws if set out of range in a modern browser.
         */

        /**
         * Throws an exception if the given lat-long is out of bounds.
         */
        AV.GeoPoint._validate = function (latitude, longitude) {
          if (latitude < -90.0) {
            throw "AV.GeoPoint latitude " + latitude + " < -90.0.";
          }
          if (latitude > 90.0) {
            throw "AV.GeoPoint latitude " + latitude + " > 90.0.";
          }
          if (longitude < -180.0) {
            throw "AV.GeoPoint longitude " + longitude + " < -180.0.";
          }
          if (longitude > 180.0) {
            throw "AV.GeoPoint longitude " + longitude + " > 180.0.";
          }
        };

        /**
         * Creates a GeoPoint with the user's current location, if available.
         * Calls options.success with a new GeoPoint instance or calls options.error.
         * @param {Object} options An object with success and error callbacks.
         */
        AV.GeoPoint.current = function (options) {
          var promise = new AV.Promise();
          navigator.geolocation.getCurrentPosition(function (location) {
            promise.resolve(new AV.GeoPoint({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            }));
          }, function (error) {
            promise.reject(error);
          });

          return promise._thenRunCallbacks(options);
        };

        AV.GeoPoint.prototype = {
          /**
           * Returns a JSON representation of the GeoPoint, suitable for AV.
           * @return {Object}
           */
          toJSON: function toJSON() {
            AV.GeoPoint._validate(this.latitude, this.longitude);
            return {
              "__type": "GeoPoint",
              latitude: this.latitude,
              longitude: this.longitude
            };
          },

          /**
           * Returns the distance from this GeoPoint to another in radians.
           * @param {AV.GeoPoint} point the other AV.GeoPoint.
           * @return {Number}
           */
          radiansTo: function radiansTo(point) {
            var d2r = Math.PI / 180.0;
            var lat1rad = this.latitude * d2r;
            var long1rad = this.longitude * d2r;
            var lat2rad = point.latitude * d2r;
            var long2rad = point.longitude * d2r;
            var deltaLat = lat1rad - lat2rad;
            var deltaLong = long1rad - long2rad;
            var sinDeltaLatDiv2 = Math.sin(deltaLat / 2);
            var sinDeltaLongDiv2 = Math.sin(deltaLong / 2);
            // Square of half the straight line chord distance between both points.
            var a = sinDeltaLatDiv2 * sinDeltaLatDiv2 + Math.cos(lat1rad) * Math.cos(lat2rad) * sinDeltaLongDiv2 * sinDeltaLongDiv2;
            a = Math.min(1.0, a);
            return 2 * Math.asin(Math.sqrt(a));
          },

          /**
           * Returns the distance from this GeoPoint to another in kilometers.
           * @param {AV.GeoPoint} point the other AV.GeoPoint.
           * @return {Number}
           */
          kilometersTo: function kilometersTo(point) {
            return this.radiansTo(point) * 6371.0;
          },

          /**
           * Returns the distance from this GeoPoint to another in miles.
           * @param {AV.GeoPoint} point the other AV.GeoPoint.
           * @return {Number}
           */
          milesTo: function milesTo(point) {
            return this.radiansTo(point) * 3958.8;
          }
        };
      };
    }, { "underscore": 18 }], 29: [function (require, module, exports) {
      /*!
       * LeanCloud JavaScript SDK
       * https://leancloud.cn
       *
       * Copyright 2016 LeanCloud.cn, Inc.
       * The LeanCloud JavaScript SDK is freely distributable under the MIT license.
       */

      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      var AV = module.exports = require('./av');

      AV._ = require('underscore');
      AV.version = require('./version');
      AV.Promise = require('./promise');
      AV.localStorage = require('./localstorage');
      AV.Cache = require('./cache');

      // All internal configuration items
      AV._config = AV._config || {};

      require('./utils').init(AV);

      require('./event')(AV);
      require('./geopoint')(AV);
      require('./acl')(AV);
      require('./op')(AV);
      require('./relation')(AV);
      require('./file')(AV);
      require('./object')(AV);
      require('./role')(AV);
      require('./user')(AV);
      require('./query')(AV);
      require('./cloudfunction')(AV);
      require('./push')(AV);
      require('./status')(AV);
      require('./search')(AV);
      require('./insight')(AV);

      // TODO: deprecated AV.Error()
      var AVError = require('./error');
      /**
       * @deprecated AV.Error() is deprecated, and will be removed in next release.
       */
      AV.Error = function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        console.warn('AV.Error() is deprecated, and will be removed in next release.');
        return new (Function.prototype.bind.apply(AVError, [null].concat(args)))();
      };
    }, { "./acl": 19, "./av": 20, "./cache": 23, "./cloudfunction": 24, "./error": 25, "./event": 26, "./file": 27, "./geopoint": 28, "./insight": 30, "./localstorage": 31, "./object": 32, "./op": 33, "./promise": 34, "./push": 35, "./query": 36, "./relation": 37, "./role": 39, "./search": 40, "./status": 41, "./user": 45, "./utils": 46, "./version": 47, "underscore": 18 }], 30: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      var _ = require('underscore');
      var AVError = require('./error');
      var AVRequest = require('./request').request;

      module.exports = function (AV) {
        /**
         * @namespace 包含了使用了 LeanCloud
         *  <a href='/docs/leaninsight_guide.html'>离线数据分析功能</a>的函数。
         * <p><strong><em>
         *   部分函数仅在云引擎运行环境下有效。
         * </em></strong></p>
         */
        AV.Insight = AV.Insight || {};

        _.extend(AV.Insight, /** @lends AV.Insight */{

          /**
           * 开始一个 Insight 任务。结果里将返回 Job id，你可以拿得到的 id 使用
           * AV.Insight.JobQuery 查询任务状态和结果。
           * @param {Object} jobConfig 任务配置的 JSON 对象，例如：<code><pre>
           *                   { "sql" : "select count(*) as c,gender from _User group by gender",
           *                     "saveAs": {
           *                         "className" : "UserGender",
           *                         "limit": 1
           *                      }
           *                   }
           *                  </pre></code>
           *               sql 指定任务执行的 SQL 语句， saveAs（可选） 指定将结果保存在哪张表里，limit 最大 1000。
           * @param {Object} options A Backbone-style options object
           * options.success, if set, should be a function to handle a successful
           * call to a cloud function.  options.error should be a function that
           * handles an error running the cloud function.  Both functions are
           * optional.  Both functions take a single argument.
           * @return {AV.Promise} A promise that will be resolved with the result
           * of the function.
           */
          startJob: function startJob(jobConfig, options) {
            if (!jobConfig || !jobConfig.sql) {
              throw new Error('Please provide the sql to run the job.');
            }
            var data = {
              jobConfig: jobConfig,
              appId: AV.applicationId
            };
            var request = AVRequest("bigquery", 'jobs', null, 'POST', AV._encode(data, null, true));

            return request.then(function (resp) {
              return AV._decode(null, resp).id;
            })._thenRunCallbacks(options);
          },

          /**
           * 监听 Insight 任务事件，目前仅支持 end 事件，表示任务完成。
           *  <p><strong><em>
           *     仅在云引擎运行环境下有效。
           *  </em></strong></p>
           * @param {String} event 监听的事件，目前仅支持 'end' ，表示任务完成
           * @param {Function} 监听回调函数，接收 (err, id) 两个参数，err 表示错误信息，
           *                   id 表示任务 id。接下来你可以拿这个 id 使用AV.Insight.JobQuery 查询任务状态和结果。
           *
           */
          on: function on(event, cb) {}
        });

        /**
         * 创建一个对象，用于查询 Insight 任务状态和结果。
         * @class
         * @param {String} id 任务 id
         * @since 0.5.5
         */
        AV.Insight.JobQuery = function (id, className) {
          if (!id) {
            throw new Error('Please provide the job id.');
          }
          this.id = id;
          this.className = className;
          this._skip = 0;
          this._limit = 100;
        };

        AV.Insight.JobQuery.prototype = {

          /**
           * Sets the number of results to skip before returning any results.
           * This is useful for pagination.
           * Default is to skip zero results.
           * @param {Number} n the number of results to skip.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          skip: function skip(n) {
            this._skip = n;
            return this;
          },

          /**
           * Sets the limit of the number of results to return. The default limit is
           * 100, with a maximum of 1000 results being returned at a time.
           * @param {Number} n the number of results to limit to.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          limit: function limit(n) {
            this._limit = n;
            return this;
          },

          /**
           * 查询任务状态和结果，任务结果为一个 JSON 对象，包括 status 表示任务状态， totalCount 表示总数，
           * results 数组表示任务结果数组，previewCount 表示可以返回的结果总数，任务的开始和截止时间
           * startTime、endTime 等信息。
           *
           * @param {Object} options A Backbone-style options object
           * options.success, if set, should be a function to handle a successful
           * call to a cloud function.  options.error should be a function that
           * handles an error running the cloud function.  Both functions are
           * optional.  Both functions take a single argument.
           * @return {AV.Promise} A promise that will be resolved with the result
           * of the function.
           *
           */
          find: function find(options) {
            var params = {
              skip: this._skip,
              limit: this._limit
            };

            var request = AVRequest("bigquery", 'jobs', this.id, "GET", params);
            var self = this;
            return request.then(function (response) {
              if (response.error) {
                return AV.Promise.error(new AVError(response.code, response.error));
              }
              return AV.Promise.as(response);
            })._thenRunCallbacks(options);
          }

        };
      };
    }, { "./error": 25, "./request": 38, "underscore": 18 }], 31: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      'use strict';

      var _ = require('underscore');
      var Promise = require('./promise');
      var localStorage = require('./browserify-wrapper/localStorage');

      var syncApiNames = ['getItem', 'setItem', 'removeItem', 'clear'];

      if (!localStorage.async) {
        // wrap sync apis with async ones.
        _(syncApiNames).each(function (apiName) {
          if (typeof localStorage[apiName] === 'function') {
            localStorage[apiName + 'Async'] = function () {
              return Promise.as(localStorage[apiName].apply(localStorage, arguments));
            };
          }
        });
      } else {
        _(syncApiNames).each(function (apiName) {
          if (typeof localStorage[apiName] !== 'function') {
            localStorage[apiName] = function () {
              var error = new Error('Synchronous API [' + apiName + '] is not available in this runtime.');
              error.code = 'SYNC_API_NOT_AVAILABLE';
              throw error;
            };
          }
        });
      }

      module.exports = localStorage;
    }, { "./browserify-wrapper/localStorage": 21, "./promise": 34, "underscore": 18 }], 32: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      var _ = require('underscore');
      var AVError = require('./error');
      var AVRequest = require('./request').request;
      var utils = require('./utils');

      // AV.Object is analogous to the Java AVObject.
      // It also implements the same interface as a Backbone model.

      module.exports = function (AV) {
        /**
         * Creates a new model with defined attributes. A client id (cid) is
         * automatically generated and assigned for you.
         *
         * <p>You won't normally call this method directly.  It is recommended that
         * you use a subclass of <code>AV.Object</code> instead, created by calling
         * <code>extend</code>.</p>
         *
         * <p>However, if you don't want to use a subclass, or aren't sure which
         * subclass is appropriate, you can use this form:<pre>
         *     var object = new AV.Object("ClassName");
         * </pre>
         * That is basically equivalent to:<pre>
         *     var MyClass = AV.Object.extend("ClassName");
         *     var object = new MyClass();
         * </pre></p>
         *
         * @param {Object} attributes The initial set of data to store in the object.
         * @param {Object} options A set of Backbone-like options for creating the
         *     object.  The only option currently supported is "collection".
         * @see AV.Object.extend
         *
         * @class
         *
         * <p>The fundamental unit of AV data, which implements the Backbone Model
         * interface.</p>
         */
        AV.Object = function (attributes, options) {
          // Allow new AV.Object("ClassName") as a shortcut to _create.
          if (_.isString(attributes)) {
            return AV.Object._create.apply(this, arguments);
          }

          attributes = attributes || {};
          if (options && options.parse) {
            attributes = this.parse(attributes);
          }
          var defaults = AV._getValue(this, 'defaults');
          if (defaults) {
            attributes = _.extend({}, defaults, attributes);
          }
          if (options && options.collection) {
            this.collection = options.collection;
          }

          this._serverData = {}; // The last known data for this object from cloud.
          this._opSetQueue = [{}]; // List of sets of changes to the data.
          this.attributes = {}; // The best estimate of this's current data.

          this._hashedJSON = {}; // Hash of values of containers at last save.
          this._escapedAttributes = {};
          this.cid = _.uniqueId('c');
          this.changed = {};
          this._silent = {};
          this._pending = {};
          if (!this.set(attributes, { silent: true })) {
            throw new Error("Can't create an invalid AV.Object");
          }
          this.changed = {};
          this._silent = {};
          this._pending = {};
          this._hasData = true;
          this._previousAttributes = _.clone(this.attributes);
          this.initialize.apply(this, arguments);
        };

        /**
         * @lends AV.Object.prototype
         * @property {String} id The objectId of the AV Object.
         */

        /**
         * Saves the given list of AV.Object.
         * If any error is encountered, stops and calls the error handler.
         * There are two ways you can call this function.
         *
         * The Backbone way:<pre>
         *   AV.Object.saveAll([object1, object2, ...], {
         *     success: function(list) {
         *       // All the objects were saved.
         *     },
         *     error: function(error) {
         *       // An error occurred while saving one of the objects.
         *     },
         *   });
         * </pre>
         * A simplified syntax:<pre>
         *   AV.Object.saveAll([object1, object2, ...], function(list, error) {
         *     if (list) {
         *       // All the objects were saved.
         *     } else {
         *       // An error occurred.
         *     }
         *   });
         * </pre>
         *
         * @param {Array} list A list of <code>AV.Object</code>.
         * @param {Object} options A Backbone-style callback object.
         */
        AV.Object.saveAll = function (list, options) {
          return AV.Object._deepSaveAsync(list, null, options)._thenRunCallbacks(options);
        };

        /**
         * Fetch the given list of AV.Object.
         * 
         * @param {AV.Object[]} objects A list of <code>AV.Object</code>
         * @param {Object} options
         * @param {String} options.sessionToken specify user's session, used in LeanEngine.
         * @return {Promise.<AV.Object[]>} The given list of <code>AV.Object</code>, updated
         */

        AV.Object.fetchAll = function (objects, options) {
          return AV.Promise.as().then(function () {
            return AVRequest('batch', null, null, 'POST', {
              requests: _.map(objects, function (object) {
                if (!object.className) throw new Error('object must have className to fetch');
                if (!object.id) throw new Error('object must have id to fetch');
                if (object.dirty()) throw new Error('object is modified but not saved');
                return {
                  method: 'GET',
                  path: "/1.1/classes/" + object.className + "/" + object.id
                };
              })
            }, options && options.sessionToken);
          }).then(function (response) {
            _.forEach(objects, function (object, i) {
              if (response[i].success) {
                object._finishFetch(object.parse(response[i].success));
              } else {
                var error = new Error(response[i].error.error);
                error.code = response[i].error.code;
                throw error;
              }
            });
            return objects;
          });
        };

        // Attach all inheritable methods to the AV.Object prototype.
        _.extend(AV.Object.prototype, AV.Events,
        /** @lends AV.Object.prototype */{
          _fetchWhenSave: false,

          /**
           * Initialize is an empty function by default. Override it with your own
           * initialization logic.
           */
          initialize: function initialize() {},

          /**
            * Set whether to enable fetchWhenSave option when updating object.
            * When set true, SDK would fetch the latest object after saving.
            * Default is false.
            *
            * @deprecated use AV.Object#save with options.fetchWhenSave instead
            * @param {boolean} enable  true to enable fetchWhenSave option.
            */
          fetchWhenSave: function fetchWhenSave(enable) {
            console.warn('AV.Object#fetchWhenSave is deprecated, use AV.Object#save with options.fetchWhenSave instead.');
            if (!_.isBoolean(enable)) {
              throw "Expect boolean value for fetchWhenSave";
            }
            this._fetchWhenSave = enable;
          },

          /**
           * Returns the object's objectId.
           * @return {String} the objectId.
           */
          getObjectId: function getObjectId() {
            return this.id;
          },

          /**
           * Returns the object's createdAt attribute.
           * @return {Date}
           */
          getCreatedAt: function getCreatedAt() {
            return this.createdAt || this.get('createdAt');
          },

          /**
           * Returns the object's updatedAt attribute.
           * @return {Date}
           */
          getUpdatedAt: function getUpdatedAt() {
            return this.updatedAt || this.get('updatedAt');
          },

          /**
           * Returns a JSON version of the object suitable for saving to AV.
           * @return {Object}
           */
          toJSON: function toJSON() {
            var json = this._toFullJSON();
            AV._arrayEach(["__type", "className"], function (key) {
              delete json[key];
            });
            return json;
          },

          _toFullJSON: function _toFullJSON(seenObjects) {
            var json = _.clone(this.attributes);
            AV._objectEach(json, function (val, key) {
              json[key] = AV._encode(val, seenObjects);
            });
            AV._objectEach(this._operations, function (val, key) {
              json[key] = val;
            });

            if (_.has(this, "id")) {
              json.objectId = this.id;
            }
            if (_.has(this, "createdAt")) {
              if (_.isDate(this.createdAt)) {
                json.createdAt = this.createdAt.toJSON();
              } else {
                json.createdAt = this.createdAt;
              }
            }

            if (_.has(this, "updatedAt")) {
              if (_.isDate(this.updatedAt)) {
                json.updatedAt = this.updatedAt.toJSON();
              } else {
                json.updatedAt = this.updatedAt;
              }
            }
            json.__type = "Object";
            json.className = this.className;
            return json;
          },

          /**
           * Updates _hashedJSON to reflect the current state of this object.
           * Adds any changed hash values to the set of pending changes.
           */
          _refreshCache: function _refreshCache() {
            var self = this;
            if (self._refreshingCache) {
              return;
            }
            self._refreshingCache = true;
            AV._objectEach(this.attributes, function (value, key) {
              if (value instanceof AV.Object) {
                value._refreshCache();
              } else if (_.isObject(value)) {
                if (self._resetCacheForKey(key)) {
                  self.set(key, new AV.Op.Set(value), { silent: true });
                }
              }
            });
            delete self._refreshingCache;
          },

          /**
           * Returns true if this object has been modified since its last
           * save/refresh.  If an attribute is specified, it returns true only if that
           * particular attribute has been modified since the last save/refresh.
           * @param {String} attr An attribute name (optional).
           * @return {Boolean}
           */
          dirty: function dirty(attr) {
            this._refreshCache();

            var currentChanges = _.last(this._opSetQueue);

            if (attr) {
              return currentChanges[attr] ? true : false;
            }
            if (!this.id) {
              return true;
            }
            if (_.keys(currentChanges).length > 0) {
              return true;
            }
            return false;
          },

          /**
           * Gets a Pointer referencing this Object.
           */
          _toPointer: function _toPointer() {
            // if (!this.id) {
            //   throw new Error("Can't serialize an unsaved AV.Object");
            // }
            return { __type: "Pointer",
              className: this.className,
              objectId: this.id };
          },

          /**
           * Gets the value of an attribute.
           * @param {String} attr The string name of an attribute.
           */
          get: function get(attr) {
            switch (attr) {
              case 'objectId':
              case 'id':
                return this.id;
              case 'createdAt':
              case 'updatedAt':
                return this[attr];
              default:
                return this.attributes[attr];
            }
          },

          /**
           * Gets a relation on the given class for the attribute.
           * @param String attr The attribute to get the relation for.
           */
          relation: function relation(attr) {
            var value = this.get(attr);
            if (value) {
              if (!(value instanceof AV.Relation)) {
                throw "Called relation() on non-relation field " + attr;
              }
              value._ensureParentAndKey(this, attr);
              return value;
            } else {
              return new AV.Relation(this, attr);
            }
          },

          /**
           * Gets the HTML-escaped value of an attribute.
           */
          escape: function escape(attr) {
            var html = this._escapedAttributes[attr];
            if (html) {
              return html;
            }
            var val = this.attributes[attr];
            var escaped;
            if (utils.isNullOrUndefined(val)) {
              escaped = '';
            } else {
              escaped = _.escape(val.toString());
            }
            this._escapedAttributes[attr] = escaped;
            return escaped;
          },

          /**
           * Returns <code>true</code> if the attribute contains a value that is not
           * null or undefined.
           * @param {String} attr The string name of the attribute.
           * @return {Boolean}
           */
          has: function has(attr) {
            return !utils.isNullOrUndefined(this.attributes[attr]);
          },

          /**
           * Pulls "special" fields like objectId, createdAt, etc. out of attrs
           * and puts them on "this" directly.  Removes them from attrs.
           * @param attrs - A dictionary with the data for this AV.Object.
           */
          _mergeMagicFields: function _mergeMagicFields(attrs) {
            // Check for changes of magic fields.
            var model = this;
            var specialFields = ["id", "objectId", "createdAt", "updatedAt"];
            AV._arrayEach(specialFields, function (attr) {
              if (attrs[attr]) {
                if (attr === "objectId") {
                  model.id = attrs[attr];
                } else if ((attr === "createdAt" || attr === "updatedAt") && !_.isDate(attrs[attr])) {
                  model[attr] = AV._parseDate(attrs[attr]);
                } else {
                  model[attr] = attrs[attr];
                }
                delete attrs[attr];
              }
            });
          },

          /**
           * Returns the json to be sent to the server.
           */
          _startSave: function _startSave() {
            this._opSetQueue.push({});
          },

          /**
           * Called when a save fails because of an error. Any changes that were part
           * of the save need to be merged with changes made after the save. This
           * might throw an exception is you do conflicting operations. For example,
           * if you do:
           *   object.set("foo", "bar");
           *   object.set("invalid field name", "baz");
           *   object.save();
           *   object.increment("foo");
           * then this will throw when the save fails and the client tries to merge
           * "bar" with the +1.
           */
          _cancelSave: function _cancelSave() {
            var self = this;
            var failedChanges = _.first(this._opSetQueue);
            this._opSetQueue = _.rest(this._opSetQueue);
            var nextChanges = _.first(this._opSetQueue);
            AV._objectEach(failedChanges, function (op, key) {
              var op1 = failedChanges[key];
              var op2 = nextChanges[key];
              if (op1 && op2) {
                nextChanges[key] = op2._mergeWithPrevious(op1);
              } else if (op1) {
                nextChanges[key] = op1;
              }
            });
            this._saving = this._saving - 1;
          },

          /**
           * Called when a save completes successfully. This merges the changes that
           * were saved into the known server data, and overrides it with any data
           * sent directly from the server.
           */
          _finishSave: function _finishSave(serverData) {
            // Grab a copy of any object referenced by this object. These instances
            // may have already been fetched, and we don't want to lose their data.
            // Note that doing it like this means we will unify separate copies of the
            // same object, but that's a risk we have to take.
            var fetchedObjects = {};
            AV._traverse(this.attributes, function (object) {
              if (object instanceof AV.Object && object.id && object._hasData) {
                fetchedObjects[object.id] = object;
              }
            });

            var savedChanges = _.first(this._opSetQueue);
            this._opSetQueue = _.rest(this._opSetQueue);
            this._applyOpSet(savedChanges, this._serverData);
            this._mergeMagicFields(serverData);
            var self = this;
            AV._objectEach(serverData, function (value, key) {
              self._serverData[key] = AV._decode(key, value);

              // Look for any objects that might have become unfetched and fix them
              // by replacing their values with the previously observed values.
              var fetched = AV._traverse(self._serverData[key], function (object) {
                if (object instanceof AV.Object && fetchedObjects[object.id]) {
                  return fetchedObjects[object.id];
                }
              });
              if (fetched) {
                self._serverData[key] = fetched;
              }
            });
            this._rebuildAllEstimatedData();
            this._saving = this._saving - 1;
          },

          /**
           * Called when a fetch or login is complete to set the known server data to
           * the given object.
           */
          _finishFetch: function _finishFetch(serverData, hasData) {
            // Clear out any changes the user might have made previously.
            this._opSetQueue = [{}];

            // Bring in all the new server data.
            this._mergeMagicFields(serverData);
            var self = this;
            AV._objectEach(serverData, function (value, key) {
              self._serverData[key] = AV._decode(key, value);
            });

            // Refresh the attributes.
            this._rebuildAllEstimatedData();

            // Clear out the cache of mutable containers.
            this._refreshCache();
            this._opSetQueue = [{}];

            this._hasData = hasData;
          },

          /**
           * Applies the set of AV.Op in opSet to the object target.
           */
          _applyOpSet: function _applyOpSet(opSet, target) {
            var self = this;
            AV._objectEach(opSet, function (change, key) {
              target[key] = change._estimate(target[key], self, key);
              if (target[key] === AV.Op._UNSET) {
                delete target[key];
              }
            });
          },

          /**
           * Replaces the cached value for key with the current value.
           * Returns true if the new value is different than the old value.
           */
          _resetCacheForKey: function _resetCacheForKey(key) {
            var value = this.attributes[key];
            if (_.isObject(value) && !(value instanceof AV.Object) && !(value instanceof AV.File)) {

              value = value.toJSON ? value.toJSON() : value;
              var json = JSON.stringify(value);
              if (this._hashedJSON[key] !== json) {
                var wasSet = !!this._hashedJSON[key];
                this._hashedJSON[key] = json;
                return wasSet;
              }
            }
            return false;
          },

          /**
           * Populates attributes[key] by starting with the last known data from the
           * server, and applying all of the local changes that have been made to that
           * key since then.
           */
          _rebuildEstimatedDataForKey: function _rebuildEstimatedDataForKey(key) {
            var self = this;
            delete this.attributes[key];
            if (this._serverData[key]) {
              this.attributes[key] = this._serverData[key];
            }
            AV._arrayEach(this._opSetQueue, function (opSet) {
              var op = opSet[key];
              if (op) {
                self.attributes[key] = op._estimate(self.attributes[key], self, key);
                if (self.attributes[key] === AV.Op._UNSET) {
                  delete self.attributes[key];
                } else {
                  self._resetCacheForKey(key);
                }
              }
            });
          },

          /**
           * Populates attributes by starting with the last known data from the
           * server, and applying all of the local changes that have been made since
           * then.
           */
          _rebuildAllEstimatedData: function _rebuildAllEstimatedData() {
            var self = this;

            var previousAttributes = _.clone(this.attributes);

            this.attributes = _.clone(this._serverData);
            AV._arrayEach(this._opSetQueue, function (opSet) {
              self._applyOpSet(opSet, self.attributes);
              AV._objectEach(opSet, function (op, key) {
                self._resetCacheForKey(key);
              });
            });

            // Trigger change events for anything that changed because of the fetch.
            AV._objectEach(previousAttributes, function (oldValue, key) {
              if (self.attributes[key] !== oldValue) {
                self.trigger('change:' + key, self, self.attributes[key], {});
              }
            });
            AV._objectEach(this.attributes, function (newValue, key) {
              if (!_.has(previousAttributes, key)) {
                self.trigger('change:' + key, self, newValue, {});
              }
            });
          },

          /**
           * Sets a hash of model attributes on the object, firing
           * <code>"change"</code> unless you choose to silence it.
           *
           * <p>You can call it with an object containing keys and values, or with one
           * key and value.  For example:<pre>
           *   gameTurn.set({
           *     player: player1,
           *     diceRoll: 2
           *   }, {
           *     error: function(gameTurnAgain, error) {
           *       // The set failed validation.
           *     }
           *   });
           *
           *   game.set("currentPlayer", player2, {
           *     error: function(gameTurnAgain, error) {
           *       // The set failed validation.
           *     }
           *   });
           *
           *   game.set("finished", true);</pre></p>
           *
           * @param {String} key The key to set.
           * @param {} value The value to give it.
           * @param {Object} options A set of Backbone-like options for the set.
           *     The only supported options are <code>silent</code>,
           *     <code>error</code>, and <code>promise</code>.
           * @return {AV.Object} self if succeeded, false if the value is not valid.
           * @see AV.Object#validate
           * @see AVError
           */
          set: function set(key, value, options) {
            var attrs, attr;
            if (_.isObject(key) || utils.isNullOrUndefined(key)) {
              attrs = key;
              AV._objectEach(attrs, function (v, k) {
                attrs[k] = AV._decode(k, v);
              });
              options = value;
            } else {
              attrs = {};
              attrs[key] = AV._decode(key, value);
            }

            // Extract attributes and options.
            options = options || {};
            if (!attrs) {
              return this;
            }
            if (attrs instanceof AV.Object) {
              attrs = attrs.attributes;
            }

            // If the unset option is used, every attribute should be a Unset.
            if (options.unset) {
              AV._objectEach(attrs, function (unused_value, key) {
                attrs[key] = new AV.Op.Unset();
              });
            }

            // Apply all the attributes to get the estimated values.
            var dataToValidate = _.clone(attrs);
            var self = this;
            AV._objectEach(dataToValidate, function (value, key) {
              if (value instanceof AV.Op) {
                dataToValidate[key] = value._estimate(self.attributes[key], self, key);
                if (dataToValidate[key] === AV.Op._UNSET) {
                  delete dataToValidate[key];
                }
              }
            });

            // Run validation.
            if (!this._validate(attrs, options)) {
              return false;
            }

            this._mergeMagicFields(attrs);

            options.changes = {};
            var escaped = this._escapedAttributes;
            var prev = this._previousAttributes || {};

            // Update attributes.
            AV._arrayEach(_.keys(attrs), function (attr) {
              var val = attrs[attr];

              // If this is a relation object we need to set the parent correctly,
              // since the location where it was parsed does not have access to
              // this object.
              if (val instanceof AV.Relation) {
                val.parent = self;
              }

              if (!(val instanceof AV.Op)) {
                val = new AV.Op.Set(val);
              }

              // See if this change will actually have any effect.
              var isRealChange = true;
              if (val instanceof AV.Op.Set && _.isEqual(self.attributes[attr], val.value)) {
                isRealChange = false;
              }

              if (isRealChange) {
                delete escaped[attr];
                if (options.silent) {
                  self._silent[attr] = true;
                } else {
                  options.changes[attr] = true;
                }
              }

              var currentChanges = _.last(self._opSetQueue);
              currentChanges[attr] = val._mergeWithPrevious(currentChanges[attr]);
              self._rebuildEstimatedDataForKey(attr);

              if (isRealChange) {
                self.changed[attr] = self.attributes[attr];
                if (!options.silent) {
                  self._pending[attr] = true;
                }
              } else {
                delete self.changed[attr];
                delete self._pending[attr];
              }
            });

            if (!options.silent) {
              this.change(options);
            }
            return this;
          },

          /**
           * Remove an attribute from the model, firing <code>"change"</code> unless
           * you choose to silence it. This is a noop if the attribute doesn't
           * exist.
           */
          unset: function unset(attr, options) {
            options = options || {};
            options.unset = true;
            return this.set(attr, null, options);
          },

          /**
           * Atomically increments the value of the given attribute the next time the
           * object is saved. If no amount is specified, 1 is used by default.
           *
           * @param attr {String} The key.
           * @param amount {Number} The amount to increment by.
           */
          increment: function increment(attr, amount) {
            if (_.isUndefined(amount) || _.isNull(amount)) {
              amount = 1;
            }
            return this.set(attr, new AV.Op.Increment(amount));
          },

          /**
           * Atomically add an object to the end of the array associated with a given
           * key.
           * @param attr {String} The key.
           * @param item {} The item to add.
           */
          add: function add(attr, item) {
            return this.set(attr, new AV.Op.Add(utils.ensureArray(item)));
          },

          /**
           * Atomically add an object to the array associated with a given key, only
           * if it is not already present in the array. The position of the insert is
           * not guaranteed.
           *
           * @param attr {String} The key.
           * @param item {} The object to add.
           */
          addUnique: function addUnique(attr, item) {
            return this.set(attr, new AV.Op.AddUnique(utils.ensureArray(item)));
          },

          /**
           * Atomically remove all instances of an object from the array associated
           * with a given key.
           *
           * @param attr {String} The key.
           * @param item {} The object to remove.
           */
          remove: function remove(attr, item) {
            return this.set(attr, new AV.Op.Remove(utils.ensureArray(item)));
          },

          /**
           * Returns an instance of a subclass of AV.Op describing what kind of
           * modification has been performed on this field since the last time it was
           * saved. For example, after calling object.increment("x"), calling
           * object.op("x") would return an instance of AV.Op.Increment.
           *
           * @param attr {String} The key.
           * @returns {AV.Op} The operation, or undefined if none.
           */
          op: function op(attr) {
            return _.last(this._opSetQueue)[attr];
          },

          /**
           * Clear all attributes on the model, firing <code>"change"</code> unless
           * you choose to silence it.
           */
          clear: function clear(options) {
            options = options || {};
            options.unset = true;
            var keysToClear = _.extend(this.attributes, this._operations);
            return this.set(keysToClear, options);
          },

          /**
           * Returns a JSON-encoded set of operations to be sent with the next save
           * request.
           */
          _getSaveJSON: function _getSaveJSON() {
            var json = _.clone(_.first(this._opSetQueue));
            AV._objectEach(json, function (op, key) {
              json[key] = op.toJSON();
            });
            return json;
          },

          /**
           * Returns true if this object can be serialized for saving.
           */
          _canBeSerialized: function _canBeSerialized() {
            return AV.Object._canBeSerializedAsValue(this.attributes);
          },

          /**
           * Fetch the model from the server. If the server's representation of the
           * model differs from its current attributes, they will be overriden,
           * triggering a <code>"change"</code> event.
           * @param {Object} fetchOptions Optional options to set 'keys' and
           *      'include' option.
           * @param {Object} options Optional Backbone-like options object to be
           *     passed in to set.
           * @return {AV.Promise} A promise that is fulfilled when the fetch
           *     completes.
           */
          fetch: function fetch() {
            var options = {};
            var fetchOptions = {};
            if (arguments.length === 1) {
              options = arguments[0];
            } else if (arguments.length === 2) {
              fetchOptions = arguments[0];
              options = arguments[1] || {};
            }

            if (fetchOptions && fetchOptions.include && _.isArray(fetchOptions.include)) {
              fetchOptions.include = fetchOptions.include.join(',');
            }

            var self = this;
            var request = AVRequest('classes', this.className, this.id, 'GET', fetchOptions, options.sessionToken);
            return request.then(function (response) {
              self._finishFetch(self.parse(response), true);
              return self;
            })._thenRunCallbacks(options, this);
          },

          /**
           * Set a hash of model attributes, and save the model to the server.
           * updatedAt will be updated when the request returns.
           * You can either call it as:<pre>
           *   object.save();</pre>
           * or<pre>
           *   object.save(null, options);</pre>
           * or<pre>
           *   object.save(attrs, options);</pre>
           * or<pre>
           *   object.save(key, value, options);</pre>
           *
           * For example, <pre>
           *   gameTurn.save({
           *     player: "Jake Cutter",
           *     diceRoll: 2
           *   }, {
           *     success: function(gameTurnAgain) {
           *       // The save was successful.
           *     },
           *     error: function(gameTurnAgain, error) {
           *       // The save failed.  Error is an instance of AVError.
           *     }
           *   });</pre>
           * or with promises:<pre>
           *   gameTurn.save({
           *     player: "Jake Cutter",
           *     diceRoll: 2
           *   }).then(function(gameTurnAgain) {
           *     // The save was successful.
           *   }, function(error) {
           *     // The save failed.  Error is an instance of AVError.
           *   });</pre>
           * @param {Object} options Optional Backbone-like options object to be passed in to set.
           * @param {Boolean} options.fetchWhenSave fetch and update object after save succeeded
           * @param {AV.Query} options.query Save object only when it matches the query
           * @return {AV.Promise} A promise that is fulfilled when the save
           *     completes.
           * @see AVError
           */
          save: function save(arg1, arg2, arg3) {
            var i, attrs, current, options, saved;
            if (_.isObject(arg1) || utils.isNullOrUndefined(arg1)) {
              attrs = arg1;
              options = arg2;
            } else {
              attrs = {};
              attrs[arg1] = arg2;
              options = arg3;
            }

            // Make save({ success: function() {} }) work.
            if (!options && attrs) {
              var extra_keys = _.reject(attrs, function (value, key) {
                return _.include(["success", "error", "wait"], key);
              });
              if (extra_keys.length === 0) {
                var all_functions = true;
                if (_.has(attrs, "success") && !_.isFunction(attrs.success)) {
                  all_functions = false;
                }
                if (_.has(attrs, "error") && !_.isFunction(attrs.error)) {
                  all_functions = false;
                }
                if (all_functions) {
                  // This attrs object looks like it's really an options object,
                  // and there's no other options object, so let's just use it.
                  return this.save(null, attrs);
                }
              }
            }

            options = _.clone(options) || {};
            if (options.wait) {
              current = _.clone(this.attributes);
            }

            var setOptions = _.clone(options) || {};
            if (setOptions.wait) {
              setOptions.silent = true;
            }
            var setError;
            setOptions.error = function (model, error) {
              setError = error;
            };
            if (attrs && !this.set(attrs, setOptions)) {
              return AV.Promise.error(setError)._thenRunCallbacks(options, this);
            }

            var model = this;

            // If there is any unsaved child, save it first.
            model._refreshCache();

            var unsavedChildren = [];
            var unsavedFiles = [];
            AV.Object._findUnsavedChildren(model.attributes, unsavedChildren, unsavedFiles);
            if (unsavedChildren.length + unsavedFiles.length > 0) {
              return AV.Object._deepSaveAsync(this.attributes, model, options).then(function () {
                return model.save(null, options);
              }, function (error) {
                return AV.Promise.error(error)._thenRunCallbacks(options, model);
              });
            }

            this._startSave();
            this._saving = (this._saving || 0) + 1;

            this._allPreviousSaves = this._allPreviousSaves || AV.Promise.as();
            this._allPreviousSaves = this._allPreviousSaves._continueWith(function () {
              var method = model.id ? 'PUT' : 'POST';

              var json = model._getSaveJSON();

              if (model._fetchWhenSave) {
                //Sepcial-case fetchWhenSave when updating object.
                json._fetchWhenSave = true;
              }

              if (options.fetchWhenSave) {
                json._fetchWhenSave = true;
              }
              if (options.query) {
                var queryJSON;
                if (typeof options.query.toJSON === 'function') {
                  queryJSON = options.query.toJSON();
                  if (queryJSON) {
                    json._where = queryJSON.where;
                  }
                }
                if (!json._where) {
                  var error = new Error('options.query is not an AV.Query');
                  return AV.Promise.error(error)._thenRunCallbacks(options, model);
                }
              }

              var route = "classes";
              var className = model.className;
              if (model.className === "_User" && !model.id) {
                // Special-case user sign-up.
                route = "users";
                className = null;
              }
              //hook makeRequest in options.
              var makeRequest = options._makeRequest || AVRequest;
              var request = makeRequest(route, className, model.id, method, json, options.sessionToken);

              request = request.then(function (resp) {
                var serverAttrs = model.parse(resp);
                if (options.wait) {
                  serverAttrs = _.extend(attrs || {}, serverAttrs);
                }
                model._finishSave(serverAttrs);
                if (options.wait) {
                  model.set(current, setOptions);
                }
                return model;
              }, function (error) {
                model._cancelSave();
                return AV.Promise.error(error);
              })._thenRunCallbacks(options, model);

              return request;
            });
            return this._allPreviousSaves;
          },

          /**
           * Destroy this model on the server if it was already persisted.
           * Optimistically removes the model from its collection, if it has one.
           * If `wait: true` is passed, waits for the server to respond
           * before removal.
           *
           * @return {AV.Promise} A promise that is fulfilled when the destroy
           *     completes.
           */
          destroy: function destroy(options) {
            options = options || {};
            var model = this;

            var triggerDestroy = function triggerDestroy() {
              model.trigger('destroy', model, model.collection, options);
            };

            if (!this.id) {
              return triggerDestroy();
            }

            if (!options.wait) {
              triggerDestroy();
            }

            var request = AVRequest('classes', this.className, this.id, 'DELETE', null, options.sessionToken);
            return request.then(function () {
              if (options.wait) {
                triggerDestroy();
              }
              return model;
            })._thenRunCallbacks(options, this);
          },

          /**
           * Converts a response into the hash of attributes to be set on the model.
           * @ignore
           */
          parse: function parse(resp) {
            var output = _.clone(resp);
            _(["createdAt", "updatedAt"]).each(function (key) {
              if (output[key]) {
                output[key] = AV._parseDate(output[key]);
              }
            });
            if (!output.updatedAt) {
              output.updatedAt = output.createdAt;
            }
            return output;
          },

          /**
           * Creates a new model with identical attributes to this one.
           * @return {AV.Object}
           */
          clone: function clone() {
            return new this.constructor(this.attributes);
          },

          /**
           * Returns true if this object has never been saved to AV.
           * @return {Boolean}
           */
          isNew: function isNew() {
            return !this.id;
          },

          /**
           * Call this method to manually fire a `"change"` event for this model and
           * a `"change:attribute"` event for each changed attribute.
           * Calling this will cause all objects observing the model to update.
           */
          change: function change(options) {
            options = options || {};
            var changing = this._changing;
            this._changing = true;

            // Silent changes become pending changes.
            var self = this;
            AV._objectEach(this._silent, function (attr) {
              self._pending[attr] = true;
            });

            // Silent changes are triggered.
            var changes = _.extend({}, options.changes, this._silent);
            this._silent = {};
            AV._objectEach(changes, function (unused_value, attr) {
              self.trigger('change:' + attr, self, self.get(attr), options);
            });
            if (changing) {
              return this;
            }

            // This is to get around lint not letting us make a function in a loop.
            var deleteChanged = function deleteChanged(value, attr) {
              if (!self._pending[attr] && !self._silent[attr]) {
                delete self.changed[attr];
              }
            };

            // Continue firing `"change"` events while there are pending changes.
            while (!_.isEmpty(this._pending)) {
              this._pending = {};
              this.trigger('change', this, options);
              // Pending and silent changes still remain.
              AV._objectEach(this.changed, deleteChanged);
              self._previousAttributes = _.clone(this.attributes);
            }

            this._changing = false;
            return this;
          },

          /**
           * (DEPRECATED) Returns true if this object was created by the AV server when the
           * object might have already been there (e.g. in the case of a Facebook
           * login)
           */
          existed: function existed() {
            console.warn('AV.Object.prototype.existed() is deprecated.');
            return false;
          },

          /**
           * Determine if the model has changed since the last <code>"change"</code>
           * event.  If you specify an attribute name, determine if that attribute
           * has changed.
           * @param {String} attr Optional attribute name
           * @return {Boolean}
           */
          hasChanged: function hasChanged(attr) {
            if (!arguments.length) {
              return !_.isEmpty(this.changed);
            }
            return this.changed && _.has(this.changed, attr);
          },

          /**
           * Returns an object containing all the attributes that have changed, or
           * false if there are no changed attributes. Useful for determining what
           * parts of a view need to be updated and/or what attributes need to be
           * persisted to the server. Unset attributes will be set to undefined.
           * You can also pass an attributes object to diff against the model,
           * determining if there *would be* a change.
           */
          changedAttributes: function changedAttributes(diff) {
            if (!diff) {
              return this.hasChanged() ? _.clone(this.changed) : false;
            }
            var changed = {};
            var old = this._previousAttributes;
            AV._objectEach(diff, function (diffVal, attr) {
              if (!_.isEqual(old[attr], diffVal)) {
                changed[attr] = diffVal;
              }
            });
            return changed;
          },

          /**
           * Gets the previous value of an attribute, recorded at the time the last
           * <code>"change"</code> event was fired.
           * @param {String} attr Name of the attribute to get.
           */
          previous: function previous(attr) {
            if (!arguments.length || !this._previousAttributes) {
              return null;
            }
            return this._previousAttributes[attr];
          },

          /**
           * Gets all of the attributes of the model at the time of the previous
           * <code>"change"</code> event.
           * @return {Object}
           */
          previousAttributes: function previousAttributes() {
            return _.clone(this._previousAttributes);
          },

          /**
           * Checks if the model is currently in a valid state. It's only possible to
           * get into an *invalid* state if you're using silent changes.
           * @return {Boolean}
           */
          isValid: function isValid() {
            return !this.validate(this.attributes);
          },

          /**
           * You should not call this function directly unless you subclass
           * <code>AV.Object</code>, in which case you can override this method
           * to provide additional validation on <code>set</code> and
           * <code>save</code>.  Your implementation should return
           *
           * @param {Object} attrs The current data to validate.
           * @param {Object} options A Backbone-like options object.
           * @return {} False if the data is valid.  An error object otherwise.
           * @see AV.Object#set
           */
          validate: function validate(attrs, options) {
            if (_.has(attrs, "ACL") && !(attrs.ACL instanceof AV.ACL)) {
              return new AVError(AVError.OTHER_CAUSE, "ACL must be a AV.ACL.");
            }
            return false;
          },

          /**
           * Run validation against a set of incoming attributes, returning `true`
           * if all is well. If a specific `error` callback has been passed,
           * call that instead of firing the general `"error"` event.
           */
          _validate: function _validate(attrs, options) {
            if (options.silent || !this.validate) {
              return true;
            }
            attrs = _.extend({}, this.attributes, attrs);
            var error = this.validate(attrs, options);
            if (!error) {
              return true;
            }
            if (options && options.error) {
              options.error(this, error, options);
            } else {
              this.trigger('error', this, error, options);
            }
            return false;
          },

          /**
           * Returns the ACL for this object.
           * @returns {AV.ACL} An instance of AV.ACL.
           * @see AV.Object#get
           */
          getACL: function getACL() {
            return this.get("ACL");
          },

          /**
           * Sets the ACL to be used for this object.
           * @param {AV.ACL} acl An instance of AV.ACL.
           * @param {Object} options Optional Backbone-like options object to be
           *     passed in to set.
           * @return {Boolean} Whether the set passed validation.
           * @see AV.Object#set
           */
          setACL: function setACL(acl, options) {
            return this.set("ACL", acl, options);
          }

        });

        /**
         * Creates an instance of a subclass of AV.Object for the give classname
         * and id.
         * @param  {String} className The name of the AV class backing this model.
         * @param {String} id The object id of this model.
         * @return {AV.Object} A new subclass instance of AV.Object.
         */
        AV.Object.createWithoutData = function (className, id, hasData) {
          var result = new AV.Object(className);
          result.id = id;
          result._hasData = hasData;
          return result;
        };
        /**
         * Delete objects in batch.The objects className must be the same.
         * @param {Array} The <code>AV.Object</code> array to be deleted.
         * @param {Object} options Standard options object with success and error
         *     callbacks.
         * @return {AV.Promise} A promise that is fulfilled when the save
         *     completes.
         */
        AV.Object.destroyAll = function (objects, options) {
          options = options || {};
          if (!objects || objects.length === 0) {
            return AV.Promise.as()._thenRunCallbacks(options);
          }
          var className = objects[0].className;
          var id = "";
          var wasFirst = true;
          objects.forEach(function (obj) {
            if (obj.className != className) throw "AV.Object.destroyAll requires the argument object array's classNames must be the same";
            if (!obj.id) throw "Could not delete unsaved object";
            if (wasFirst) {
              id = obj.id;
              wasFirst = false;
            } else {
              id = id + ',' + obj.id;
            }
          });
          var request = AVRequest('classes', className, id, 'DELETE', null, options.sessionToken);
          return request._thenRunCallbacks(options);
        };

        /**
         * Returns the appropriate subclass for making new instances of the given
         * className string.
         */
        AV.Object._getSubclass = function (className) {
          if (!_.isString(className)) {
            throw "AV.Object._getSubclass requires a string argument.";
          }
          var ObjectClass = AV.Object._classMap[className];
          if (!ObjectClass) {
            ObjectClass = AV.Object.extend(className);
            AV.Object._classMap[className] = ObjectClass;
          }
          return ObjectClass;
        };

        /**
         * Creates an instance of a subclass of AV.Object for the given classname.
         */
        AV.Object._create = function (className, attributes, options) {
          var ObjectClass = AV.Object._getSubclass(className);
          return new ObjectClass(attributes, options);
        };

        // Set up a map of className to class so that we can create new instances of
        // AV Objects from JSON automatically.
        AV.Object._classMap = {};

        AV.Object._extend = AV._extend;

        /**
         * Creates a new model with defined attributes,
         * It's the same with
         * <pre>
         *   new AV.Object(attributes, options);
         *  </pre>
         * @param {Object} attributes The initial set of data to store in the object.
         * @param {Object} options A set of Backbone-like options for creating the
         *     object.  The only option currently supported is "collection".
         * @return {AV.Object}
         * @since v0.4.4
         * @see AV.Object
         * @see AV.Object.extend
         */
        AV.Object['new'] = function (attributes, options) {
          return new AV.Object(attributes, options);
        };

        /**
         * Creates a new subclass of AV.Object for the given AV class name.
         *
         * <p>Every extension of a AV class will inherit from the most recent
         * previous extension of that class. When a AV.Object is automatically
         * created by parsing JSON, it will use the most recent extension of that
         * class.</p>
         *
         * <p>You should call either:<pre>
         *     var MyClass = AV.Object.extend("MyClass", {
         *         <i>Instance properties</i>
         *     }, {
         *         <i>Class properties</i>
         *     });</pre>
         * or, for Backbone compatibility:<pre>
         *     var MyClass = AV.Object.extend({
         *         className: "MyClass",
         *         <i>Other instance properties</i>
         *     }, {
         *         <i>Class properties</i>
         *     });</pre></p>
         *
         * @param {String} className The name of the AV class backing this model.
         * @param {Object} protoProps Instance properties to add to instances of the
         *     class returned from this method.
         * @param {Object} classProps Class properties to add the class returned from
         *     this method.
         * @return {Class} A new subclass of AV.Object.
         */
        AV.Object.extend = function (className, protoProps, classProps) {
          // Handle the case with only two args.
          if (!_.isString(className)) {
            if (className && _.has(className, "className")) {
              return AV.Object.extend(className.className, className, protoProps);
            } else {
              throw new Error("AV.Object.extend's first argument should be the className.");
            }
          }

          // If someone tries to subclass "User", coerce it to the right type.
          if (className === "User") {
            className = "_User";
          }

          var NewClassObject = null;
          if (_.has(AV.Object._classMap, className)) {
            var OldClassObject = AV.Object._classMap[className];
            // This new subclass has been told to extend both from "this" and from
            // OldClassObject. This is multiple inheritance, which isn't supported.
            // For now, let's just pick one.
            if (protoProps || classProps) {
              NewClassObject = OldClassObject._extend(protoProps, classProps);
            } else {
              return OldClassObject;
            }
          } else {
            protoProps = protoProps || {};
            protoProps._className = className;
            NewClassObject = this._extend(protoProps, classProps);
          }
          // Extending a subclass should reuse the classname automatically.
          NewClassObject.extend = function (arg0) {
            if (_.isString(arg0) || arg0 && _.has(arg0, "className")) {
              return AV.Object.extend.apply(NewClassObject, arguments);
            }
            var newArguments = [className].concat(_.toArray(arguments));
            return AV.Object.extend.apply(NewClassObject, newArguments);
          };
          NewClassObject['new'] = function (attributes, options) {
            return new NewClassObject(attributes, options);
          };
          AV.Object._classMap[className] = NewClassObject;
          return NewClassObject;
        };

        // ES6 class syntax support
        Object.defineProperty(AV.Object.prototype, 'className', {
          get: function get() {
            var className = this._className || this.constructor.name;
            // If someone tries to subclass "User", coerce it to the right type.
            if (className === "User") {
              return "_User";
            }
            return className;
          }
        });

        AV.Object.register = function (klass) {
          if (!(klass.prototype instanceof AV.Object)) {
            throw new Error('registered class is not a subclass of AV.Object');
          }
          var className = klass.name;
          if (!className.length) {
            throw new Error('registered class must be named');
          }
          AV.Object._classMap[className] = klass;
        };

        AV.Object._findUnsavedChildren = function (object, children, files) {
          AV._traverse(object, function (object) {
            if (object instanceof AV.Object) {
              object._refreshCache();
              if (object.dirty()) {
                children.push(object);
              }
              return;
            }

            if (object instanceof AV.File) {
              if (!object.url() && !object.id) {
                files.push(object);
              }
              return;
            }
          });
        };

        AV.Object._canBeSerializedAsValue = function (object) {
          var canBeSerializedAsValue = true;

          if (object instanceof AV.Object || object instanceof AV.File) {
            canBeSerializedAsValue = !!object.id;
          } else if (_.isArray(object)) {
            AV._arrayEach(object, function (child) {
              if (!AV.Object._canBeSerializedAsValue(child)) {
                canBeSerializedAsValue = false;
              }
            });
          } else if (_.isObject(object)) {
            AV._objectEach(object, function (child) {
              if (!AV.Object._canBeSerializedAsValue(child)) {
                canBeSerializedAsValue = false;
              }
            });
          }

          return canBeSerializedAsValue;
        };

        AV.Object._deepSaveAsync = function (object, model, options) {
          var unsavedChildren = [];
          var unsavedFiles = [];
          AV.Object._findUnsavedChildren(object, unsavedChildren, unsavedFiles);
          if (model) {
            unsavedChildren = _.filter(unsavedChildren, function (object) {
              return object != model;
            });
          }

          var promise = AV.Promise.as();
          _.each(unsavedFiles, function (file) {
            promise = promise.then(function () {
              return file.save();
            });
          });

          var objects = _.uniq(unsavedChildren);
          var remaining = _.uniq(objects);

          return promise.then(function () {
            return AV.Promise._continueWhile(function () {
              return remaining.length > 0;
            }, function () {

              // Gather up all the objects that can be saved in this batch.
              var batch = [];
              var newRemaining = [];
              AV._arrayEach(remaining, function (object) {
                // Limit batches to 20 objects.
                if (batch.length > 20) {
                  newRemaining.push(object);
                  return;
                }

                if (object._canBeSerialized()) {
                  batch.push(object);
                } else {
                  newRemaining.push(object);
                }
              });
              remaining = newRemaining;

              // If we can't save any objects, there must be a circular reference.
              if (batch.length === 0) {
                return AV.Promise.error(new AVError(AVError.OTHER_CAUSE, "Tried to save a batch with a cycle."));
              }

              // Reserve a spot in every object's save queue.
              var readyToStart = AV.Promise.when(_.map(batch, function (object) {
                return object._allPreviousSaves || AV.Promise.as();
              }));
              var batchFinished = new AV.Promise();
              AV._arrayEach(batch, function (object) {
                object._allPreviousSaves = batchFinished;
              });

              // Save a single batch, whether previous saves succeeded or failed.
              return readyToStart._continueWith(function () {
                return AVRequest("batch", null, null, "POST", {
                  requests: _.map(batch, function (object) {
                    var json = object._getSaveJSON();
                    var method = "POST";

                    var path = "/1.1/classes/" + object.className;
                    if (object.id) {
                      path = path + "/" + object.id;
                      method = "PUT";
                    }

                    object._startSave();

                    return {
                      method: method,
                      path: path,
                      body: json
                    };
                  })

                }, options && options.sessionToken).then(function (response) {
                  var error;
                  AV._arrayEach(batch, function (object, i) {
                    if (response[i].success) {
                      object._finishSave(object.parse(response[i].success));
                    } else {
                      error = error || response[i].error;
                      object._cancelSave();
                    }
                  });
                  if (error) {
                    return AV.Promise.error(new AVError(error.code, error.error));
                  }
                }).then(function (results) {
                  batchFinished.resolve(results);
                  return results;
                }, function (error) {
                  batchFinished.reject(error);
                  return AV.Promise.error(error);
                });
              });
            });
          }).then(function () {
            return object;
          });
        };
      };
    }, { "./error": 25, "./request": 38, "./utils": 46, "underscore": 18 }], 33: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      'use strict';

      var _ = require('underscore');

      module.exports = function (AV) {

        /**
         * @class
         * A AV.Op is an atomic operation that can be applied to a field in a
         * AV.Object. For example, calling <code>object.set("foo", "bar")</code>
         * is an example of a AV.Op.Set. Calling <code>object.unset("foo")</code>
         * is a AV.Op.Unset. These operations are stored in a AV.Object and
         * sent to the server as part of <code>object.save()</code> operations.
         * Instances of AV.Op should be immutable.
         *
         * You should not create subclasses of AV.Op or instantiate AV.Op
         * directly.
         */
        AV.Op = function () {
          this._initialize.apply(this, arguments);
        };

        AV.Op.prototype = {
          _initialize: function _initialize() {}
        };

        _.extend(AV.Op, {
          /**
           * To create a new Op, call AV.Op._extend();
           */
          _extend: AV._extend,

          // A map of __op string to decoder function.
          _opDecoderMap: {},

          /**
           * Registers a function to convert a json object with an __op field into an
           * instance of a subclass of AV.Op.
           */
          _registerDecoder: function _registerDecoder(opName, decoder) {
            AV.Op._opDecoderMap[opName] = decoder;
          },

          /**
           * Converts a json object into an instance of a subclass of AV.Op.
           */
          _decode: function _decode(json) {
            var decoder = AV.Op._opDecoderMap[json.__op];
            if (decoder) {
              return decoder(json);
            } else {
              return undefined;
            }
          }
        });

        /*
         * Add a handler for Batch ops.
         */
        AV.Op._registerDecoder("Batch", function (json) {
          var op = null;
          AV._arrayEach(json.ops, function (nextOp) {
            nextOp = AV.Op._decode(nextOp);
            op = nextOp._mergeWithPrevious(op);
          });
          return op;
        });

        /**
         * @class
         * A Set operation indicates that either the field was changed using
         * AV.Object.set, or it is a mutable container that was detected as being
         * changed.
         */
        AV.Op.Set = AV.Op._extend( /** @lends AV.Op.Set.prototype */{
          _initialize: function _initialize(value) {
            this._value = value;
          },

          /**
           * Returns the new value of this field after the set.
           */
          value: function value() {
            return this._value;
          },

          /**
           * Returns a JSON version of the operation suitable for sending to AV.
           * @return {Object}
           */
          toJSON: function toJSON() {
            return AV._encode(this.value());
          },

          _mergeWithPrevious: function _mergeWithPrevious(previous) {
            return this;
          },

          _estimate: function _estimate(oldValue) {
            return this.value();
          }
        });

        /**
         * A sentinel value that is returned by AV.Op.Unset._estimate to
         * indicate the field should be deleted. Basically, if you find _UNSET as a
         * value in your object, you should remove that key.
         */
        AV.Op._UNSET = {};

        /**
         * @class
         * An Unset operation indicates that this field has been deleted from the
         * object.
         */
        AV.Op.Unset = AV.Op._extend( /** @lends AV.Op.Unset.prototype */{
          /**
           * Returns a JSON version of the operation suitable for sending to AV.
           * @return {Object}
           */
          toJSON: function toJSON() {
            return { __op: "Delete" };
          },

          _mergeWithPrevious: function _mergeWithPrevious(previous) {
            return this;
          },

          _estimate: function _estimate(oldValue) {
            return AV.Op._UNSET;
          }
        });

        AV.Op._registerDecoder("Delete", function (json) {
          return new AV.Op.Unset();
        });

        /**
         * @class
         * An Increment is an atomic operation where the numeric value for the field
         * will be increased by a given amount.
         */
        AV.Op.Increment = AV.Op._extend(
        /** @lends AV.Op.Increment.prototype */{

          _initialize: function _initialize(amount) {
            this._amount = amount;
          },

          /**
           * Returns the amount to increment by.
           * @return {Number} the amount to increment by.
           */
          amount: function amount() {
            return this._amount;
          },

          /**
           * Returns a JSON version of the operation suitable for sending to AV.
           * @return {Object}
           */
          toJSON: function toJSON() {
            return { __op: "Increment", amount: this._amount };
          },

          _mergeWithPrevious: function _mergeWithPrevious(previous) {
            if (!previous) {
              return this;
            } else if (previous instanceof AV.Op.Unset) {
              return new AV.Op.Set(this.amount());
            } else if (previous instanceof AV.Op.Set) {
              return new AV.Op.Set(previous.value() + this.amount());
            } else if (previous instanceof AV.Op.Increment) {
              return new AV.Op.Increment(this.amount() + previous.amount());
            } else {
              throw "Op is invalid after previous op.";
            }
          },

          _estimate: function _estimate(oldValue) {
            if (!oldValue) {
              return this.amount();
            }
            return oldValue + this.amount();
          }
        });

        AV.Op._registerDecoder("Increment", function (json) {
          return new AV.Op.Increment(json.amount);
        });

        /**
         * @class
         * Add is an atomic operation where the given objects will be appended to the
         * array that is stored in this field.
         */
        AV.Op.Add = AV.Op._extend( /** @lends AV.Op.Add.prototype */{
          _initialize: function _initialize(objects) {
            this._objects = objects;
          },

          /**
           * Returns the objects to be added to the array.
           * @return {Array} The objects to be added to the array.
           */
          objects: function objects() {
            return this._objects;
          },

          /**
           * Returns a JSON version of the operation suitable for sending to AV.
           * @return {Object}
           */
          toJSON: function toJSON() {
            return { __op: "Add", objects: AV._encode(this.objects()) };
          },

          _mergeWithPrevious: function _mergeWithPrevious(previous) {
            if (!previous) {
              return this;
            } else if (previous instanceof AV.Op.Unset) {
              return new AV.Op.Set(this.objects());
            } else if (previous instanceof AV.Op.Set) {
              return new AV.Op.Set(this._estimate(previous.value()));
            } else if (previous instanceof AV.Op.Add) {
              return new AV.Op.Add(previous.objects().concat(this.objects()));
            } else {
              throw "Op is invalid after previous op.";
            }
          },

          _estimate: function _estimate(oldValue) {
            if (!oldValue) {
              return _.clone(this.objects());
            } else {
              return oldValue.concat(this.objects());
            }
          }
        });

        AV.Op._registerDecoder("Add", function (json) {
          return new AV.Op.Add(AV._decode(undefined, json.objects));
        });

        /**
         * @class
         * AddUnique is an atomic operation where the given items will be appended to
         * the array that is stored in this field only if they were not already
         * present in the array.
         */
        AV.Op.AddUnique = AV.Op._extend(
        /** @lends AV.Op.AddUnique.prototype */{

          _initialize: function _initialize(objects) {
            this._objects = _.uniq(objects);
          },

          /**
           * Returns the objects to be added to the array.
           * @return {Array} The objects to be added to the array.
           */
          objects: function objects() {
            return this._objects;
          },

          /**
           * Returns a JSON version of the operation suitable for sending to AV.
           * @return {Object}
           */
          toJSON: function toJSON() {
            return { __op: "AddUnique", objects: AV._encode(this.objects()) };
          },

          _mergeWithPrevious: function _mergeWithPrevious(previous) {
            if (!previous) {
              return this;
            } else if (previous instanceof AV.Op.Unset) {
              return new AV.Op.Set(this.objects());
            } else if (previous instanceof AV.Op.Set) {
              return new AV.Op.Set(this._estimate(previous.value()));
            } else if (previous instanceof AV.Op.AddUnique) {
              return new AV.Op.AddUnique(this._estimate(previous.objects()));
            } else {
              throw "Op is invalid after previous op.";
            }
          },

          _estimate: function _estimate(oldValue) {
            if (!oldValue) {
              return _.clone(this.objects());
            } else {
              // We can't just take the _.uniq(_.union(...)) of oldValue and
              // this.objects, because the uniqueness may not apply to oldValue
              // (especially if the oldValue was set via .set())
              var newValue = _.clone(oldValue);
              AV._arrayEach(this.objects(), function (obj) {
                if (obj instanceof AV.Object && obj.id) {
                  var matchingObj = _.find(newValue, function (anObj) {
                    return anObj instanceof AV.Object && anObj.id === obj.id;
                  });
                  if (!matchingObj) {
                    newValue.push(obj);
                  } else {
                    var index = _.indexOf(newValue, matchingObj);
                    newValue[index] = obj;
                  }
                } else if (!_.contains(newValue, obj)) {
                  newValue.push(obj);
                }
              });
              return newValue;
            }
          }
        });

        AV.Op._registerDecoder("AddUnique", function (json) {
          return new AV.Op.AddUnique(AV._decode(undefined, json.objects));
        });

        /**
         * @class
         * Remove is an atomic operation where the given objects will be removed from
         * the array that is stored in this field.
         */
        AV.Op.Remove = AV.Op._extend( /** @lends AV.Op.Remove.prototype */{
          _initialize: function _initialize(objects) {
            this._objects = _.uniq(objects);
          },

          /**
           * Returns the objects to be removed from the array.
           * @return {Array} The objects to be removed from the array.
           */
          objects: function objects() {
            return this._objects;
          },

          /**
           * Returns a JSON version of the operation suitable for sending to AV.
           * @return {Object}
           */
          toJSON: function toJSON() {
            return { __op: "Remove", objects: AV._encode(this.objects()) };
          },

          _mergeWithPrevious: function _mergeWithPrevious(previous) {
            if (!previous) {
              return this;
            } else if (previous instanceof AV.Op.Unset) {
              return previous;
            } else if (previous instanceof AV.Op.Set) {
              return new AV.Op.Set(this._estimate(previous.value()));
            } else if (previous instanceof AV.Op.Remove) {
              return new AV.Op.Remove(_.union(previous.objects(), this.objects()));
            } else {
              throw "Op is invalid after previous op.";
            }
          },

          _estimate: function _estimate(oldValue) {
            if (!oldValue) {
              return [];
            } else {
              var newValue = _.difference(oldValue, this.objects());
              // If there are saved AV Objects being removed, also remove them.
              AV._arrayEach(this.objects(), function (obj) {
                if (obj instanceof AV.Object && obj.id) {
                  newValue = _.reject(newValue, function (other) {
                    return other instanceof AV.Object && other.id === obj.id;
                  });
                }
              });
              return newValue;
            }
          }
        });

        AV.Op._registerDecoder("Remove", function (json) {
          return new AV.Op.Remove(AV._decode(undefined, json.objects));
        });

        /**
         * @class
         * A Relation operation indicates that the field is an instance of
         * AV.Relation, and objects are being added to, or removed from, that
         * relation.
         */
        AV.Op.Relation = AV.Op._extend(
        /** @lends AV.Op.Relation.prototype */{

          _initialize: function _initialize(adds, removes) {
            this._targetClassName = null;

            var self = this;

            var pointerToId = function pointerToId(object) {
              if (object instanceof AV.Object) {
                if (!object.id) {
                  throw "You can't add an unsaved AV.Object to a relation.";
                }
                if (!self._targetClassName) {
                  self._targetClassName = object.className;
                }
                if (self._targetClassName !== object.className) {
                  throw "Tried to create a AV.Relation with 2 different types: " + self._targetClassName + " and " + object.className + ".";
                }
                return object.id;
              }
              return object;
            };

            this.relationsToAdd = _.uniq(_.map(adds, pointerToId));
            this.relationsToRemove = _.uniq(_.map(removes, pointerToId));
          },

          /**
           * Returns an array of unfetched AV.Object that are being added to the
           * relation.
           * @return {Array}
           */
          added: function added() {
            var self = this;
            return _.map(this.relationsToAdd, function (objectId) {
              var object = AV.Object._create(self._targetClassName);
              object.id = objectId;
              return object;
            });
          },

          /**
           * Returns an array of unfetched AV.Object that are being removed from
           * the relation.
           * @return {Array}
           */
          removed: function removed() {
            var self = this;
            return _.map(this.relationsToRemove, function (objectId) {
              var object = AV.Object._create(self._targetClassName);
              object.id = objectId;
              return object;
            });
          },

          /**
           * Returns a JSON version of the operation suitable for sending to AV.
           * @return {Object}
           */
          toJSON: function toJSON() {
            var adds = null;
            var removes = null;
            var self = this;
            var idToPointer = function idToPointer(id) {
              return { __type: 'Pointer',
                className: self._targetClassName,
                objectId: id };
            };
            var pointers = null;
            if (this.relationsToAdd.length > 0) {
              pointers = _.map(this.relationsToAdd, idToPointer);
              adds = { "__op": "AddRelation", "objects": pointers };
            }

            if (this.relationsToRemove.length > 0) {
              pointers = _.map(this.relationsToRemove, idToPointer);
              removes = { "__op": "RemoveRelation", "objects": pointers };
            }

            if (adds && removes) {
              return { "__op": "Batch", "ops": [adds, removes] };
            }

            return adds || removes || {};
          },

          _mergeWithPrevious: function _mergeWithPrevious(previous) {
            if (!previous) {
              return this;
            } else if (previous instanceof AV.Op.Unset) {
              throw "You can't modify a relation after deleting it.";
            } else if (previous instanceof AV.Op.Relation) {
              if (previous._targetClassName && previous._targetClassName !== this._targetClassName) {
                throw "Related object must be of class " + previous._targetClassName + ", but " + this._targetClassName + " was passed in.";
              }
              var newAdd = _.union(_.difference(previous.relationsToAdd, this.relationsToRemove), this.relationsToAdd);
              var newRemove = _.union(_.difference(previous.relationsToRemove, this.relationsToAdd), this.relationsToRemove);

              var newRelation = new AV.Op.Relation(newAdd, newRemove);
              newRelation._targetClassName = this._targetClassName;
              return newRelation;
            } else {
              throw "Op is invalid after previous op.";
            }
          },

          _estimate: function _estimate(oldValue, object, key) {
            if (!oldValue) {
              var relation = new AV.Relation(object, key);
              relation.targetClassName = this._targetClassName;
            } else if (oldValue instanceof AV.Relation) {
              if (this._targetClassName) {
                if (oldValue.targetClassName) {
                  if (oldValue.targetClassName !== this._targetClassName) {
                    throw "Related object must be a " + oldValue.targetClassName + ", but a " + this._targetClassName + " was passed in.";
                  }
                } else {
                  oldValue.targetClassName = this._targetClassName;
                }
              }
              return oldValue;
            } else {
              throw "Op is invalid after previous op.";
            }
          }
        });

        AV.Op._registerDecoder("AddRelation", function (json) {
          return new AV.Op.Relation(AV._decode(undefined, json.objects), []);
        });
        AV.Op._registerDecoder("RemoveRelation", function (json) {
          return new AV.Op.Relation([], AV._decode(undefined, json.objects));
        });
      };
    }, { "underscore": 18 }], 34: [function (require, module, exports) {
      (function (process) {
        /**
         * 每位工程师都有保持代码优雅的义务
         * Each engineer has a duty to keep the code elegant
        **/

        'use strict';

        var _ = require('underscore');

        var Promise = module.exports = function Promise(fn) {
          /**
           * A Promise is returned by async methods as a hook to provide callbacks to be
           * called when the async task is fulfilled.
           *
           * <p>Typical usage would be like:<pre>
           *    query.find().then(function(results) {
           *      results[0].set("foo", "bar");
           *      return results[0].saveAsync();
           *    }).then(function(result) {
           *      console.log("Updated " + result.id);
           *    });
           * </pre></p>
           * <p>Another example:<pre>
           *    var promise = new AV.Promise(function(resolve, reject) {
           *      resolve(42);
           *    });
           *    promise.then(function(value){
           *      console.log(value);
           *    }).catch(function(error){
           *      console.error(error);
           *    });
           * </pre></p>
           * @param {Function} fn An optional function with two arguments resolve
           *                   and reject.The first argument fulfills the promise,
           *                   the second argument rejects it. We can call these
            *                  functions, once our operation is completed.
           * @see AV.Promise.prototype.then
           * @class
           */
          this._resolved = false;
          this._rejected = false;
          this._resolvedCallbacks = [];
          this._rejectedCallbacks = [];

          this.doResolve(fn);
        };

        var _isNullOrUndefined = function _isNullOrUndefined(x) {
          return _.isNull(x) || _.isUndefined(x);
        };

        var _isNode = false;

        if (typeof process !== "undefined" && process.versions && process.versions.node) {
          _isNode = true;
        }

        _.extend(Promise, /** @lends AV.Promise */{

          _isPromisesAPlusCompliant: !_isNode,
          _debugError: false,

          setPromisesAPlusCompliant: function setPromisesAPlusCompliant(isCompliant) {
            Promise._isPromisesAPlusCompliant = isCompliant;
          },

          setDebugError: function setDebugError(enable) {
            Promise._debugError = enable;
          },

          /**
           * Returns true iff the given object fulfils the Promise interface.
           * @return {Boolean}
           */
          is: function is(promise) {
            return promise && promise.then && _.isFunction(promise.then);
          },

          /**
           * Returns a new promise that is resolved with a given value.
           * @return {AV.Promise} the new promise.
           */
          as: function as() {
            var promise = new Promise();
            if (arguments[0] && _.isFunction(arguments[0].then)) {
              arguments[0].then(function (data) {
                promise.resolve.call(promise, data);
              }, function (err) {
                promise.reject.call(promise, err);
              });
            } else {
              promise.resolve.apply(promise, arguments);
            }
            return promise;
          },

          /**
           * Returns a new promise that is rejected with a given error.
           * @return {AV.Promise} the new promise.
           */
          error: function error() {
            var promise = new Promise();
            promise.reject.apply(promise, arguments);
            return promise;
          },

          /**
           * Returns a new promise that is fulfilled when all of the input promises
           * are resolved. If any promise in the list fails, then the returned promise
           * will fail with the last error. If they all succeed, then the returned
           * promise will succeed, with the results being the results of all the input
           * promises. For example: <pre>
           *   var p1 = AV.Promise.as(1);
           *   var p2 = AV.Promise.as(2);
           *   var p3 = AV.Promise.as(3);
           *
           *   AV.Promise.when(p1, p2, p3).then(function(r1, r2, r3) {
           *     console.log(r1);  // prints 1
           *     console.log(r2);  // prints 2
           *     console.log(r3);  // prints 3
           *   });</pre>
           *
           * The input promises can also be specified as an array: <pre>
           *   var promises = [p1, p2, p3];
           *   AV.Promise.when(promises).then(function(r1, r2, r3) {
           *     console.log(r1);  // prints 1
           *     console.log(r2);  // prints 2
           *     console.log(r3);  // prints 3
           *   });
           * </pre>
           * @param {Array} promises a list of promises to wait for.
           * @return {AV.Promise} the new promise.
           */
          when: function when(promises) {
            // Allow passing in Promises as separate arguments instead of an Array.
            var objects;
            if (promises && _isNullOrUndefined(promises.length)) {
              objects = arguments;
            } else {
              objects = promises;
            }
            var isAll = _.last(arguments);
            isAll = _.isBoolean(isAll) ? isAll : false;

            var total = objects.length;
            var hadError = false;
            var results = [];
            var errors = [];
            results.length = objects.length;
            errors.length = objects.length;

            if (total === 0) {
              if (isAll) {
                return Promise.as.call(this, results);
              } else {
                return Promise.as.apply(this, results);
              }
            }

            var promise = new Promise();

            var resolveOne = function resolveOne(i) {
              total = total - 1;
              if (hadError && !promise._rejected && isAll) {
                promise.reject.call(promise, errors[i]);
                return;
              }

              if (total === 0) {
                if (hadError && !promise._rejected) {
                  promise.reject.call(promise, errors);
                } else {
                  if (isAll) {
                    if (!promise._rejected) {
                      promise.resolve.call(promise, results);
                    } else {
                      //It's rejected already, so we ignore it.
                    }
                  } else {
                    promise.resolve.apply(promise, results);
                  }
                }
              }
            };

            _.each(objects, function (object, i) {
              if (Promise.is(object)) {
                object.then(function (result) {
                  results[i] = result;
                  resolveOne(i);
                }, function (error) {
                  errors[i] = error;
                  hadError = true;
                  resolveOne(i);
                });
              } else {
                results[i] = object;
                resolveOne(i);
              }
            });

            return promise;
          },

          /**
           * Returns a promise that resolves or rejects as soon as one
           * of the promises in the iterable resolves or rejects, with
           * the value or reason from that promise.Returns a new promise
           * that is fulfilled when one of the input promises.
           * For example: <pre>
           *   var p1 = AV.Promise.as(1);
           *   var p2 = AV.Promise.as(2);
           *   var p3 = AV.Promise.as(3);
           *
           *   AV.Promise.race(p1, p2, p3).then(function(result) {
           *     console.log(result);  // prints 1
           *   });</pre>
           *
           * The input promises can also be specified as an array: <pre>
           *   var promises = [p1, p2, p3];
           *   AV.Promise.when(promises).then(function(result) {
           *     console.log(result);  // prints 1
           *   });
           * </pre>
           * @param {Array} promises a list of promises to wait for.
           * @return {AV.Promise} the new promise.
           */
          race: function race(promises) {
            // Allow passing in Promises as separate arguments instead of an Array.
            var objects;
            if (promises && _isNullOrUndefined(promises.length)) {
              objects = arguments;
            } else {
              objects = promises;
            }

            var total = objects.length;
            var hadError = false;
            var results = [];
            var errors = [];

            results.length = errors.length = objects.length;

            if (total === 0) {
              return Promise.as.call(this);
            }

            var promise = new Promise();

            var resolveOne = function resolveOne(i) {
              if (!promise._resolved && !promise._rejected) {
                if (hadError) {
                  promise.reject.call(promise, errors[i]);
                } else {
                  promise.resolve.call(promise, results[i]);
                }
              }
            };

            _.each(objects, function (object, i) {
              if (Promise.is(object)) {
                object.then(function (result) {
                  results[i] = result;
                  resolveOne(i);
                }, function (error) {
                  errors[i] = error;
                  hadError = true;
                  resolveOne(i);
                });
              } else {
                results[i] = object;
                resolveOne(i);
              }
            });

            return promise;
          },

          /**
           * Runs the given asyncFunction repeatedly, as long as the predicate
           * function returns a truthy value. Stops repeating if asyncFunction returns
           * a rejected promise.
           * @param {Function} predicate should return false when ready to stop.
           * @param {Function} asyncFunction should return a Promise.
           */
          _continueWhile: function _continueWhile(predicate, asyncFunction) {
            if (predicate()) {
              return asyncFunction().then(function () {
                return Promise._continueWhile(predicate, asyncFunction);
              });
            }
            return Promise.as();
          }
        });

        /**
         * Just like AV.Promise.when, but it calls resolveCallbck function
         * with one results array and calls rejectCallback function as soon as any one
         * of the input promises rejects.
         * @see AV.Promise.when
         */
        Promise.all = function (promises) {
          return Promise.when(promises, true);
        };

        _.extend(Promise.prototype, /** @lends AV.Promise.prototype */{

          /**
           * Marks this promise as fulfilled, firing any callbacks waiting on it.
           * @param {Object} result the result to pass to the callbacks.
           */
          resolve: function resolve(result) {
            if (this._resolved || this._rejected) {
              throw new Error("A promise was resolved even though it had already been " + (this._resolved ? "resolved" : "rejected") + ".");
            }
            this._resolved = true;
            this._result = arguments;
            var results = arguments;
            _.each(this._resolvedCallbacks, function (resolvedCallback) {
              resolvedCallback.apply(this, results);
            });
            this._resolvedCallbacks = [];
            this._rejectedCallbacks = [];
          },

          doResolve: function doResolve(fn) {
            if (!fn) return;
            var done = false;
            var self = this;
            try {
              fn(function (value) {
                if (done) return;
                done = true;
                self.resolve.call(self, value);
              }, function (reason) {
                if (done) return;
                done = true;
                self.reject.call(self, reason);
              });
            } catch (ex) {
              if (done) return;
              done = true;
              self.reject.call(self, ex);
            }
          },

          /**
           * Marks this promise as fulfilled, firing any callbacks waiting on it.
           * @param {Object} error the error to pass to the callbacks.
           */
          reject: function reject(error) {
            if (this._resolved || this._rejected) {
              throw new Promise("A promise was rejected even though it had already been " + (this._resolved ? "resolved" : "rejected") + ".");
            }
            this._rejected = true;
            this._error = error;
            _.each(this._rejectedCallbacks, function (rejectedCallback) {
              rejectedCallback(error);
            });
            this._resolvedCallbacks = [];
            this._rejectedCallbacks = [];
          },

          /**
           * Adds callbacks to be called when this promise is fulfilled. Returns a new
           * Promise that will be fulfilled when the callback is complete. It allows
           * chaining. If the callback itself returns a Promise, then the one returned
           * by "then" will not be fulfilled until that one returned by the callback
           * is fulfilled.
           * @param {Function} resolvedCallback Function that is called when this
           * Promise is resolved. Once the callback is complete, then the Promise
           * returned by "then" will also be fulfilled.
           * @param {Function} rejectedCallback Function that is called when this
           * Promise is rejected with an error. Once the callback is complete, then
           * the promise returned by "then" with be resolved successfully. If
           * rejectedCallback is null, or it returns a rejected Promise, then the
           * Promise returned by "then" will be rejected with that error.
           * @return {AV.Promise} A new Promise that will be fulfilled after this
           * Promise is fulfilled and either callback has completed. If the callback
           * returned a Promise, then this Promise will not be fulfilled until that
           * one is.
           */
          then: function then(resolvedCallback, rejectedCallback) {
            var promise = new Promise();

            var wrappedResolvedCallback = function wrappedResolvedCallback() {
              var result = arguments;
              if (resolvedCallback) {
                if (Promise._isPromisesAPlusCompliant) {
                  try {
                    result = [resolvedCallback.apply(this, result)];
                  } catch (e) {
                    if (Promise._debugError && e) {
                      console.error('Error occurred in promise resolve callback.', e.stack || e);
                    }
                    result = [Promise.error(e)];
                  }
                } else {
                  result = [resolvedCallback.apply(this, result)];
                }
              }
              if (result.length === 1 && Promise.is(result[0])) {
                result[0].then(function () {
                  promise.resolve.apply(promise, arguments);
                }, function (error) {
                  promise.reject(error);
                });
              } else {
                promise.resolve.apply(promise, result);
              }
            };

            var wrappedRejectedCallback = function wrappedRejectedCallback(error) {
              var result = [];
              if (rejectedCallback) {
                if (Promise._isPromisesAPlusCompliant) {
                  try {
                    result = [rejectedCallback(error)];
                  } catch (e) {
                    if (Promise._debugError && e) {
                      console.error('Error occurred in promise reject callback.', e.stack || e);
                    }
                    result = [Promise.error(e)];
                  }
                } else {
                  result = [rejectedCallback(error)];
                }
                if (result.length === 1 && Promise.is(result[0])) {
                  result[0].then(function () {
                    promise.resolve.apply(promise, arguments);
                  }, function (error) {
                    promise.reject(error);
                  });
                } else {
                  if (Promise._isPromisesAPlusCompliant) {
                    promise.resolve.apply(promise, result);
                  } else {
                    promise.reject(result[0]);
                  }
                }
              } else {
                promise.reject(error);
              }
            };

            var runLater = function runLater(func) {
              func.call();
            };
            if (Promise._isPromisesAPlusCompliant) {
              if (typeof window !== 'undefined' && _.isFunction(window.setImmediate)) {
                runLater = function runLater(func) {
                  window.setImmediate(func);
                };
              } else if (typeof process !== 'undefined' && process.nextTick) {
                runLater = function runLater(func) {
                  process.nextTick(func);
                };
              } else if (typeof setTimeout !== 'undefined' && _.isFunction(setTimeout)) {
                runLater = function runLater(func) {
                  setTimeout(func, 0);
                };
              }
            }

            var self = this;
            if (this._resolved) {
              runLater(function () {
                wrappedResolvedCallback.apply(self, self._result);
              });
            } else if (this._rejected) {
              runLater(function () {
                wrappedRejectedCallback.apply(self, [self._error]);
              });
            } else {
              this._resolvedCallbacks.push(wrappedResolvedCallback);
              this._rejectedCallbacks.push(wrappedRejectedCallback);
            }

            return promise;
          },

          /**
           * Add handlers to be called when the Promise object is rejected.
           *
           * @param {Function} rejectedCallback Function that is called when this
           *                   Promise is rejected with an error.
           * @return {AV.Promise} A new Promise that will be fulfilled after this
           *                   Promise is fulfilled and either callback has completed. If the callback
           * returned a Promise, then this Promise will not be fulfilled until that
           *                   one is.
           * @function
           */
          catch: function _catch(onRejected) {
            return this.then(undefined, onRejected);
          },

          /**
           * Add handlers to be called when the promise
           * is either resolved or rejected
           */
          always: function always(callback) {
            return this.then(callback, callback);
          },

          /**
           * Add handlers to be called when the Promise object is resolved
           */
          done: function done(callback) {
            return this.then(callback);
          },

          /**
           * Add handlers to be called when the Promise object is rejected
           */
          fail: function fail(callback) {
            return this.then(null, callback);
          },

          /**
           * Run the given callbacks after this promise is fulfilled.
           * @param optionsOrCallback {} A Backbone-style options callback, or a
           * callback function. If this is an options object and contains a "model"
           * attributes, that will be passed to error callbacks as the first argument.
           * @param model {} If truthy, this will be passed as the first result of
           * error callbacks. This is for Backbone-compatability.
           * @return {AV.Promise} A promise that will be resolved after the
           * callbacks are run, with the same result as this.
           */
          _thenRunCallbacks: function _thenRunCallbacks(optionsOrCallback, model) {
            var options;
            if (_.isFunction(optionsOrCallback)) {
              var callback = optionsOrCallback;
              options = {
                success: function success(result) {
                  callback(result, null);
                },
                error: function error(_error) {
                  callback(null, _error);
                }
              };
            } else {
              options = _.clone(optionsOrCallback);
            }
            options = options || {};

            return this.then(function (result) {
              if (options.success) {
                options.success.apply(this, arguments);
              } else if (model) {
                // When there's no callback, a sync event should be triggered.
                model.trigger('sync', model, result, options);
              }
              return Promise.as.apply(Promise, arguments);
            }, function (error) {
              if (options.error) {
                if (!_.isUndefined(model)) {
                  options.error(model, error);
                } else {
                  options.error(error);
                }
              } else if (model) {
                // When there's no error callback, an error event should be triggered.
                model.trigger('error', model, error, options);
              }
              // By explicitly returning a rejected Promise, this will work with
              // either jQuery or Promises/A semantics.
              return Promise.error(error);
            });
          },

          /**
           * Adds a callback function that should be called regardless of whether
           * this promise failed or succeeded. The callback will be given either the
           * array of results for its first argument, or the error as its second,
           * depending on whether this Promise was rejected or resolved. Returns a
           * new Promise, like "then" would.
           * @param {Function} continuation the callback.
           */
          _continueWith: function _continueWith(continuation) {
            return this.then(function () {
              return continuation(arguments, null);
            }, function (error) {
              return continuation(null, error);
            });
          }

        });

        /**
         * Alias of AV.Promise.prototype.always
         * @function
         * @see AV.Promise#always
         */
        Promise.prototype.finally = Promise.prototype.always;

        /**
         * Alias of AV.Promise.prototype.done
         * @function
         * @see AV.Promise#done
         */
        Promise.prototype.try = Promise.prototype.done;
      }).call(this, require('_process'));
    }, { "_process": 11, "underscore": 18 }], 35: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      var AVRequest = require('./request').request;

      module.exports = function (AV) {
        AV.Installation = AV.Object.extend("_Installation");

        /**
         * Contains functions to deal with Push in AV
         * @name AV.Push
         * @namespace
         */
        AV.Push = AV.Push || {};

        /**
         * Sends a push notification.
         * @param {Object} data -  The data of the push notification.  Valid fields
         * are:
         *   <ol>
         *     <li>channels - An Array of channels to push to.</li>
         *     <li>push_time - A Date object for when to send the push.</li>
         *     <li>expiration_time -  A Date object for when to expire
         *         the push.</li>
         *     <li>expiration_interval - The seconds from now to expire the push.</li>
         *     <li>where - A AV.Query over AV.Installation that is used to match
         *         a set of installations to push to.</li>
         *     <li>cql - A CQL statement over AV.Installation that is used to match
         *         a set of installations to push to.</li>
         *     <li>data - The data to send as part of the push</li>
         *   <ol>
         * @param {Object} options An object that has an optional success function,
         * that takes no arguments and will be called on a successful push, and
         * an error function that takes a AVError and will be called if the push
         * failed.
         */
        AV.Push.send = function (data, options) {
          if (data.where) {
            data.where = data.where.toJSON().where;
          }

          if (data.where && data.cql) {
            throw "Both where and cql can't be set";
          }

          if (data.push_time) {
            data.push_time = data.push_time.toJSON();
          }

          if (data.expiration_time) {
            data.expiration_time = data.expiration_time.toJSON();
          }

          if (data.expiration_time && data.expiration_time_interval) {
            throw "Both expiration_time and expiration_time_interval can't be set";
          }

          var request = AVRequest('push', null, null, 'POST', data);
          return request._thenRunCallbacks(options);
        };
      };
    }, { "./request": 38 }], 36: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      var _ = require('underscore');
      var AVError = require('./error');
      var AVRequest = require('./request').request;

      // AV.Query is a way to create a list of AV.Objects.
      module.exports = function (AV) {
        /**
         * Creates a new avoscloud AV.Query for the given AV.Object subclass.
         * @param objectClass -
         *   An instance of a subclass of AV.Object, or a AV className string.
         * @class
         *
         * <p>AV.Query defines a query that is used to fetch AV.Objects. The
         * most common use case is finding all objects that match a query through the
         * <code>find</code> method. For example, this sample code fetches all objects
         * of class <code>MyClass</code>. It calls a different function depending on
         * whether the fetch succeeded or not.
         *
         * <pre>
         * var query = new AV.Query(MyClass);
         * query.find({
         *   success: function(results) {
         *     // results is an array of AV.Object.
         *   },
         *
         *   error: function(error) {
         *     // error is an instance of AVError.
         *   }
         * });</pre></p>
         *
         * <p>A AV.Query can also be used to retrieve a single object whose id is
         * known, through the get method. For example, this sample code fetches an
         * object of class <code>MyClass</code> and id <code>myId</code>. It calls a
         * different function depending on whether the fetch succeeded or not.
         *
         * <pre>
         * var query = new AV.Query(MyClass);
         * query.get(myId, {
         *   success: function(object) {
         *     // object is an instance of AV.Object.
         *   },
         *
         *   error: function(object, error) {
         *     // error is an instance of AVError.
         *   }
         * });</pre></p>
         *
         * <p>A AV.Query can also be used to count the number of objects that match
         * the query without retrieving all of those objects. For example, this
         * sample code counts the number of objects of the class <code>MyClass</code>
         * <pre>
         * var query = new AV.Query(MyClass);
         * query.count({
         *   success: function(number) {
         *     // There are number instances of MyClass.
         *   },
         *
         *   error: function(error) {
         *     // error is an instance of AVError.
         *   }
         * });</pre></p>
         */
        AV.Query = function (objectClass) {
          if (_.isString(objectClass)) {
            objectClass = AV.Object._getSubclass(objectClass);
          }

          this.objectClass = objectClass;

          this.className = objectClass.prototype.className;

          this._where = {};
          this._include = [];
          this._limit = -1; // negative limit means, do not send a limit
          this._skip = 0;
          this._extraOptions = {};
        };

        /**
         * Constructs a AV.Query that is the OR of the passed in queries.  For
         * example:
         * <pre>var compoundQuery = AV.Query.or(query1, query2, query3);</pre>
         *
         * will create a compoundQuery that is an or of the query1, query2, and
         * query3.
         * @param {...AV.Query} var_args The list of queries to OR.
         * @return {AV.Query} The query that is the OR of the passed in queries.
         */
        AV.Query.or = function () {
          var queries = _.toArray(arguments);
          var className = null;
          AV._arrayEach(queries, function (q) {
            if (_.isNull(className)) {
              className = q.className;
            }

            if (className !== q.className) {
              throw "All queries must be for the same class";
            }
          });
          var query = new AV.Query(className);
          query._orQuery(queries);
          return query;
        };

        /**
         * Constructs a AV.Query that is the AND of the passed in queries.  For
         * example:
         * <pre>var compoundQuery = AV.Query.and(query1, query2, query3);</pre>
         *
         * will create a compoundQuery that is an 'and' of the query1, query2, and
         * query3.
         * @param {...AV.Query} var_args The list of queries to AND.
         * @return {AV.Query} The query that is the AND of the passed in queries.
         */
        AV.Query.and = function () {
          var queries = _.toArray(arguments);
          var className = null;
          AV._arrayEach(queries, function (q) {
            if (_.isNull(className)) {
              className = q.className;
            }

            if (className !== q.className) {
              throw "All queries must be for the same class";
            }
          });
          var query = new AV.Query(className);
          query._andQuery(queries);
          return query;
        };

        /**
         * Retrieves a list of AVObjects that satisfy the CQL.
         * CQL syntax please see <a href='https://cn.avoscloud.com/docs/cql_guide.html'>CQL Guide.</a>
         * Either options.success or options.error is called when the find
         * completes.
         *
         * @param {String} cql,  A CQL string, see <a href='https://cn.avoscloud.com/docs/cql_guide.html'>CQL Guide.</a>
         * @param {Array} pvalues, An array contains placeholder values.
         * @param {Object} options A Backbone-style options object,it's optional.
         * @return {AV.Promise} A promise that is resolved with the results when
         * the query completes,it's optional.
         */
        AV.Query.doCloudQuery = function (cql, pvalues, options) {
          var params = { cql: cql };
          if (_.isArray(pvalues)) {
            params.pvalues = pvalues;
          } else {
            options = pvalues;
          }

          var request = AVRequest('cloudQuery', null, null, 'GET', params, options && options.sessionToken);
          return request.then(function (response) {
            //query to process results.
            var query = new AV.Query(response.className);
            var results = _.map(response.results, function (json) {
              var obj = query._newObject(response);
              if (obj._finishFetch) {
                obj._finishFetch(query._processResult(json), true);
              }
              return obj;
            });
            return {
              results: results,
              count: response.count,
              className: response.className
            };
          })._thenRunCallbacks(options);
        };

        AV.Query._extend = AV._extend;

        AV.Query.prototype = {
          //hook to iterate result. Added by dennis<xzhuang@avoscloud.com>.
          _processResult: function _processResult(obj) {
            return obj;
          },

          /**
           * Constructs a AV.Object whose id is already known by fetching data from
           * the server.  Either options.success or options.error is called when the
           * find completes.
           *
           * @param {} objectId The id of the object to be fetched.
           * @param {Object} options A Backbone-style options object.
           */
          get: function get(objectId, options) {
            if (!objectId) {
              var errorObject = new AVError(AVError.OBJECT_NOT_FOUND, "Object not found.");
              throw errorObject;
            }

            var self = this;
            self.equalTo('objectId', objectId);

            return self.first().then(function (response) {
              if (!_.isEmpty(response)) {
                return response;
              }

              var errorObject = new AVError(AVError.OBJECT_NOT_FOUND, "Object not found.");
              return AV.Promise.error(errorObject);
            })._thenRunCallbacks(options, null);
          },

          /**
           * Returns a JSON representation of this query.
           * @return {Object}
           */
          toJSON: function toJSON() {
            var params = {
              where: this._where
            };

            if (this._include.length > 0) {
              params.include = this._include.join(",");
            }
            if (this._select) {
              params.keys = this._select.join(",");
            }
            if (this._limit >= 0) {
              params.limit = this._limit;
            }
            if (this._skip > 0) {
              params.skip = this._skip;
            }
            if (this._order !== undefined) {
              params.order = this._order;
            }

            AV._objectEach(this._extraOptions, function (v, k) {
              params[k] = v;
            });

            return params;
          },

          _newObject: function _newObject(response) {
            var obj;
            if (response && response.className) {
              obj = new AV.Object(response.className);
            } else {
              obj = new this.objectClass();
            }
            return obj;
          },
          _createRequest: function _createRequest(params, options) {
            return AVRequest('classes', this.className, null, "GET", params || this.toJSON(), options && options.sessionToken);
          },

          /**
           * Retrieves a list of AVObjects that satisfy this query.
           * Either options.success or options.error is called when the find
           * completes.
           *
           * @param {Object} options A Backbone-style options object.
           * @return {AV.Promise} A promise that is resolved with the results when
           * the query completes.
           */
          find: function find(options) {
            var self = this;

            var request = this._createRequest(null, options);

            return request.then(function (response) {
              return _.map(response.results, function (json) {
                var obj = self._newObject(response);
                if (obj._finishFetch) {
                  obj._finishFetch(self._processResult(json), true);
                }
                return obj;
              });
            })._thenRunCallbacks(options);
          },

          /**
           * Delete objects retrieved by this query.
           * @param {Object} options Standard options object with success and error
           *     callbacks.
           * @return {AV.Promise} A promise that is fulfilled when the save
           *     completes.
           */
          destroyAll: function destroyAll(options) {
            var self = this;
            return self.find().then(function (objects) {
              return AV.Object.destroyAll(objects);
            })._thenRunCallbacks(options);
          },

          /**
           * Counts the number of objects that match this query.
           * Either options.success or options.error is called when the count
           * completes.
           *
           * @param {Object} options A Backbone-style options object.
           * @return {AV.Promise} A promise that is resolved with the count when
           * the query completes.
           */
          count: function count(options) {
            var params = this.toJSON();
            params.limit = 0;
            params.count = 1;
            var request = this._createRequest(params, options);

            return request.then(function (response) {
              return response.count;
            })._thenRunCallbacks(options);
          },

          /**
           * Retrieves at most one AV.Object that satisfies this query.
           *
           * Either options.success or options.error is called when it completes.
           * success is passed the object if there is one. otherwise, undefined.
           *
           * @param {Object} options A Backbone-style options object.
           * @return {AV.Promise} A promise that is resolved with the object when
           * the query completes.
           */
          first: function first(options) {
            var self = this;

            var params = this.toJSON();
            params.limit = 1;
            var request = this._createRequest(params, options);

            return request.then(function (response) {
              return _.map(response.results, function (json) {
                var obj = self._newObject();
                if (obj._finishFetch) {
                  obj._finishFetch(self._processResult(json), true);
                }
                return obj;
              })[0];
            })._thenRunCallbacks(options);
          },

          /**
           * Returns a new instance of AV.Collection backed by this query.
           * @return {AV.Collection}
           */
          collection: function collection(items, options) {
            options = options || {};
            return new AV.Collection(items, _.extend(options, {
              model: this._objectClass || this.objectClass,
              query: this
            }));
          },

          /**
           * Sets the number of results to skip before returning any results.
           * This is useful for pagination.
           * Default is to skip zero results.
           * @param {Number} n the number of results to skip.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          skip: function skip(n) {
            this._skip = n;
            return this;
          },

          /**
           * Sets the limit of the number of results to return. The default limit is
           * 100, with a maximum of 1000 results being returned at a time.
           * @param {Number} n the number of results to limit to.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          limit: function limit(n) {
            this._limit = n;
            return this;
          },

          /**
           * Add a constraint to the query that requires a particular key's value to
           * be equal to the provided value.
           * @param {String} key The key to check.
           * @param value The value that the AV.Object must contain.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          equalTo: function equalTo(key, value) {
            this._where[key] = AV._encode(value);
            return this;
          },

          /**
           * Helper for condition queries
           */
          _addCondition: function _addCondition(key, condition, value) {
            // Check if we already have a condition
            if (!this._where[key]) {
              this._where[key] = {};
            }
            this._where[key][condition] = AV._encode(value);
            return this;
          },

          /**
           * Add a constraint to the query that requires a particular
           * <strong>array</strong> key's length to be equal to the provided value.
           * @param {String} key The array key to check.
           * @param value The length value.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          sizeEqualTo: function sizeEqualTo(key, value) {
            this._addCondition(key, "$size", value);
          },

          /**
           * Add a constraint to the query that requires a particular key's value to
           * be not equal to the provided value.
           * @param {String} key The key to check.
           * @param value The value that must not be equalled.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          notEqualTo: function notEqualTo(key, value) {
            this._addCondition(key, "$ne", value);
            return this;
          },

          /**
           * Add a constraint to the query that requires a particular key's value to
           * be less than the provided value.
           * @param {String} key The key to check.
           * @param value The value that provides an upper bound.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          lessThan: function lessThan(key, value) {
            this._addCondition(key, "$lt", value);
            return this;
          },

          /**
           * Add a constraint to the query that requires a particular key's value to
           * be greater than the provided value.
           * @param {String} key The key to check.
           * @param value The value that provides an lower bound.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          greaterThan: function greaterThan(key, value) {
            this._addCondition(key, "$gt", value);
            return this;
          },

          /**
           * Add a constraint to the query that requires a particular key's value to
           * be less than or equal to the provided value.
           * @param {String} key The key to check.
           * @param value The value that provides an upper bound.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          lessThanOrEqualTo: function lessThanOrEqualTo(key, value) {
            this._addCondition(key, "$lte", value);
            return this;
          },

          /**
           * Add a constraint to the query that requires a particular key's value to
           * be greater than or equal to the provided value.
           * @param {String} key The key to check.
           * @param value The value that provides an lower bound.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          greaterThanOrEqualTo: function greaterThanOrEqualTo(key, value) {
            this._addCondition(key, "$gte", value);
            return this;
          },

          /**
           * Add a constraint to the query that requires a particular key's value to
           * be contained in the provided list of values.
           * @param {String} key The key to check.
           * @param {Array} values The values that will match.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          containedIn: function containedIn(key, values) {
            this._addCondition(key, "$in", values);
            return this;
          },

          /**
           * Add a constraint to the query that requires a particular key's value to
           * not be contained in the provided list of values.
           * @param {String} key The key to check.
           * @param {Array} values The values that will not match.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          notContainedIn: function notContainedIn(key, values) {
            this._addCondition(key, "$nin", values);
            return this;
          },

          /**
           * Add a constraint to the query that requires a particular key's value to
           * contain each one of the provided list of values.
           * @param {String} key The key to check.  This key's value must be an array.
           * @param {Array} values The values that will match.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          containsAll: function containsAll(key, values) {
            this._addCondition(key, "$all", values);
            return this;
          },

          /**
           * Add a constraint for finding objects that contain the given key.
           * @param {String} key The key that should exist.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          exists: function exists(key) {
            this._addCondition(key, "$exists", true);
            return this;
          },

          /**
           * Add a constraint for finding objects that do not contain a given key.
           * @param {String} key The key that should not exist
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          doesNotExist: function doesNotExist(key) {
            this._addCondition(key, "$exists", false);
            return this;
          },

          /**
           * Add a regular expression constraint for finding string values that match
           * the provided regular expression.
           * This may be slow for large datasets.
           * @param {String} key The key that the string to match is stored in.
           * @param {RegExp} regex The regular expression pattern to match.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          matches: function matches(key, regex, modifiers) {
            this._addCondition(key, "$regex", regex);
            if (!modifiers) {
              modifiers = "";
            }
            // Javascript regex options support mig as inline options but store them
            // as properties of the object. We support mi & should migrate them to
            // modifiers
            if (regex.ignoreCase) {
              modifiers += 'i';
            }
            if (regex.multiline) {
              modifiers += 'm';
            }

            if (modifiers && modifiers.length) {
              this._addCondition(key, "$options", modifiers);
            }
            return this;
          },

          /**
           * Add a constraint that requires that a key's value matches a AV.Query
           * constraint.
           * @param {String} key The key that the contains the object to match the
           *                     query.
           * @param {AV.Query} query The query that should match.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          matchesQuery: function matchesQuery(key, query) {
            var queryJSON = query.toJSON();
            queryJSON.className = query.className;
            this._addCondition(key, "$inQuery", queryJSON);
            return this;
          },

          /**
            * Add a constraint that requires that a key's value not matches a
            * AV.Query constraint.
            * @param {String} key The key that the contains the object to match the
            *                     query.
            * @param {AV.Query} query The query that should not match.
            * @return {AV.Query} Returns the query, so you can chain this call.
            */
          doesNotMatchQuery: function doesNotMatchQuery(key, query) {
            var queryJSON = query.toJSON();
            queryJSON.className = query.className;
            this._addCondition(key, "$notInQuery", queryJSON);
            return this;
          },

          /**
           * Add a constraint that requires that a key's value matches a value in
           * an object returned by a different AV.Query.
           * @param {String} key The key that contains the value that is being
           *                     matched.
           * @param {String} queryKey The key in the objects returned by the query to
           *                          match against.
           * @param {AV.Query} query The query to run.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          matchesKeyInQuery: function matchesKeyInQuery(key, queryKey, query) {
            var queryJSON = query.toJSON();
            queryJSON.className = query.className;
            this._addCondition(key, "$select", { key: queryKey, query: queryJSON });
            return this;
          },

          /**
           * Add a constraint that requires that a key's value not match a value in
           * an object returned by a different AV.Query.
           * @param {String} key The key that contains the value that is being
           *                     excluded.
           * @param {String} queryKey The key in the objects returned by the query to
           *                          match against.
           * @param {AV.Query} query The query to run.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          doesNotMatchKeyInQuery: function doesNotMatchKeyInQuery(key, queryKey, query) {
            var queryJSON = query.toJSON();
            queryJSON.className = query.className;
            this._addCondition(key, "$dontSelect", { key: queryKey, query: queryJSON });
            return this;
          },

          /**
           * Add constraint that at least one of the passed in queries matches.
           * @param {Array} queries
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          _orQuery: function _orQuery(queries) {
            var queryJSON = _.map(queries, function (q) {
              return q.toJSON().where;
            });

            this._where.$or = queryJSON;
            return this;
          },

          /**
           * Add constraint that both of the passed in queries matches.
           * @param {Array} queries
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          _andQuery: function _andQuery(queries) {
            var queryJSON = _.map(queries, function (q) {
              return q.toJSON().where;
            });

            this._where.$and = queryJSON;
            return this;
          },

          /**
           * Converts a string into a regex that matches it.
           * Surrounding with \Q .. \E does this, we just need to escape \E's in
           * the text separately.
           */
          _quote: function _quote(s) {
            return "\\Q" + s.replace("\\E", "\\E\\\\E\\Q") + "\\E";
          },

          /**
           * Add a constraint for finding string values that contain a provided
           * string.  This may be slow for large datasets.
           * @param {String} key The key that the string to match is stored in.
           * @param {String} substring The substring that the value must contain.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          contains: function contains(key, value) {
            this._addCondition(key, "$regex", this._quote(value));
            return this;
          },

          /**
           * Add a constraint for finding string values that start with a provided
           * string.  This query will use the backend index, so it will be fast even
           * for large datasets.
           * @param {String} key The key that the string to match is stored in.
           * @param {String} prefix The substring that the value must start with.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          startsWith: function startsWith(key, value) {
            this._addCondition(key, "$regex", "^" + this._quote(value));
            return this;
          },

          /**
           * Add a constraint for finding string values that end with a provided
           * string.  This will be slow for large datasets.
           * @param {String} key The key that the string to match is stored in.
           * @param {String} suffix The substring that the value must end with.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          endsWith: function endsWith(key, value) {
            this._addCondition(key, "$regex", this._quote(value) + "$");
            return this;
          },

          /**
           * Sorts the results in ascending order by the given key.
           *
           * @param {String} key The key to order by.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          ascending: function ascending(key) {
            this._order = key;
            return this;
          },

          /**
           * Also sorts the results in ascending order by the given key. The previous sort keys have
           * precedence over this key.
           *
           * @param {String} key The key to order by
           * @return {AV.Query} Returns the query so you can chain this call.
           */
          addAscending: function addAscending(key) {
            if (this._order) this._order += ',' + key;else this._order = key;
            return this;
          },

          /**
           * Sorts the results in descending order by the given key.
           *
           * @param {String} key The key to order by.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          descending: function descending(key) {
            this._order = "-" + key;
            return this;
          },

          /**
          * Also sorts the results in descending order by the given key. The previous sort keys have
          * precedence over this key.
          *
          * @param {String} key The key to order by
          * @return {AV.Query} Returns the query so you can chain this call.
          */
          addDescending: function addDescending(key) {
            if (this._order) this._order += ',-' + key;else this._order = '-' + key;
            return this;
          },

          /**
           * Add a proximity based constraint for finding objects with key point
           * values near the point given.
           * @param {String} key The key that the AV.GeoPoint is stored in.
           * @param {AV.GeoPoint} point The reference AV.GeoPoint that is used.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          near: function near(key, point) {
            if (!(point instanceof AV.GeoPoint)) {
              // Try to cast it to a GeoPoint, so that near("loc", [20,30]) works.
              point = new AV.GeoPoint(point);
            }
            this._addCondition(key, "$nearSphere", point);
            return this;
          },

          /**
           * Add a proximity based constraint for finding objects with key point
           * values near the point given and within the maximum distance given.
           * @param {String} key The key that the AV.GeoPoint is stored in.
           * @param {AV.GeoPoint} point The reference AV.GeoPoint that is used.
           * @param maxDistance Maximum distance (in radians) of results to return.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          withinRadians: function withinRadians(key, point, distance) {
            this.near(key, point);
            this._addCondition(key, "$maxDistance", distance);
            return this;
          },

          /**
           * Add a proximity based constraint for finding objects with key point
           * values near the point given and within the maximum distance given.
           * Radius of earth used is 3958.8 miles.
           * @param {String} key The key that the AV.GeoPoint is stored in.
           * @param {AV.GeoPoint} point The reference AV.GeoPoint that is used.
           * @param {Number} maxDistance Maximum distance (in miles) of results to
           *     return.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          withinMiles: function withinMiles(key, point, distance) {
            return this.withinRadians(key, point, distance / 3958.8);
          },

          /**
           * Add a proximity based constraint for finding objects with key point
           * values near the point given and within the maximum distance given.
           * Radius of earth used is 6371.0 kilometers.
           * @param {String} key The key that the AV.GeoPoint is stored in.
           * @param {AV.GeoPoint} point The reference AV.GeoPoint that is used.
           * @param {Number} maxDistance Maximum distance (in kilometers) of results
           *     to return.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          withinKilometers: function withinKilometers(key, point, distance) {
            return this.withinRadians(key, point, distance / 6371.0);
          },

          /**
           * Add a constraint to the query that requires a particular key's
           * coordinates be contained within a given rectangular geographic bounding
           * box.
           * @param {String} key The key to be constrained.
           * @param {AV.GeoPoint} southwest
           *     The lower-left inclusive corner of the box.
           * @param {AV.GeoPoint} northeast
           *     The upper-right inclusive corner of the box.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          withinGeoBox: function withinGeoBox(key, southwest, northeast) {
            if (!(southwest instanceof AV.GeoPoint)) {
              southwest = new AV.GeoPoint(southwest);
            }
            if (!(northeast instanceof AV.GeoPoint)) {
              northeast = new AV.GeoPoint(northeast);
            }
            this._addCondition(key, '$within', { '$box': [southwest, northeast] });
            return this;
          },

          /**
           * Include nested AV.Objects for the provided key.  You can use dot
           * notation to specify which fields in the included object are also fetch.
           * @param {String} key The name of the key to include.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          include: function include() {
            var self = this;
            AV._arrayEach(arguments, function (key) {
              if (_.isArray(key)) {
                self._include = self._include.concat(key);
              } else {
                self._include.push(key);
              }
            });
            return this;
          },

          /**
           * Restrict the fields of the returned AV.Objects to include only the
           * provided keys.  If this is called multiple times, then all of the keys
           * specified in each of the calls will be included.
           * @param {Array} keys The names of the keys to include.
           * @return {AV.Query} Returns the query, so you can chain this call.
           */
          select: function select() {
            var self = this;
            this._select = this._select || [];
            AV._arrayEach(arguments, function (key) {
              if (_.isArray(key)) {
                self._select = self._select.concat(key);
              } else {
                self._select.push(key);
              }
            });
            return this;
          },

          /**
           * Iterates over each result of a query, calling a callback for each one. If
           * the callback returns a promise, the iteration will not continue until
           * that promise has been fulfilled. If the callback returns a rejected
           * promise, then iteration will stop with that error. The items are
           * processed in an unspecified order. The query may not have any sort order,
           * and may not use limit or skip.
           * @param callback {Function} Callback that will be called with each result
           *     of the query.
           * @param options {Object} An optional Backbone-like options object with
           *     success and error callbacks that will be invoked once the iteration
           *     has finished.
           * @return {AV.Promise} A promise that will be fulfilled once the
           *     iteration has completed.
           */
          each: function each(callback, options) {
            options = options || {};

            if (this._order || this._skip || this._limit >= 0) {
              var error = "Cannot iterate on a query with sort, skip, or limit.";
              return AV.Promise.error(error)._thenRunCallbacks(options);
            }

            var promise = new AV.Promise();

            var query = new AV.Query(this.objectClass);
            // We can override the batch size from the options.
            // This is undocumented, but useful for testing.
            query._limit = options.batchSize || 100;
            query._where = _.clone(this._where);
            query._include = _.clone(this._include);

            query.ascending('objectId');

            var finished = false;
            return AV.Promise._continueWhile(function () {
              return !finished;
            }, function () {
              return query.find().then(function (results) {
                var callbacksDone = AV.Promise.as();
                _.each(results, function (result) {
                  callbacksDone = callbacksDone.then(function () {
                    return callback(result);
                  });
                });

                return callbacksDone.then(function () {
                  if (results.length >= query._limit) {
                    query.greaterThan("objectId", results[results.length - 1].id);
                  } else {
                    finished = true;
                  }
                });
              });
            })._thenRunCallbacks(options);
          }
        };

        AV.FriendShipQuery = AV.Query._extend({
          _objectClass: AV.User,
          _newObject: function _newObject() {
            return new AV.User();
          },
          _processResult: function _processResult(json) {
            if (json && json[this._friendshipTag]) {
              var user = json[this._friendshipTag];
              if (user.__type === 'Pointer' && user.className === '_User') {
                delete user.__type;
                delete user.className;
              }
              return user;
            } else {
              return null;
            }
          }
        });
      };
    }, { "./error": 25, "./request": 38, "underscore": 18 }], 37: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      'use strict';

      var _ = require('underscore');

      module.exports = function (AV) {
        /**
         * Creates a new Relation for the given parent object and key. This
         * constructor should rarely be used directly, but rather created by
         * AV.Object.relation.
         * @param {AV.Object} parent The parent of this relation.
         * @param {String} key The key for this relation on the parent.
         * @see AV.Object#relation
         * @class
         *
         * <p>
         * A class that is used to access all of the children of a many-to-many
         * relationship.  Each instance of AV.Relation is associated with a
         * particular parent object and key.
         * </p>
         */
        AV.Relation = function (parent, key) {
          if (!_.isString(key)) {
            throw new TypeError('key must be a string');
          }
          this.parent = parent;
          this.key = key;
          this.targetClassName = null;
        };

        /**
         * Creates a query that can be used to query the parent objects in this relation.
         * @param {String} parentClass The parent class or name.
         * @param {String} relationKey The relation field key in parent.
         * @param {AV.Object} child The child object.
         * @return {AV.Query}
         */
        AV.Relation.reverseQuery = function (parentClass, relationKey, child) {
          var query = new AV.Query(parentClass);
          query.equalTo(relationKey, child._toPointer());
          return query;
        };

        AV.Relation.prototype = {
          /**
           * Makes sure that this relation has the right parent and key.
           */
          _ensureParentAndKey: function _ensureParentAndKey(parent, key) {
            this.parent = this.parent || parent;
            this.key = this.key || key;
            if (this.parent !== parent) {
              throw "Internal Error. Relation retrieved from two different Objects.";
            }
            if (this.key !== key) {
              throw "Internal Error. Relation retrieved from two different keys.";
            }
          },

          /**
           * Adds a AV.Object or an array of AV.Objects to the relation.
           * @param {} objects The item or items to add.
           */
          add: function add(objects) {
            if (!_.isArray(objects)) {
              objects = [objects];
            }

            var change = new AV.Op.Relation(objects, []);
            this.parent.set(this.key, change);
            this.targetClassName = change._targetClassName;
          },

          /**
           * Removes a AV.Object or an array of AV.Objects from this relation.
           * @param {} objects The item or items to remove.
           */
          remove: function remove(objects) {
            if (!_.isArray(objects)) {
              objects = [objects];
            }

            var change = new AV.Op.Relation([], objects);
            this.parent.set(this.key, change);
            this.targetClassName = change._targetClassName;
          },

          /**
           * Returns a JSON version of the object suitable for saving to disk.
           * @return {Object}
           */
          toJSON: function toJSON() {
            return { "__type": "Relation", "className": this.targetClassName };
          },

          /**
           * Returns a AV.Query that is limited to objects in this
           * relation.
           * @return {AV.Query}
           */
          query: function query() {
            var targetClass;
            var query;
            if (!this.targetClassName) {
              targetClass = AV.Object._getSubclass(this.parent.className);
              query = new AV.Query(targetClass);
              query._extraOptions.redirectClassNameForKey = this.key;
            } else {
              targetClass = AV.Object._getSubclass(this.targetClassName);
              query = new AV.Query(targetClass);
            }
            query._addCondition("$relatedTo", "object", this.parent._toPointer());
            query._addCondition("$relatedTo", "key", this.key);

            return query;
          }
        };
      };
    }, { "underscore": 18 }], 38: [function (require, module, exports) {
      (function (process) {
        /**
         * 每位工程师都有保持代码优雅的义务
         * Each engineer has a duty to keep the code elegant
        **/

        var request = require('superagent');
        var debug = require('debug')('leancloud:request');
        var md5 = require('md5');
        var AVPromise = require('./promise');
        var Cache = require('./cache');
        var AVError = require('./error');
        var AV = require('./av');
        var _ = require('underscore');

        var getServerURLPromise = void 0;

        // 服务器请求的节点 host
        var API_HOST = {
          cn: 'https://api.leancloud.cn',
          us: 'https://us-api.leancloud.cn'
        };

        // 计算 X-LC-Sign 的签名方法
        var sign = function sign(key, isMasterKey) {
          var now = new Date().getTime();
          var signature = md5(now + key);
          if (isMasterKey) {
            return signature + "," + now + ",master";
          }
          return signature + "," + now;
        };

        var checkRouter = function checkRouter(router) {
          var routerList = ['batch', 'classes', 'files', 'date', 'functions', 'call', 'login', 'push', 'search/select', 'requestPasswordReset', 'requestEmailVerify', 'requestPasswordResetBySmsCode', 'resetPasswordBySmsCode', 'requestMobilePhoneVerify', 'requestLoginSmsCode', 'verifyMobilePhone', 'requestSmsCode', 'verifySmsCode', 'users', 'usersByMobilePhone', 'cloudQuery', 'qiniu', 'fileTokens', 'statuses', 'bigquery', 'search/select', 'subscribe/statuses/count', 'subscribe/statuses', 'installations'];

          if (routerList.indexOf(router) === -1 && !/users\/[^\/]+\/updatePassword/.test(router) && !/users\/[^\/]+\/friendship\/[^\/]+/.test(router)) {
            throw new Error("Bad router: " + router + ".");
          }
        };

        var requestsCount = 0;

        var ajax = function ajax(method, resourceUrl, data) {
          var headers = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
          var onprogress = arguments[4];

          var count = requestsCount++;

          debug("request(" + count + ")", method, resourceUrl, data, headers);

          var promise = new AVPromise();
          var req = request(method, resourceUrl).set(headers).send(data).end(function (err, res) {
            if (res) {
              debug("response(" + count + ")", res.status, res.body && res.text, res.header);
            }
            if (err) {
              if (res) {
                err.statusCode = res.status;
                err.responseText = res.text;
                err.response = res.body;
              }
              return promise.reject(err);
            }
            return promise.resolve(res.body, res.status, res);
          });
          if (onprogress) {
            req.on('progress', onprogress);
          }
          return promise;
        };

        var setHeaders = function setHeaders(sessionToken, signKey) {
          var headers = {
            'X-LC-Id': AV.applicationId,
            'Content-Type': 'application/json;charset=UTF-8'
          };
          if (AV.masterKey && AV._useMasterKey) {
            if (signKey) {
              headers['X-LC-Sign'] = sign(AV.masterKey, true);
            } else {
              headers['X-LC-Key'] = AV.masterKey + ",master";
            }
          } else {
            if (signKey) {
              headers['X-LC-Sign'] = sign(AV.applicationKey);
            } else {
              headers['X-LC-Key'] = AV.applicationKey;
            }
          }
          if (AV._config.applicationProduction !== null) {
            headers['X-LC-Prod'] = String(AV._config.applicationProduction);
          }
          if (!AV._config.isNode) {
            headers['X-LC-UA'] = "AV/" + AV.version;
          } else {
            // LeanEngine need use AV._config.userAgent
            headers['User-Agent'] = AV._config.userAgent || "AV/" + AV.version + "; Node.js/" + process.version;
          }

          var promise = new AVPromise();

          // Pass the session token
          if (sessionToken) {
            headers['X-LC-Session'] = sessionToken;
            promise.resolve(headers);
          } else if (!AV._config.disableCurrentUser) {
            AV.User.currentAsync().then(function (currentUser) {
              if (currentUser && currentUser._sessionToken) {
                headers['X-LC-Session'] = currentUser._sessionToken;
              }
              promise.resolve(headers);
            });
          } else {
            promise.resolve(headers);
          }

          return promise;
        };

        var createApiUrl = function createApiUrl(route, className, objectId, method, dataObject) {
          // TODO: 兼容 AV.serverURL 旧方式设置 API Host，后续去掉
          if (AV.serverURL) {
            AV._config.APIServerURL = AV.serverURL;
            console.warn('Please use AV._config.APIServerURL to replace AV.serverURL, and it is an internal interface.');
          }

          var apiURL = AV._config.APIServerURL || API_HOST.cn;

          if (apiURL.charAt(apiURL.length - 1) !== '/') {
            apiURL += '/';
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
              apiURL += "&where=" + encodeURIComponent(JSON.stringify(dataObject._where));
              delete dataObject._where;
            }
          }

          if (method.toLowerCase() === 'get') {
            if (apiURL.indexOf('?') === -1) {
              apiURL += '?';
            }
            for (var k in dataObject) {
              if (_typeof(dataObject[k]) === 'object') {
                dataObject[k] = JSON.stringify(dataObject[k]);
              }
              apiURL += "&" + k + "=" + encodeURIComponent(dataObject[k]);
            }
          }

          return apiURL;
        };

        var cacheServerURL = function cacheServerURL(serverURL, ttl) {
          if (typeof ttl !== 'number') {
            ttl = 3600;
          }
          return Cache.setAsync('APIServerURL', serverURL, ttl * 1000);
        };

        // handle AV._request Error
        var handleError = function handleError(error) {
          return new AVPromise(function (resolve, reject) {
            /**
              When API request need to redirect to the right location,
              can't use browser redirect by http status 307, as the reason of CORS,
              so API server response http status 410 and the param "location" for this case.
            */
            if (error.statusCode === 410) {
              cacheServerURL(error.response.api_server, error.response.ttl).then(function () {
                resolve(error.response.location);
              }).catch(reject);
            } else {
              var errorJSON = {
                code: error.code || -1,
                error: error.message || error.responseText
              };
              if (error.response && error.response.code) {
                errorJSON = error.response;
              } else if (error.responseText) {
                try {
                  errorJSON = JSON.parse(error.responseText);
                } catch (e) {
                  // If we fail to parse the error text, that's okay.
                }
              }

              // Transform the error into an instance of AVError by trying to parse
              // the error string as JSON.
              reject(new AVError(errorJSON.code, errorJSON.error));
            }
          });
        };

        var setServerUrl = function setServerUrl(serverURL) {
          AV._config.APIServerURL = "https://" + serverURL;

          // 根据新 URL 重新设置区域
          var newRegion = _.findKey(API_HOST, function (item) {
            return item === AV._config.APIServerURL;
          });
          if (newRegion) {
            AV._config.region = newRegion;
          }
        };

        var refreshServerUrlByRouter = function refreshServerUrlByRouter() {
          var url = "https://app-router.leancloud.cn/1/route?appId=" + AV.applicationId;
          return ajax('get', url).then(function (servers) {
            if (servers.api_server) {
              setServerUrl(servers.api_server);
              return cacheServerURL(servers.api_server, servers.ttl);
            }
          }, function (error) {
            // bypass all non-4XX errors
            if (error.statusCode >= 400 && error.statusCode < 500) {
              throw error;
            }
          });
        };

        var setServerUrlByRegion = function setServerUrlByRegion() {
          var region = arguments.length <= 0 || arguments[0] === undefined ? 'cn' : arguments[0];

          getServerURLPromise = new AVPromise();
          var promise = getServerURLPromise;
          // 如果用户在 init 之前设置了 APIServerURL，则跳过请求 router
          if (AV._config.APIServerURL) {
            promise.resolve();
            return;
          }
          // if not china server region, do not use router
          if (region === 'cn') {
            Cache.getAsync('APIServerURL').then(function (serverURL) {
              if (serverURL) {
                setServerUrl(serverURL);
              } else {
                return refreshServerUrlByRouter();
              }
            }).then(function () {
              promise.resolve();
            }).catch(function (error) {
              promise.reject(error);
            });
          } else {
            AV._config.region = region;
            AV._config.APIServerURL = API_HOST[region];
            promise.resolve();
          }
        };

        /**
         * route is classes, users, login, etc.
         * objectId is null if there is no associated objectId.
         * method is the http method for the REST API.
         * dataObject is the payload as an object, or null if there is none.
         * @ignore
         */
        var AVRequest = function AVRequest(route, className, objectId, method) {
          var dataObject = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];
          var sessionToken = arguments[5];

          if (!AV.applicationId) {
            throw new Error('You must specify your applicationId using AV.init()');
          }

          if (!AV.applicationKey && !AV.masterKey) {
            throw new Error('You must specify a AppKey using AV.init()');
          }

          checkRouter(route);

          if (!getServerURLPromise) {
            return AVPromise.error(new Error('Not initialized'));
          }
          return getServerURLPromise.then(function () {
            var apiURL = createApiUrl(route, className, objectId, method, dataObject);
            return setHeaders(sessionToken, route !== 'bigquery').then(function (headers) {
              return ajax(method, apiURL, dataObject, headers).then(null, function (res) {
                return handleError(res).then(function (location) {
                  return ajax(method, location, dataObject, headers);
                });
              });
            });
          });
        };

        module.exports = {
          ajax: ajax,
          request: AVRequest,
          setServerUrlByRegion: setServerUrlByRegion
        };
      }).call(this, require('_process'));
    }, { "./av": 20, "./cache": 23, "./error": 25, "./promise": 34, "_process": 11, "debug": 6, "md5": 10, "superagent": 12, "underscore": 18 }], 39: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      var _ = require('underscore');
      var AVError = require('./error');

      module.exports = function (AV) {
        /**
         * Represents a Role on the AV server. Roles represent groupings of
         * Users for the purposes of granting permissions (e.g. specifying an ACL
         * for an Object). Roles are specified by their sets of child users and
         * child roles, all of which are granted any permissions that the parent
         * role has.
         *
         * <p>Roles must have a name (which cannot be changed after creation of the
         * role), and must specify an ACL.</p>
         * @class
         * A AV.Role is a local representation of a role persisted to the AV
         * cloud.
         */
        AV.Role = AV.Object.extend("_Role", /** @lends AV.Role.prototype */{
          // Instance Methods

          /**
           * Constructs a new AVRole with the given name and ACL.
           *
           * @param {String} name The name of the Role to create.
           * @param {AV.ACL} [acl] The ACL for this role. if absent, the default ACL
           *    `{'*': { read: true }}` will be used.
           */
          constructor: function constructor(name, acl) {
            if (_.isString(name)) {
              AV.Object.prototype.constructor.call(this, null, null);
              this.setName(name);
            } else {
              AV.Object.prototype.constructor.call(this, name, acl);
            }
            if (acl === undefined) {
              var defaultAcl = new AV.ACL();
              defaultAcl.setPublicReadAccess(true);
              if (!this.getACL()) {
                this.setACL(defaultAcl);
              }
            } else if (!(acl instanceof AV.ACL)) {
              throw new TypeError('acl must be an instance of AV.ACL');
            } else {
              this.setACL(acl);
            }
          },

          /**
           * Gets the name of the role.  You can alternatively call role.get("name")
           *
           * @return {String} the name of the role.
           */
          getName: function getName() {
            return this.get("name");
          },

          /**
           * Sets the name for a role. This value must be set before the role has
           * been saved to the server, and cannot be set once the role has been
           * saved.
           *
           * <p>
           *   A role's name can only contain alphanumeric characters, _, -, and
           *   spaces.
           * </p>
           *
           * <p>This is equivalent to calling role.set("name", name)</p>
           *
           * @param {String} name The name of the role.
           * @param {Object} options Standard options object with success and error
           *     callbacks.
           */
          setName: function setName(name, options) {
            return this.set("name", name, options);
          },

          /**
           * Gets the AV.Relation for the AV.Users that are direct
           * children of this role. These users are granted any privileges that this
           * role has been granted (e.g. read or write access through ACLs). You can
           * add or remove users from the role through this relation.
           *
           * <p>This is equivalent to calling role.relation("users")</p>
           *
           * @return {AV.Relation} the relation for the users belonging to this
           *     role.
           */
          getUsers: function getUsers() {
            return this.relation("users");
          },

          /**
           * Gets the AV.Relation for the AV.Roles that are direct
           * children of this role. These roles' users are granted any privileges that
           * this role has been granted (e.g. read or write access through ACLs). You
           * can add or remove child roles from this role through this relation.
           *
           * <p>This is equivalent to calling role.relation("roles")</p>
           *
           * @return {AV.Relation} the relation for the roles belonging to this
           *     role.
           */
          getRoles: function getRoles() {
            return this.relation("roles");
          },

          /**
           * @ignore
           */
          validate: function validate(attrs, options) {
            if ("name" in attrs && attrs.name !== this.getName()) {
              var newName = attrs.name;
              if (this.id && this.id !== attrs.objectId) {
                // Check to see if the objectId being set matches this.id.
                // This happens during a fetch -- the id is set before calling fetch.
                // Let the name be set in this case.
                return new AVError(AVError.OTHER_CAUSE, "A role's name can only be set before it has been saved.");
              }
              if (!_.isString(newName)) {
                return new AVError(AVError.OTHER_CAUSE, "A role's name must be a String.");
              }
              if (!/^[0-9a-zA-Z\-_ ]+$/.test(newName)) {
                return new AVError(AVError.OTHER_CAUSE, "A role's name can only contain alphanumeric characters, _," + " -, and spaces.");
              }
            }
            if (AV.Object.prototype.validate) {
              return AV.Object.prototype.validate.call(this, attrs, options);
            }
            return false;
          }
        });
      };
    }, { "./error": 25, "underscore": 18 }], 40: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      var _ = require('underscore');
      var AVRequest = require('./request').request;

      module.exports = function (AV) {
        /**
         * A builder to generate sort string for app searching.For example:
         * <pre><code>
         *   var builder = new AV.SearchSortBuilder();
         *   builder.ascending('key1').descending('key2','max');
         *   var query = new AV.SearchQuery('Player');
         *   query.sortBy(builder);
         *   query.find().then ...
         * </code></pre>
         * @class
         * @since 0.5.1
         */
        AV.SearchSortBuilder = function () {
          this._sortFields = [];
        };

        AV.SearchSortBuilder.prototype = {
          _addField: function _addField(key, order, mode, missing) {
            var field = {};
            field[key] = {
              order: order || 'asc',
              mode: mode || 'avg',
              missing: '_' + (missing || 'last')
            };
            this._sortFields.push(field);
            return this;
          },

          /**
           * Sorts the results in ascending order by the given key and options.
           *
           * @param {String} key The key to order by.
           * @param {String} mode The sort mode, default is 'avg', you can choose
           *                  'max' or 'min' too.
           * @param {String} missing The missing key behaviour, default is 'last',
           *                  you can choose 'first' too.
           * @return {AV.SearchSortBuilder} Returns the builder, so you can chain this call.
           */
          ascending: function ascending(key, mode, missing) {
            return this._addField(key, 'asc', mode, missing);
          },

          /**
           * Sorts the results in descending order by the given key and options.
           *
           * @param {String} key The key to order by.
           * @param {String} mode The sort mode, default is 'avg', you can choose
           *                  'max' or 'min' too.
           * @param {String} missing The missing key behaviour, default is 'last',
           *                  you can choose 'first' too.
           * @return {AV.SearchSortBuilder} Returns the builder, so you can chain this call.
           */
          descending: function descending(key, mode, missing) {
            return this._addField(key, 'desc', mode, missing);
          },

          /**
           * Add a proximity based constraint for finding objects with key point
           * values near the point given.
           * @param {String} key The key that the AV.GeoPoint is stored in.
           * @param {AV.GeoPoint} point The reference AV.GeoPoint that is used.
           * @param {Object} options The other options such as mode,order, unit etc.
           * @return {AV.SearchSortBuilder} Returns the builder, so you can chain this call.
           */
          whereNear: function whereNear(key, point, options) {
            options = options || {};
            var field = {};
            var geo = {
              lat: point.latitude,
              lon: point.longitude
            };
            var m = {
              order: options.order || 'asc',
              mode: options.mode || 'avg',
              unit: options.unit || 'km'
            };
            m[key] = geo;
            field['_geo_distance'] = m;

            this._sortFields.push(field);
            return this;
          },

          /**
           * Build a sort string by configuration.
           * @return {String} the sort string.
           */
          build: function build() {
            return JSON.stringify(AV._encode(this._sortFields));
          }
        };

        /**
         * App searching query.Use just like AV.Query:
         * <pre><code>
         *   var query = new AV.SearchQuery('Player');
         *   query.queryString('*');
         *   query.find().then(function(results) {
         *     console.log('Found %d objects', query.hits());
         *     //Process results
         *   });
         *
         * </code></pre>
         * Visite <a href='https://leancloud.cn/docs/app_search_guide.html'>App Searching Guide</a>
         * for more details.
         * @class
         * @since 0.5.1
         *
         */
        AV.SearchQuery = AV.Query._extend( /** @lends AV.SearchQuery.prototype */{
          _sid: null,
          _hits: 0,
          _queryString: null,
          _highlights: null,
          _sortBuilder: null,
          _createRequest: function _createRequest(params, options) {
            return AVRequest('search/select', null, null, 'GET', params || this.toJSON(), options && options.sessionToken);
          },

          /**
           * Sets the sid of app searching query.Default is null.
           * @param {String} sid  Scroll id for searching.
           * @return {AV.SearchQuery} Returns the query, so you can chain this call.
           */
          sid: function sid(_sid) {
            this._sid = _sid;
            return this;
          },

          /**
           * Sets the query string of app searching.
           * @param {String} q  The query string.
           * @return {AV.SearchQuery} Returns the query, so you can chain this call.
           */
          queryString: function queryString(q) {
            this._queryString = q;
            return this;
          },

          /**
           * Sets the highlight fields. Such as
           * <pre><code>
           *   query.highlights('title');
           *   //or pass an array.
           *   query.highlights(['title', 'content'])
           * </code></pre>
           * @param {Array} highlights a list of fields.
           * @return {AV.SearchQuery} Returns the query, so you can chain this call.
           */
          highlights: function highlights(_highlights) {
            var objects;
            if (_highlights && _.isString(_highlights)) {
              objects = arguments;
            } else {
              objects = _highlights;
            }
            this._highlights = objects;
            return this;
          },

          /**
           * Sets the sort builder for this query.
           * @see AV.SearchSortBuilder
           * @param { AV.SearchSortBuilder} builder The sort builder.
           * @return {AV.SearchQuery} Returns the query, so you can chain this call.
           *
           */
          sortBy: function sortBy(builder) {
            this._sortBuilder = builder;
            return this;
          },

          /**
           * Returns the number of objects that match this query.
           * @return {Number}
           */
          hits: function hits() {
            if (!this._hits) {
              this._hits = 0;
            }
            return this._hits;
          },

          _processResult: function _processResult(json) {
            delete json['className'];
            delete json['_app_url'];
            delete json['_deeplink'];
            return json;
          },

          /**
           * Returns true when there are more documents can be retrieved by this
           * query instance, you can call find function to get more results.
           * @see AV.SearchQuery#find
           * @return {Boolean}
           */
          hasMore: function hasMore() {
            return !this._hitEnd;
          },

          /**
           * Reset current query instance state(such as sid, hits etc) except params
           * for a new searching. After resetting, hasMore() will return true.
           */
          reset: function reset() {
            this._hitEnd = false;
            this._sid = null;
            this._hits = 0;
          },

          /**
           * Retrieves a list of AVObjects that satisfy this query.
           * Either options.success or options.error is called when the find
           * completes.
           *
           * @see AV.Query#find
           * @param {Object} options A Backbone-style options object.
           * @return {AV.Promise} A promise that is resolved with the results when
           * the query completes.
           */
          find: function find(options) {
            var self = this;

            var request = this._createRequest();

            return request.then(function (response) {
              //update sid for next querying.
              if (response.sid) {
                self._oldSid = self._sid;
                self._sid = response.sid;
              } else {
                self._sid = null;
                self._hitEnd = true;
              }
              self._hits = response.hits || 0;

              return _.map(response.results, function (json) {
                if (json.className) {
                  response.className = json.className;
                }
                var obj = self._newObject(response);
                obj.appURL = json['_app_url'];
                obj._finishFetch(self._processResult(json), true);
                return obj;
              });
            })._thenRunCallbacks(options);
          },

          toJSON: function toJSON() {
            var params = AV.SearchQuery.__super__.toJSON.call(this);
            delete params.where;
            if (this.className) {
              params.clazz = this.className;
            }
            if (this._sid) {
              params.sid = this._sid;
            }
            if (!this._queryString) {
              throw 'Please set query string.';
            } else {
              params.q = this._queryString;
            }
            if (this._highlights) {
              params.highlights = this._highlights.join(',');
            }
            if (this._sortBuilder && params.order) {
              throw 'sort and order can not be set at same time.';
            }
            if (this._sortBuilder) {
              params.sort = this._sortBuilder.build();
            }

            return params;
          }
        });
      };
    }, { "./request": 38, "underscore": 18 }], 41: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      var _ = require('underscore');
      var AVRequest = require('./request').request;

      module.exports = function (AV) {
        /**
         * Contains functions to deal with Status in AVOS Cloud.
         * @name AV.Status
         * @namespace
         */
        AV.Status = function (imageUrl, message) {
          this.data = {};
          this.inboxType = 'default';
          this.query = null;
          if (imageUrl && (typeof imageUrl === "undefined" ? "undefined" : _typeof(imageUrl)) === 'object') {
            this.data = imageUrl;
          } else {
            if (imageUrl) {
              this.data.image = imageUrl;
            }
            if (message) {
              this.data.message = message;
            }
          }
          return this;
        };

        AV.Status.prototype = {
          /**
           * Gets the value of an attribute in status data.
           * @param {String} attr The string name of an attribute.
           */
          get: function get(attr) {
            return this.data[attr];
          },
          /**
           * Sets a hash of model attributes on the status data.
           * @param {String} key The key to set.
           * @param {} value The value to give it.
           */
          set: function set(key, value) {
            this.data[key] = value;
            return this;
          },
          /**
           * Destroy this status,then it will not be avaiable in other user's inboxes.
           * @param {Object} options An optional Backbone-like options object with
           *     success and error callbacks that will be invoked once the iteration
           *     has finished.
           * @return {AV.Promise} A promise that is fulfilled when the destroy
           *     completes.
           */
          destroy: function destroy(options) {
            if (!this.id) return AV.Promise.error('The status id is not exists.')._thenRunCallbacks(options);
            var request = AVRequest('statuses', null, this.id, 'DELETE', options && options.sessionToken);
            return request._thenRunCallbacks(options);
          },
          /**
            * Cast the AV.Status object to an AV.Object pointer.
            * @return {AV.Object} A AV.Object pointer.
            */
          toObject: function toObject() {
            if (!this.id) return null;
            return AV.Object.createWithoutData('_Status', this.id);
          },
          _getDataJSON: function _getDataJSON() {
            var json = _.clone(this.data);
            return AV._encode(json);
          },
          /**
           * Send  a status by a AV.Query object.
           * <p>For example,send a status to male users:<br/><pre>
           *     var status = new AVStatus('image url', 'a message');
           *     status.query = new AV.Query('_User');
           *     status.query.equalTo('gender', 'male');
           *     status.send().then(function(){
           *              //send status successfully.
           *      }, function(err){
           *             //an error threw.
           *             console.dir(err);
           *      });
           * </pre></p>
           * @since 0.3.0
           * @param {Object} options An optional Backbone-like options object with
           *     success and error callbacks that will be invoked once the iteration
           *     has finished.
           * @return {AV.Promise} A promise that is fulfilled when the send
           *     completes.
           */
          send: function send(options) {
            if (!AV.User.current()) {
              throw 'Please signin an user.';
            }
            if (!this.query) {
              return AV.Status.sendStatusToFollowers(this, options);
            }

            var query = this.query.toJSON();
            query.className = this.query.className;
            var data = {};
            data.query = query;
            this.data = this.data || {};
            var currUser = AV.Object.createWithoutData('_User', AV.User.current().id)._toPointer();
            this.data.source = this.data.source || currUser;
            data.data = this._getDataJSON();
            data.inboxType = this.inboxType || 'default';

            var request = AVRequest('statuses', null, null, 'POST', data, options && options.sessionToken);
            var self = this;
            return request.then(function (response) {
              self.id = response.objectId;
              self.createdAt = AV._parseDate(response.createdAt);
              return self;
            })._thenRunCallbacks(options);
          },

          _finishFetch: function _finishFetch(serverData) {
            this.id = serverData.objectId;
            this.createdAt = AV._parseDate(serverData.createdAt);
            this.updatedAt = AV._parseDate(serverData.updatedAt);
            this.messageId = serverData.messageId;
            delete serverData.messageId;
            delete serverData.objectId;
            delete serverData.createdAt;
            delete serverData.updatedAt;
            this.data = AV._decode(undefined, serverData);
          }
        };

        /**
         * Send  a status to current signined user's followers.For example:
         * <p><pre>
         *     var status = new AVStatus('image url', 'a message');
         *     AV.Status.sendStatusToFollowers(status).then(function(){
         *              //send status successfully.
         *      }, function(err){
         *             //an error threw.
         *             console.dir(err);
         *      });
         * </pre></p>
         * @since 0.3.0
         * @param {AV.Status} status  A status object to be send to followers.
         * @param {Object} options An optional Backbone-like options object with
         *     success and error callbacks that will be invoked once the iteration
         *     has finished.
         * @return {AV.Promise} A promise that is fulfilled when the send
         *     completes.
         */
        AV.Status.sendStatusToFollowers = function (status, options) {
          if (!AV.User.current()) {
            throw 'Please signin an user.';
          }
          var query = {};
          query.className = '_Follower';
          query.keys = 'follower';
          var currUser = AV.Object.createWithoutData('_User', AV.User.current().id)._toPointer();
          query.where = { user: currUser };
          var data = {};
          data.query = query;
          status.data = status.data || {};
          status.data.source = status.data.source || currUser;
          data.data = status._getDataJSON();
          data.inboxType = status.inboxType || 'default';

          var request = AVRequest('statuses', null, null, 'POST', data, options && options.sessionToken);
          return request.then(function (response) {
            status.id = response.objectId;
            status.createdAt = AV._parseDate(response.createdAt);
            return status;
          })._thenRunCallbacks(options);
        };

        /**
         * <p>Send  a status from current signined user to other user's private status inbox.</p>
         * <p>For example,send a private status to user '52e84e47e4b0f8de283b079b':<br/>
         * <pre>
         *    var status = new AVStatus('image url', 'a message');
         *     AV.Status.sendPrivateStatus(status, '52e84e47e4b0f8de283b079b').then(function(){
         *              //send status successfully.
         *      }, function(err){
         *             //an error threw.
         *             console.dir(err);
         *      });
         * </pre></p>
         * @since 0.3.0
         * @param {AV.Status} status  A status object to be send to followers.
         * @param {} target The target user or user's objectId.
         * @param {Object} options An optional Backbone-like options object with
         *     success and error callbacks that will be invoked once the iteration
         *     has finished.
         * @return {AV.Promise} A promise that is fulfilled when the send
         *     completes.
         */
        AV.Status.sendPrivateStatus = function (status, target, options) {
          if (!AV.User.current()) {
            throw 'Please signin an user.';
          }
          if (!target) {
            throw "Invalid target user.";
          }
          var userObjectId = _.isString(target) ? target : target.id;
          if (!userObjectId) {
            throw "Invalid target user.";
          }

          var query = {};
          query.className = '_User';
          var currUser = AV.Object.createWithoutData('_User', AV.User.current().id)._toPointer();
          query.where = { objectId: userObjectId };
          var data = {};
          data.query = query;
          status.data = status.data || {};
          status.data.source = status.data.source || currUser;
          data.data = status._getDataJSON();
          data.inboxType = 'private';
          status.inboxType = 'private';

          var request = AVRequest('statuses', null, null, 'POST', data, options && options.sessionToken);
          return request.then(function (response) {
            status.id = response.objectId;
            status.createdAt = AV._parseDate(response.createdAt);
            return status;
          })._thenRunCallbacks(options);
        };

        /**
         * Count unread statuses in someone's inbox.For example:<br/>
         * <p><pre>
         *  AV.Status.countUnreadStatuses(AV.User.current()).then(function(response){
         *    console.log(response.unread); //unread statuses number.
         *    console.log(response.total);  //total statuses number.
         *  });
         * </pre></p>
         * @since 0.3.0
         * @param {Object} source The status source.
         * @return {AV.Query} The query object for status.
         * @return {AV.Promise} A promise that is fulfilled when the count
         *     completes.
         */
        AV.Status.countUnreadStatuses = function (owner) {
          if (!AV.User.current() && owner == null) {
            throw 'Please signin an user or pass the owner objectId.';
          }
          owner = owner || AV.User.current();
          var options = !_.isString(arguments[1]) ? arguments[1] : arguments[2];
          var inboxType = !_.isString(arguments[1]) ? 'default' : arguments[1];
          var params = {};
          params.inboxType = AV._encode(inboxType);
          params.owner = AV._encode(owner);
          var request = AVRequest('subscribe/statuses/count', null, null, 'GET', params, options && options.sessionToken);
          return request._thenRunCallbacks(options);
        };

        /**
         * Create a status query to find someone's published statuses.For example:<br/>
         * <p><pre>
         *   //Find current user's published statuses.
         *   var query = AV.Status.statusQuery(AV.User.current());
         *   query.find().then(function(statuses){
         *      //process statuses
         *   });
         * </pre></p>
         * @since 0.3.0
         * @param {Object} source The status source.
         * @return {AV.Query} The query object for status.
         */
        AV.Status.statusQuery = function (source) {
          var query = new AV.Query('_Status');
          if (source) {
            query.equalTo('source', source);
          }
          return query;
        };

        /**
         * <p>AV.InboxQuery defines a query that is used to fetch somebody's inbox statuses.</p>
         * @see AV.Status#inboxQuery
         * @class
         */
        AV.InboxQuery = AV.Query._extend( /** @lends AV.InboxQuery.prototype */{
          _objectClass: AV.Status,
          _sinceId: 0,
          _maxId: 0,
          _inboxType: 'default',
          _owner: null,
          _newObject: function _newObject() {
            return new AV.Status();
          },
          _createRequest: function _createRequest(params, options) {
            return AVRequest('subscribe/statuses', null, null, 'GET', params || this.toJSON(), options && options.sessionToken);
          },

          /**
           * Sets the messageId of results to skip before returning any results.
           * This is useful for pagination.
           * Default is zero.
           * @param {Number} n the mesage id.
           * @return {AV.InboxQuery} Returns the query, so you can chain this call.
           */
          sinceId: function sinceId(id) {
            this._sinceId = id;
            return this;
          },
          /**
           * Sets the maximal messageId of results。
           * This is useful for pagination.
           * Default is zero that is no limition.
           * @param {Number} n the mesage id.
           * @return {AV.InboxQuery} Returns the query, so you can chain this call.
           */
          maxId: function maxId(id) {
            this._maxId = id;
            return this;
          },
          /**
           * Sets the owner of the querying inbox.
           * @param {Object} owner The inbox owner.
           * @return {AV.InboxQuery} Returns the query, so you can chain this call.
           */
          owner: function owner(_owner) {
            this._owner = _owner;
            return this;
          },
          /**
           * Sets the querying inbox type.default is 'default'.
           * @param {Object} owner The inbox type.
           * @return {AV.InboxQuery} Returns the query, so you can chain this call.
           */
          inboxType: function inboxType(type) {
            this._inboxType = type;
            return this;
          },
          toJSON: function toJSON() {
            var params = AV.InboxQuery.__super__.toJSON.call(this);
            params.owner = AV._encode(this._owner);
            params.inboxType = AV._encode(this._inboxType);
            params.sinceId = AV._encode(this._sinceId);
            params.maxId = AV._encode(this._maxId);
            return params;
          }
        });

        /**
         * Create a inbox status query to find someone's inbox statuses.For example:<br/>
         * <p><pre>
         *   //Find current user's default inbox statuses.
         *   var query = AV.Status.inboxQuery(AV.User.current());
         *   //find the statuses after the last message id
         *   query.sinceId(lastMessageId);
         *   query.find().then(function(statuses){
         *      //process statuses
         *   });
         * </pre></p>
         * @since 0.3.0
         * @param {Object} owner The inbox's owner
         * @param {String} inboxType The inbox type,'default' by default.
         * @return {AV.InboxQuery} The inbox query object.
         * @see AV.InboxQuery
         */
        AV.Status.inboxQuery = function (owner, inboxType) {
          var query = new AV.InboxQuery(AV.Status);
          if (owner) {
            query._owner = owner;
          }
          if (inboxType) {
            query._inboxType = inboxType;
          }
          return query;
        };
      };
    }, { "./request": 38, "underscore": 18 }], 42: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
       **/

      'use strict';

      var request = require('superagent');
      var debug = require('debug')('cos');
      var Promise = require('../promise');

      module.exports = function upload(uploadInfo, data, file) {
        var saveOptions = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

        file.attributes.url = uploadInfo.url;
        file._bucket = uploadInfo.bucket;
        file.id = uploadInfo.objectId;
        var uploadUrl = uploadInfo.upload_url + "?sign=" + encodeURIComponent(uploadInfo.token);

        var promise = new Promise();

        var req = request('POST', uploadUrl).field('fileContent', data).field('op', 'upload');
        if (saveOptions.onprogress) {
          req.on('progress', saveOptions.onprogress);
        }
        req.end(function (err, res) {
          if (res) {
            debug(res.status, res.body, res.text);
          }
          if (err) {
            if (res) {
              err.statusCode = res.status;
              err.responseText = res.text;
              err.response = res.body;
            }
            return promise.reject(err);
          }
          promise.resolve(file);
        });

        return promise;
      };
    }, { "../promise": 34, "debug": 6, "superagent": 12 }], 43: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      'use strict';

      var request = require('superagent');
      var Promise = require('../promise');
      var debug = require('debug')('qiniu');

      module.exports = function upload(uploadInfo, data, file) {
        var saveOptions = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

        file.attributes.url = uploadInfo.url;
        file._bucket = uploadInfo.bucket;
        file.id = uploadInfo.objectId;
        //Get the uptoken to upload files to qiniu.
        var uptoken = uploadInfo.token;

        var promise = new Promise();

        var req = request('POST', 'https://up.qbox.me').field('file', data).field('name', file.attributes.name).field('key', file._qiniu_key).field('token', uptoken);
        if (saveOptions.onprogress) {
          req.on('progress', saveOptions.onprogress);
        }
        req.end(function (err, res) {
          if (res) {
            debug(res.status, res.body, res.text);
          }
          if (err) {
            if (res) {
              err.statusCode = res.status;
              err.responseText = res.text;
              err.response = res.body;
            }
            return promise.reject(err);
          }
          promise.resolve(file);
        });

        return promise;
      };
    }, { "../promise": 34, "debug": 6, "superagent": 12 }], 44: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
       **/

      var request = require('superagent');
      var AVPromise = require('../promise');

      module.exports = function upload(uploadInfo, data, file) {
        var saveOptions = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

        file.attributes.url = uploadInfo.url;
        file._bucket = uploadInfo.bucket;
        file.id = uploadInfo.objectId;
        var promise = new AVPromise();
        // 海外节点，针对 S3 才会返回 upload_url
        var req = request('PUT', uploadInfo.upload_url).set('Content-Type', file.attributes.metaData.mime_type).send(data);
        if (saveOptions.onprogress) {
          req.on('progress', saveOptions.onprogress);
        }
        req.end(function (err, res) {
          if (err) {
            if (res) {
              err.statusCode = res.status;
              err.responseText = res.text;
              err.response = res.body;
            }
            return promise.reject(err);
          }
          promise.resolve(file);
        });

        return promise;
      };
    }, { "../promise": 34, "superagent": 12 }], 45: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      var _ = require('underscore');
      var AVError = require('./error');
      var AVRequest = require('./request').request;

      module.exports = function (AV) {
        /**
         * @class
         *
         * <p>A AV.User object is a local representation of a user persisted to the
         * AV cloud. This class is a subclass of a AV.Object, and retains the
         * same functionality of a AV.Object, but also extends it with various
         * user specific methods, like authentication, signing up, and validation of
         * uniqueness.</p>
         */
        AV.User = AV.Object.extend("_User", /** @lends AV.User.prototype */{
          // Instance Variables
          _isCurrentUser: false,

          // Instance Methods

          /**
           * Internal method to handle special fields in a _User response.
           */
          _mergeMagicFields: function _mergeMagicFields(attrs) {
            if (attrs.sessionToken) {
              this._sessionToken = attrs.sessionToken;
              delete attrs.sessionToken;
            }
            AV.User.__super__._mergeMagicFields.call(this, attrs);
          },

          /**
           * Removes null values from authData (which exist temporarily for
           * unlinking)
           */
          _cleanupAuthData: function _cleanupAuthData() {
            if (!this.isCurrent()) {
              return;
            }
            var authData = this.get('authData');
            if (!authData) {
              return;
            }
            AV._objectEach(this.get('authData'), function (value, key) {
              if (!authData[key]) {
                delete authData[key];
              }
            });
          },

          /**
           * Synchronizes authData for all providers.
           */
          _synchronizeAllAuthData: function _synchronizeAllAuthData() {
            var authData = this.get('authData');
            if (!authData) {
              return;
            }

            var self = this;
            AV._objectEach(this.get('authData'), function (value, key) {
              self._synchronizeAuthData(key);
            });
          },

          /**
           * Synchronizes auth data for a provider (e.g. puts the access token in the
           * right place to be used by the Facebook SDK).
           */
          _synchronizeAuthData: function _synchronizeAuthData(provider) {
            if (!this.isCurrent()) {
              return;
            }
            var authType;
            if (_.isString(provider)) {
              authType = provider;
              provider = AV.User._authProviders[authType];
            } else {
              authType = provider.getAuthType();
            }
            var authData = this.get('authData');
            if (!authData || !provider) {
              return;
            }
            var success = provider.restoreAuthentication(authData[authType]);
            if (!success) {
              this._unlinkFrom(provider);
            }
          },

          _handleSaveResult: function _handleSaveResult(makeCurrent) {
            // Clean up and synchronize the authData object, removing any unset values
            if (makeCurrent && !AV._config.disableCurrentUser) {
              this._isCurrentUser = true;
            }
            this._cleanupAuthData();
            this._synchronizeAllAuthData();
            // Don't keep the password around.
            delete this._serverData.password;
            this._rebuildEstimatedDataForKey("password");
            this._refreshCache();
            if ((makeCurrent || this.isCurrent()) && !AV._config.disableCurrentUser) {
              // Some old version of leanengine-node-sdk will overwrite
              // AV.User._saveCurrentUser which returns no Promise.
              // So we need a Promise wrapper.
              return AV.Promise.as(AV.User._saveCurrentUser(this));
            } else {
              return AV.Promise.as();
            }
          },

          /**
           * Unlike in the Android/iOS SDKs, logInWith is unnecessary, since you can
           * call linkWith on the user (even if it doesn't exist yet on the server).
           */
          _linkWith: function _linkWith(provider, options) {
            var authType;
            if (_.isString(provider)) {
              authType = provider;
              provider = AV.User._authProviders[provider];
            } else {
              authType = provider.getAuthType();
            }
            if (_.has(options, 'authData')) {
              var authData = this.get('authData') || {};
              authData[authType] = options.authData;
              this.set('authData', authData);
              return this.save({ 'authData': authData }, filterOutCallbacks(options)).then(function (model) {
                return model._handleSaveResult(true).then(function () {
                  return model;
                });
              })._thenRunCallbacks(options);
            } else {
              var self = this;
              var promise = new AV.Promise();
              provider.authenticate({
                success: function success(provider, result) {
                  self._linkWith(provider, {
                    authData: result,
                    success: options.success,
                    error: options.error
                  }).then(function () {
                    promise.resolve(self);
                  });
                },
                error: function error(provider, _error2) {
                  if (options.error) {
                    options.error(self, _error2);
                  }
                  promise.reject(_error2);
                }
              });
              return promise;
            }
          },

          /**
           * Unlinks a user from a service.
           */
          _unlinkFrom: function _unlinkFrom(provider, options) {
            var authType;
            if (_.isString(provider)) {
              authType = provider;
              provider = AV.User._authProviders[provider];
            } else {
              authType = provider.getAuthType();
            }
            var newOptions = _.clone(options);
            var self = this;
            newOptions.authData = null;
            newOptions.success = function (model) {
              self._synchronizeAuthData(provider);
              if (options.success) {
                options.success.apply(this, arguments);
              }
            };
            return this._linkWith(provider, newOptions);
          },

          /**
           * Checks whether a user is linked to a service.
           */
          _isLinked: function _isLinked(provider) {
            var authType;
            if (_.isString(provider)) {
              authType = provider;
            } else {
              authType = provider.getAuthType();
            }
            var authData = this.get('authData') || {};
            return !!authData[authType];
          },

          logOut: function logOut() {
            this._logOutWithAll();
            this._isCurrentUser = false;
          },

          /**
           * Deauthenticates all providers.
           */
          _logOutWithAll: function _logOutWithAll() {
            var authData = this.get('authData');
            if (!authData) {
              return;
            }
            var self = this;
            AV._objectEach(this.get('authData'), function (value, key) {
              self._logOutWith(key);
            });
          },

          /**
           * Deauthenticates a single provider (e.g. removing access tokens from the
           * Facebook SDK).
           */
          _logOutWith: function _logOutWith(provider) {
            if (!this.isCurrent()) {
              return;
            }
            if (_.isString(provider)) {
              provider = AV.User._authProviders[provider];
            }
            if (provider && provider.deauthenticate) {
              provider.deauthenticate();
            }
          },

          /**
           * Signs up a new user. You should call this instead of save for
           * new AV.Users. This will create a new AV.User on the server, and
           * also persist the session on disk so that you can access the user using
           * <code>current</code>.
           *
           * <p>A username and password must be set before calling signUp.</p>
           *
           * <p>Calls options.success or options.error on completion.</p>
           *
           * @param {Object} attrs Extra fields to set on the new user, or null.
           * @param {Object} options A Backbone-style options object.
           * @return {AV.Promise} A promise that is fulfilled when the signup
           *     finishes.
           * @see AV.User.signUp
           */
          signUp: function signUp(attrs, options) {
            var error;
            options = options || {};

            var username = attrs && attrs.username || this.get("username");
            if (!username || username === "") {
              error = new AVError(AVError.OTHER_CAUSE, "Cannot sign up user with an empty name.");
              if (options && options.error) {
                options.error(this, error);
              }
              throw error;
            }

            var password = attrs && attrs.password || this.get("password");
            if (!password || password === "") {
              error = new AVError(AVError.OTHER_CAUSE, "Cannot sign up user with an empty password.");
              if (options && options.error) {
                options.error(this, error);
              }
              throw error;
            }

            return this.save(attrs, filterOutCallbacks(options)).then(function (model) {
              return model._handleSaveResult(true).then(function () {
                return model;
              });
            })._thenRunCallbacks(options, this);
          },

          /**
           * Signs up a new user with mobile phone and sms code.
           * You should call this instead of save for
           * new AV.Users. This will create a new AV.User on the server, and
           * also persist the session on disk so that you can access the user using
           * <code>current</code>.
           *
           * <p>A username and password must be set before calling signUp.</p>
           *
           * <p>Calls options.success or options.error on completion.</p>
           *
           * @param {Object} attrs Extra fields to set on the new user, or null.
           * @param {Object} options A Backbone-style options object.
           * @return {AV.Promise} A promise that is fulfilled when the signup
           *     finishes.
           * @see AV.User.signUpOrlogInWithMobilePhone
           * @see AV.Cloud.requestSmsCode
           */
          signUpOrlogInWithMobilePhone: function signUpOrlogInWithMobilePhone(attrs, options) {
            var error;
            options = options || {};

            var mobilePhoneNumber = attrs && attrs.mobilePhoneNumber || this.get("mobilePhoneNumber");
            if (!mobilePhoneNumber || mobilePhoneNumber === "") {
              error = new AVError(AVError.OTHER_CAUSE, "Cannot sign up or login user by mobilePhoneNumber " + "with an empty mobilePhoneNumber.");
              if (options && options.error) {
                options.error(this, error);
              }
              throw error;
            }

            var smsCode = attrs && attrs.smsCode || this.get("smsCode");
            if (!smsCode || smsCode === "") {
              error = new AVError(AVError.OTHER_CAUSE, "Cannot sign up or login user by mobilePhoneNumber  " + "with an empty smsCode.");
              if (options && options.error) {
                options.error(this, error);
              }
              throw error;
            }

            var newOptions = filterOutCallbacks(options);
            newOptions._makeRequest = function (route, className, id, method, json) {
              return AVRequest('usersByMobilePhone', null, null, "POST", json);
            };
            return this.save(attrs, newOptions).then(function (model) {
              delete model.attributes.smsCode;
              delete model._serverData.smsCode;
              return model._handleSaveResult(true).then(function () {
                return model;
              });
            })._thenRunCallbacks(options);
          },

          /**
           * Logs in a AV.User. On success, this saves the session to localStorage,
           * so you can retrieve the currently logged in user using
           * <code>current</code>.
           *
           * <p>A username and password must be set before calling logIn.</p>
           *
           * <p>Calls options.success or options.error on completion.</p>
           *
           * @param {Object} options A Backbone-style options object.
           * @see AV.User.logIn
           * @return {AV.Promise} A promise that is fulfilled with the user when
           *     the login is complete.
           */
          logIn: function logIn(options) {
            var model = this;
            var request = AVRequest('login', null, null, 'POST', this.toJSON());
            return request.then(function (resp, status, xhr) {
              var serverAttrs = model.parse(resp, status, xhr);
              model._finishFetch(serverAttrs);
              return model._handleSaveResult(true).then(function () {
                if (!serverAttrs.smsCode) delete model.attributes['smsCode'];
                return model;
              });
            })._thenRunCallbacks(options, this);
          },
          /**
           * @see AV.Object#save
           */
          save: function save(arg1, arg2, arg3) {
            var i, attrs, current, options, saved;
            if (_.isObject(arg1) || _.isNull(arg1) || _.isUndefined(arg1)) {
              attrs = arg1;
              options = arg2;
            } else {
              attrs = {};
              attrs[arg1] = arg2;
              options = arg3;
            }
            options = options || {};

            return AV.Object.prototype.save.call(this, attrs, filterOutCallbacks(options)).then(function (model) {
              return model._handleSaveResult(false).then(function () {
                return model;
              });
            })._thenRunCallbacks(options);
          },

          /**
           * Follow a user
           * @since 0.3.0
           * @param {} target The target user or user's objectId to follow.
           * @param {Object} options An optional Backbone-like options object with
           *     success and error callbacks that will be invoked once the iteration
           *     has finished.
           */
          follow: function follow(target, options) {
            if (!this.id) {
              throw "Please signin.";
            }
            if (!target) {
              throw "Invalid target user.";
            }
            var userObjectId = _.isString(target) ? target : target.id;
            if (!userObjectId) {
              throw "Invalid target user.";
            }
            var route = 'users/' + this.id + '/friendship/' + userObjectId;
            var request = AVRequest(route, null, null, 'POST', null, options && options.sessionToken);
            return request._thenRunCallbacks(options);
          },

          /**
           * Unfollow a user.
           * @since 0.3.0
           * @param {} target The target user or user's objectId to unfollow.
           * @param options {Object} An optional Backbone-like options object with
           *     success and error callbacks that will be invoked once the iteration
           *     has finished.
           */
          unfollow: function unfollow(target, options) {
            if (!this.id) {
              throw "Please signin.";
            }
            if (!target) {
              throw "Invalid target user.";
            }
            var userObjectId = _.isString(target) ? target : target.id;
            if (!userObjectId) {
              throw "Invalid target user.";
            }
            var route = 'users/' + this.id + '/friendship/' + userObjectId;
            var request = AVRequest(route, null, null, 'DELETE', null, options && options.sessionToken);
            return request._thenRunCallbacks(options);
          },

          /**
           *Create a follower query to query the user's followers.
           * @since 0.3.0
           * @see AV.User#followerQuery
           */
          followerQuery: function followerQuery() {
            return AV.User.followerQuery(this.id);
          },

          /**
           *Create a followee query to query the user's followees.
           * @since 0.3.0
           * @see AV.User#followeeQuery
           */
          followeeQuery: function followeeQuery() {
            return AV.User.followeeQuery(this.id);
          },

          /**
           * @see AV.Object#fetch
           */
          fetch: function fetch() {
            var options = null;
            var fetchOptions = {};
            if (arguments.length === 1) {
              options = arguments[0];
            } else if (arguments.length === 2) {
              fetchOptions = arguments[0];
              options = arguments[1];
            }
            return AV.Object.prototype.fetch.call(this, fetchOptions, {}).then(function (model) {
              return model._handleSaveResult(false).then(function () {
                return model;
              });
            })._thenRunCallbacks(options);
          },

          /**
           * Update user's new password safely based on old password.
           * @param {String} oldPassword, the old password.
           * @param {String} newPassword, the new password.
           * @param {Object} An optional Backbone-like options object with
           *     success and error callbacks that will be invoked once the iteration
           *     has finished.
           */
          updatePassword: function updatePassword(oldPassword, newPassword, options) {
            var route = 'users/' + this.id + '/updatePassword';
            var params = {
              old_password: oldPassword,
              new_password: newPassword
            };
            var request = AVRequest(route, null, null, 'PUT', params, options && options.sessionToken);
            return request._thenRunCallbacks(options, this);
          },

          /**
           * Returns true if <code>current</code> would return this user.
           * @see AV.User#current
           */
          isCurrent: function isCurrent() {
            return this._isCurrentUser;
          },

          /**
           * Returns get("username").
           * @return {String}
           * @see AV.Object#get
           */
          getUsername: function getUsername() {
            return this.get("username");
          },

          /**
           * Returns get("mobilePhoneNumber").
           * @return {String}
           * @see AV.Object#get
           */
          getMobilePhoneNumber: function getMobilePhoneNumber() {
            return this.get("mobilePhoneNumber");
          },

          /**
           * Calls set("mobilePhoneNumber", phoneNumber, options) and returns the result.
           * @param {String} mobilePhoneNumber
           * @param {Object} options A Backbone-style options object.
           * @return {Boolean}
           * @see AV.Object.set
           */
          setMobilePhoneNumber: function setMobilePhoneNumber(phone, options) {
            return this.set("mobilePhoneNumber", phone, options);
          },

          /**
           * Calls set("username", username, options) and returns the result.
           * @param {String} username
           * @param {Object} options A Backbone-style options object.
           * @return {Boolean}
           * @see AV.Object.set
           */
          setUsername: function setUsername(username, options) {
            return this.set("username", username, options);
          },

          /**
           * Calls set("password", password, options) and returns the result.
           * @param {String} password
           * @param {Object} options A Backbone-style options object.
           * @return {Boolean}
           * @see AV.Object.set
           */
          setPassword: function setPassword(password, options) {
            return this.set("password", password, options);
          },

          /**
           * Returns get("email").
           * @return {String}
           * @see AV.Object#get
           */
          getEmail: function getEmail() {
            return this.get("email");
          },

          /**
           * Calls set("email", email, options) and returns the result.
           * @param {String} email
           * @param {Object} options A Backbone-style options object.
           * @return {Boolean}
           * @see AV.Object.set
           */
          setEmail: function setEmail(email, options) {
            return this.set("email", email, options);
          },

          /**
           * Checks whether this user is the current user and has been authenticated.
           * @return (Boolean) whether this user is the current user and is logged in.
           */
          authenticated: function authenticated() {
            return !!this._sessionToken && !AV._config.disableCurrentUser && AV.User.current() && AV.User.current().id === this.id;
          },

          getSessionToken: function getSessionToken() {
            return this._sessionToken;
          },

          /**
           * Get this user's Roles.
           * @param {Object} options A Backbone-style options object.
           * @return {AV.Promise} A promise that is fulfilled with the roles when
           *     the query is complete.
           */
          getRoles: function getRoles(options) {
            return AV.Relation.reverseQuery("_Role", "users", this).find(options);
          }
        }, /** @lends AV.User */{
          // Class Variables

          // The currently logged-in user.
          _currentUser: null,

          // Whether currentUser is known to match the serialized version on disk.
          // This is useful for saving a localstorage check if you try to load
          // _currentUser frequently while there is none stored.
          _currentUserMatchesDisk: false,

          // The localStorage key suffix that the current user is stored under.
          _CURRENT_USER_KEY: "currentUser",

          // The mapping of auth provider names to actual providers
          _authProviders: {},

          // Class Methods

          /**
           * Signs up a new user with a username (or email) and password.
           * This will create a new AV.User on the server, and also persist the
           * session in localStorage so that you can access the user using
           * {@link #current}.
           *
           * <p>Calls options.success or options.error on completion.</p>
           *
           * @param {String} username The username (or email) to sign up with.
           * @param {String} password The password to sign up with.
           * @param {Object} attrs Extra fields to set on the new user.
           * @param {Object} options A Backbone-style options object.
           * @return {AV.Promise} A promise that is fulfilled with the user when
           *     the signup completes.
           * @see AV.User#signUp
           */
          signUp: function signUp(username, password, attrs, options) {
            attrs = attrs || {};
            attrs.username = username;
            attrs.password = password;
            var user = AV.Object._create("_User");
            return user.signUp(attrs, options);
          },

          /**
           * Logs in a user with a username (or email) and password. On success, this
           * saves the session to disk, so you can retrieve the currently logged in
           * user using <code>current</code>.
           *
           * <p>Calls options.success or options.error on completion.</p>
           *
           * @param {String} username The username (or email) to log in with.
           * @param {String} password The password to log in with.
           * @param {Object} options A Backbone-style options object.
           * @return {AV.Promise} A promise that is fulfilled with the user when
           *     the login completes.
           * @see AV.User#logIn
           */
          logIn: function logIn(username, password, options) {
            var user = AV.Object._create("_User");
            user._finishFetch({ username: username, password: password });
            return user.logIn(options);
          },

          /**
           * Logs in a user with a session token. On success, this saves the session
           * to disk, so you can retrieve the currently logged in user using
           * <code>current</code>.
           *
           * <p>Calls options.success or options.error on completion.</p>
           *
           * @param {String} sessionToken The sessionToken to log in with.
           * @param {Object} options A Backbone-style options object.
           * @return {AV.Promise} A promise that is fulfilled with the user when
           *     the login completes.
           */
          become: function become(sessionToken, options) {
            options = options || {};

            var user = AV.Object._create("_User");
            return AVRequest("users", "me", null, "GET", {
              useMasterKey: options.useMasterKey,
              session_token: sessionToken
            }).then(function (resp, status, xhr) {
              var serverAttrs = user.parse(resp, status, xhr);
              user._finishFetch(serverAttrs);
              return user._handleSaveResult(true).then(function () {
                return user;
              });
            })._thenRunCallbacks(options, user);
          },

          /**
           * Logs in a user with a mobile phone number and sms code sent by
           * AV.User.requestLoginSmsCode.On success, this
           * saves the session to disk, so you can retrieve the currently logged in
           * user using <code>current</code>.
           *
           * <p>Calls options.success or options.error on completion.</p>
           *
           * @param {String} mobilePhone The user's mobilePhoneNumber
           * @param {String} smsCode The sms code sent by AV.User.requestLoginSmsCode
           * @param {Object} options A Backbone-style options object.
           * @return {AV.Promise} A promise that is fulfilled with the user when
           *     the login completes.
           * @see AV.User#logIn
           */
          logInWithMobilePhoneSmsCode: function logInWithMobilePhoneSmsCode(mobilePhone, smsCode, options) {
            var user = AV.Object._create("_User");
            user._finishFetch({ mobilePhoneNumber: mobilePhone, smsCode: smsCode });
            return user.logIn(options);
          },

          /**
           * Sign up or logs in a user with a mobilePhoneNumber and smsCode.
           * On success, this saves the session to disk, so you can retrieve the currently
           * logged in user using <code>current</code>.
           *
           * <p>Calls options.success or options.error on completion.</p>
           *
           * @param {String} mobilePhoneNumber The user's mobilePhoneNumber.
           * @param {String} smsCode The sms code sent by AV.Cloud.requestSmsCode
           * @param {Object} attributes  The user's other attributes such as username etc.
           * @param {Object} options A Backbone-style options object.
           * @return {AV.Promise} A promise that is fulfilled with the user when
           *     the login completes.
           * @see AV.User#signUpOrlogInWithMobilePhone
           * @see AV.Cloud.requestSmsCode
           */
          signUpOrlogInWithMobilePhone: function signUpOrlogInWithMobilePhone(mobilePhoneNumber, smsCode, attrs, options) {
            attrs = attrs || {};
            attrs.mobilePhoneNumber = mobilePhoneNumber;
            attrs.smsCode = smsCode;
            var user = AV.Object._create("_User");
            return user.signUpOrlogInWithMobilePhone(attrs, options);
          },

          /**
           * Logs in a user with a mobile phone number and password. On success, this
           * saves the session to disk, so you can retrieve the currently logged in
           * user using <code>current</code>.
           *
           * <p>Calls options.success or options.error on completion.</p>
           *
           * @param {String} mobilePhone The user's mobilePhoneNumber
           * @param {String} password The password to log in with.
           * @param {Object} options A Backbone-style options object.
           * @return {AV.Promise} A promise that is fulfilled with the user when
           *     the login completes.
           * @see AV.User#logIn
           */
          logInWithMobilePhone: function logInWithMobilePhone(mobilePhone, password, options) {
            var user = AV.Object._create("_User");
            user._finishFetch({ mobilePhoneNumber: mobilePhone, password: password });
            return user.logIn(options);
          },

          /**
           * Sign up or logs in a user with a third party auth data(AccessToken).
           * On success, this saves the session to disk, so you can retrieve the currently
           * logged in user using <code>current</code>.
           *
           * @param {Object} authData The response json data returned from third party token, maybe like { openid: 'abc123', access_token: '123abc', expires_in: 1382686496 }
           * @param {string} platform Available platform for sign up.
           * @param {Object} [callback] An object that has an optional success function, that takes no arguments and will be called on a successful puSH. and an error function that takes a AVError and will be called if the push failed.
           * @return {AV.Promise} A promise that is fulfilled with the user when
           *     the login completes.
           * @example AV.User.signUpOrlogInWithAuthData(authData, platform).then(function(user) {
           *   //Access user here
           * }).catch(function(error) {
           *   //console.error("error: ", error);
           * });
           * @see {@link https://leancloud.cn/docs/js_guide.html#绑定第三方平台账户}
           */
          signUpOrlogInWithAuthData: function signUpOrlogInWithAuthData(authData, platform, callback) {
            return AV.User._logInWith(platform, { authData: authData })._thenRunCallbacks(callback);
          },


          /**
           * Associate a user with a third party auth data(AccessToken).
           *
           * @param {AV.User} userObj A user which you want to associate.
           * @param {string} platform Available platform for sign up.
           * @param {Object} authData The response json data returned from third party token, maybe like { openid: 'abc123', access_token: '123abc', expires_in: 1382686496 }
           * @return {AV.Promise} A promise that is fulfilled with the user when completed.
           * @example AV.User.associateWithAuthData(loginUser, 'weixin', {
           *   openid: 'abc123',
           *   access_token: '123abc',
           *   expires_in: 1382686496
           * }).then(function(user) {
           *   //Access user here
           * }).catch(function(error) {
           *   //console.error("error: ", error);
           * });
           */
          associateWithAuthData: function associateWithAuthData(userObj, platform, authData) {
            return userObj._linkWith(platform, { authData: authData });
          },

          /**
           * Logs out the currently logged in user session. This will remove the
           * session from disk, log out of linked services, and future calls to
           * <code>current</code> will return <code>null</code>.
           */
          logOut: function logOut() {
            if (AV._config.disableCurrentUser) {
              console.warn('AV.User.current() was disabled in multi-user environment, call logOut() from user object instead https://leancloud.cn/docs/leanengine-node-sdk-upgrade-1.html');
              return AV.Promise.as(null);
            }

            if (AV.User._currentUser !== null) {
              AV.User._currentUser._logOutWithAll();
              AV.User._currentUser._isCurrentUser = false;
            }
            AV.User._currentUserMatchesDisk = true;
            AV.User._currentUser = null;
            return AV.localStorage.removeItemAsync(AV._getAVPath(AV.User._CURRENT_USER_KEY));
          },

          /**
           *Create a follower query for special user to query the user's followers.
           * @param userObjectId {String} The user object id.
           * @since 0.3.0
           */
          followerQuery: function followerQuery(userObjectId) {
            if (!userObjectId || !_.isString(userObjectId)) {
              throw "Invalid user object id.";
            }
            var query = new AV.FriendShipQuery('_Follower');
            query._friendshipTag = 'follower';
            query.equalTo('user', AV.Object.createWithoutData('_User', userObjectId));
            return query;
          },

          /**
           *Create a followee query for special user to query the user's followees.
           * @param userObjectId {String} The user object id.
           * @since 0.3.0
           */
          followeeQuery: function followeeQuery(userObjectId) {
            if (!userObjectId || !_.isString(userObjectId)) {
              throw "Invalid user object id.";
            }
            var query = new AV.FriendShipQuery('_Followee');
            query._friendshipTag = 'followee';
            query.equalTo('user', AV.Object.createWithoutData('_User', userObjectId));
            return query;
          },

          /**
           * Requests a password reset email to be sent to the specified email address
           * associated with the user account. This email allows the user to securely
           * reset their password on the AV site.
           *
           * <p>Calls options.success or options.error on completion.</p>
           *
           * @param {String} email The email address associated with the user that
           *     forgot their password.
           * @param {Object} options A Backbone-style options object.
           */
          requestPasswordReset: function requestPasswordReset(email, options) {
            var json = { email: email };
            var request = AVRequest("requestPasswordReset", null, null, "POST", json);
            return request._thenRunCallbacks(options);
          },

          /**
           * Requests a verify email to be sent to the specified email address
           * associated with the user account. This email allows the user to securely
           * verify their email address on the AV site.
           *
           * <p>Calls options.success or options.error on completion.</p>
           *
           * @param {String} email The email address associated with the user that
           *     doesn't verify their email address.
           * @param {Object} options A Backbone-style options object.
           */
          requestEmailVerify: function requestEmailVerify(email, options) {
            var json = { email: email };
            var request = AVRequest("requestEmailVerify", null, null, "POST", json);
            return request._thenRunCallbacks(options);
          },

          /**
           * @Deprecated typo error, please use requestEmailVerify
           */
          requestEmailVerfiy: function requestEmailVerfiy(email, options) {
            var json = { email: email };
            var request = AVRequest("requestEmailVerify", null, null, "POST", json);
            return request._thenRunCallbacks(options);
          },

          /**
           * Requests a verify sms code to be sent to the specified mobile phone
           * number associated with the user account. This sms code allows the user to
           * verify their mobile phone number by calling AV.User.verifyMobilePhone
           *
           * <p>Calls options.success or options.error on completion.</p>
           *
           * @param {String} mobilePhone The mobile phone number  associated with the
           *                  user that doesn't verify their mobile phone number.
           * @param {Object} options A Backbone-style options object.
           */
          requestMobilePhoneVerify: function requestMobilePhoneVerify(mobilePhone, options) {
            var json = { mobilePhoneNumber: mobilePhone };
            var request = AVRequest("requestMobilePhoneVerify", null, null, "POST", json);
            return request._thenRunCallbacks(options);
          },

          /**
           * Requests a reset password sms code to be sent to the specified mobile phone
           * number associated with the user account. This sms code allows the user to
           * reset their account's password by calling AV.User.resetPasswordBySmsCode
           *
           * <p>Calls options.success or options.error on completion.</p>
           *
           * @param {String} mobilePhone The mobile phone number  associated with the
           *                  user that doesn't verify their mobile phone number.
           * @param {Object} options A Backbone-style options object.
           */
          requestPasswordResetBySmsCode: function requestPasswordResetBySmsCode(mobilePhone, options) {
            var json = { mobilePhoneNumber: mobilePhone };
            var request = AVRequest("requestPasswordResetBySmsCode", null, null, "POST", json);
            return request._thenRunCallbacks(options);
          },

          /**
           * Makes a call to reset user's account password by sms code and new password.
          * The sms code is sent by AV.User.requestPasswordResetBySmsCode.
           * @param {String} code The sms code sent by AV.User.Cloud.requestSmsCode
           * @param {String} password The new password.
           * @param {Object} options A Backbone-style options object
           * @return {AV.Promise} A promise that will be resolved with the result
           * of the function.
           */
          resetPasswordBySmsCode: function resetPasswordBySmsCode(code, password, options) {
            var json = { password: password };
            var request = AVRequest("resetPasswordBySmsCode", null, code, "PUT", json);
            return request._thenRunCallbacks(options);
          },

          /**
           * Makes a call to verify sms code that sent by AV.User.Cloud.requestSmsCode
           * If verify successfully,the user mobilePhoneVerified attribute will be true.
           * @param {String} code The sms code sent by AV.User.Cloud.requestSmsCode
           * @param {Object} options A Backbone-style options object
           * @return {AV.Promise} A promise that will be resolved with the result
           * of the function.
           */
          verifyMobilePhone: function verifyMobilePhone(code, options) {
            var request = AVRequest("verifyMobilePhone", null, code, "POST", null);
            return request._thenRunCallbacks(options);
          },

          /**
           * Requests a logIn sms code to be sent to the specified mobile phone
           * number associated with the user account. This sms code allows the user to
           * login by AV.User.logInWithMobilePhoneSmsCode function.
           *
           * <p>Calls options.success or options.error on completion.</p>
           *
           * @param {String} mobilePhone The mobile phone number  associated with the
           *           user that want to login by AV.User.logInWithMobilePhoneSmsCode
           * @param {Object} options A Backbone-style options object.
           */
          requestLoginSmsCode: function requestLoginSmsCode(mobilePhone, options) {
            var json = { mobilePhoneNumber: mobilePhone };
            var request = AVRequest("requestLoginSmsCode", null, null, "POST", json);
            return request._thenRunCallbacks(options);
          },

          /**
           * Retrieves the currently logged in AVUser with a valid session,
           * either from memory or localStorage, if necessary.
           * @return {AV.Promise} resolved with the currently logged in AV.User.
           */
          currentAsync: function currentAsync() {
            if (AV._config.disableCurrentUser) {
              console.warn('AV.User.currentAsync() was disabled in multi-user environment, access user from request instead https://leancloud.cn/docs/leanengine-node-sdk-upgrade-1.html');
              return AV.Promise.as(null);
            }

            if (AV.User._currentUser) {
              return AV.Promise.as(AV.User._currentUser);
            }

            if (AV.User._currentUserMatchesDisk) {

              return AV.Promise.as(AV.User._currentUser);
            }

            return AV.localStorage.getItemAsync(AV._getAVPath(AV.User._CURRENT_USER_KEY)).then(function (userData) {
              if (!userData) {
                return null;
              }

              // Load the user from local storage.
              AV.User._currentUserMatchesDisk = true;

              AV.User._currentUser = AV.Object._create("_User");
              AV.User._currentUser._isCurrentUser = true;

              var json = JSON.parse(userData);
              AV.User._currentUser.id = json._id;
              delete json._id;
              AV.User._currentUser._sessionToken = json._sessionToken;
              delete json._sessionToken;
              AV.User._currentUser._finishFetch(json);
              //AV.User._currentUser.set(json);

              AV.User._currentUser._synchronizeAllAuthData();
              AV.User._currentUser._refreshCache();
              AV.User._currentUser._opSetQueue = [{}];
              return AV.User._currentUser;
            });
          },

          /**
           * Retrieves the currently logged in AVUser with a valid session,
           * either from memory or localStorage, if necessary.
           * @return {AV.Object} The currently logged in AV.User.
           */
          current: function current() {
            if (AV._config.disableCurrentUser) {
              console.warn('AV.User.current() was disabled in multi-user environment, access user from request instead https://leancloud.cn/docs/leanengine-node-sdk-upgrade-1.html');
              return null;
            }

            if (AV.User._currentUser) {
              return AV.User._currentUser;
            }

            if (AV.User._currentUserMatchesDisk) {

              return AV.User._currentUser;
            }

            // Load the user from local storage.
            AV.User._currentUserMatchesDisk = true;

            var userData = AV.localStorage.getItem(AV._getAVPath(AV.User._CURRENT_USER_KEY));
            if (!userData) {

              return null;
            }
            AV.User._currentUser = AV.Object._create("_User");
            AV.User._currentUser._isCurrentUser = true;

            var json = JSON.parse(userData);
            AV.User._currentUser.id = json._id;
            delete json._id;
            AV.User._currentUser._sessionToken = json._sessionToken;
            delete json._sessionToken;
            AV.User._currentUser._finishFetch(json);
            //AV.User._currentUser.set(json);

            AV.User._currentUser._synchronizeAllAuthData();
            AV.User._currentUser._refreshCache();
            AV.User._currentUser._opSetQueue = [{}];
            return AV.User._currentUser;
          },

          /**
           * Persists a user as currentUser to localStorage, and into the singleton.
           */
          _saveCurrentUser: function _saveCurrentUser(user) {
            var promise;
            if (AV.User._currentUser !== user) {
              promise = AV.User.logOut();
            } else {
              promise = AV.Promise.as();
            }
            return promise.then(function () {
              user._isCurrentUser = true;
              AV.User._currentUser = user;

              var json = user.toJSON();
              json._id = user.id;
              json._sessionToken = user._sessionToken;
              return AV.localStorage.setItemAsync(AV._getAVPath(AV.User._CURRENT_USER_KEY), JSON.stringify(json)).then(function () {
                AV.User._currentUserMatchesDisk = true;
              });
            });
          },

          _registerAuthenticationProvider: function _registerAuthenticationProvider(provider) {
            AV.User._authProviders[provider.getAuthType()] = provider;
            // Synchronize the current user with the auth provider.
            if (!AV._config.disableCurrentUser && AV.User.current()) {
              AV.User.current()._synchronizeAuthData(provider.getAuthType());
            }
          },

          _logInWith: function _logInWith(provider, options) {
            var user = AV.Object._create("_User");
            return user._linkWith(provider, options);
          }

        });
      };

      function filterOutCallbacks(options) {
        var newOptions = _.clone(options) || {};
        delete newOptions.success;
        delete newOptions.error;
        return newOptions;
      }
    }, { "./error": 25, "./request": 38, "underscore": 18 }], 46: [function (require, module, exports) {
      (function (process) {
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
                if ((typeof options === "undefined" ? "undefined" : _typeof(options)) === 'object') {
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
      }).call(this, require('_process'));
    }, { "./request": 38, "_process": 11, "underscore": 18 }], 47: [function (require, module, exports) {
      /**
       * 每位工程师都有保持代码优雅的义务
       * Each engineer has a duty to keep the code elegant
      **/

      module.exports = 'js1.5.4';
    }, {}] }, {}, [29])(29);
});
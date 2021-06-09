const AV = require('./av');
const AppRouter = require('./app-router');
const { isNullOrUndefined } = require('./utils');
const { extend, isObject, isEmpty } = require('underscore');

const isCNApp = appId => appId.slice(-9) !== '-MdYXbMMI';

const fillServerURLs = url => ({
  push: url,
  stats: url,
  engine: url,
  api: url,
  rtm: url,
});

function getDefaultServerURLs(appId) {
  if (isCNApp(appId)) {
    return {};
  }
  const id = appId.slice(0, 8).toLowerCase();
  const domain = 'lncldglobal.com';
  return {
    push: `https://${id}.push.${domain}`,
    stats: `https://${id}.stats.${domain}`,
    engine: `https://${id}.engine.${domain}`,
    api: `https://${id}.api.${domain}`,
    rtm: `https://${id}.rtm.${domain}`,
  };
}

let _disableAppRouter = false;
let _initialized = false;

/**
 * URLs for services
 * @typedef {Object} ServerURLs
 * @property {String} [api] serverURL for API service
 * @property {String} [engine] serverURL for engine service
 * @property {String} [stats] serverURL for stats service
 * @property {String} [push] serverURL for push service
 * @property {String} [rtm] serverURL for LiveQuery service
 */

/**
 * Call this method first to set up your authentication tokens for AV.
 * You can get your app keys from the LeanCloud dashboard on http://leancloud.cn .
 * @function AV.init
 * @param {Object} options
 * @param {String} options.appId application id
 * @param {String} options.appKey application key
 * @param {String} [options.masterKey] application master key
 * @param {Boolean} [options.production]
 * @param {String|ServerURLs} [options.serverURL] URLs for services. if a string was given, it will be applied for all services.
 * @param {Boolean} [options.disableCurrentUser]
 */
AV.init = function init(options, ...params) {
  if (!isObject(options)) {
    return AV.init({
      appId: options,
      appKey: params[0],
      masterKey: params[1],
    });
  }
  const {
    appId,
    appKey,
    masterKey,
    hookKey,
    serverURL,
    serverURLs = serverURL,
    disableCurrentUser,
    production,
    realtime,
  } = options;
  if (_initialized)
    console.warn(
      'Initializing LeanCloud Storage SDK which has already been initialized. Reinitializing the SDK might cause problems like unexpected cross-app data writing and invalid relations.'
    );
  if (!appId) throw new TypeError('appId must be a string');
  if (!appKey) throw new TypeError('appKey must be a string');
  if (process.env.PLATFORM !== 'NODE_JS' && masterKey)
    console.warn('MasterKey is not supposed to be used at client side.');
  if (isCNApp(appId)) {
    if (!serverURLs && isEmpty(AV._config.serverURLs)) {
      throw new TypeError(
        `serverURL option is required for apps from CN region`
      );
    }
  }
  if (appId !== AV._config.applicationId) {
    // overwrite all keys when reinitializing as a new app
    AV._config.masterKey = masterKey;
    AV._config.hookKey = hookKey;
  } else {
    if (masterKey) AV._config.masterKey = masterKey;
    if (hookKey) AV._config.hookKey = hookKey;
  }
  AV._config.applicationId = appId;
  AV._config.applicationKey = appKey;
  if (!isNullOrUndefined(production)) {
    AV.setProduction(production);
  }
  if (typeof disableCurrentUser !== 'undefined')
    AV._config.disableCurrentUser = disableCurrentUser;
  const disableAppRouter =
    _disableAppRouter || typeof serverURLs !== 'undefined';
  if (!disableAppRouter) {
    AV._appRouter = new AppRouter(AV);
  }
  AV._setServerURLs(
    extend(
      {},
      getDefaultServerURLs(appId),
      AV._config.serverURLs,
      typeof serverURLs === 'string' ? fillServerURLs(serverURLs) : serverURLs
    ),
    disableAppRouter
  );
  if (realtime) {
    AV._config.realtime = realtime;
  } else if (AV._sharedConfig.liveQueryRealtime) {
    const { api, rtm } = AV._config.serverURLs;
    AV._config.realtime = new AV._sharedConfig.liveQueryRealtime({
      appId,
      appKey,
      server: {
        api,
        RTMRouter: rtm,
      },
    });
  }
  _initialized = true;
};

// If we're running in node.js, allow using the master key.
if (process.env.PLATFORM === 'NODE_JS') {
  AV.Cloud = AV.Cloud || {};
  /**
   * Switches the LeanCloud SDK to using the Master key.  The Master key grants
   * priveleged access to the data in LeanCloud and can be used to bypass ACLs and
   * other restrictions that are applied to the client SDKs.
   * <p><strong><em>Available in Cloud Code and Node.js only.</em></strong>
   * </p>
   */
  AV.Cloud.useMasterKey = () => {
    AV._config.useMasterKey = true;
  };
}

/**
 * Call this method to set production environment variable.
 * @function AV.setProduction
 * @param {Boolean} production True is production environment,and
 *  it's true by default.
 */
AV.setProduction = production => {
  if (!isNullOrUndefined(production)) {
    AV._config.production = production ? 1 : 0;
  } else {
    // change to default value
    AV._config.production = null;
  }
};

AV._setServerURLs = (urls, disableAppRouter = true) => {
  if (typeof urls !== 'string') {
    extend(AV._config.serverURLs, urls);
  } else {
    AV._config.serverURLs = fillServerURLs(urls);
  }
  if (disableAppRouter) {
    if (AV._appRouter) {
      AV._appRouter.disable();
    } else {
      _disableAppRouter = true;
    }
  }
};
/**
 * Set server URLs for services.
 * @function AV.setServerURL
 * @since 4.3.0
 * @param {String|ServerURLs} urls URLs for services. if a string was given, it will be applied for all services.
 * You can also set them when initializing SDK with `options.serverURL`
 */
AV.setServerURL = urls => AV._setServerURLs(urls);
AV.setServerURLs = AV.setServerURL;

AV.keepErrorRawMessage = value => {
  AV._sharedConfig.keepErrorRawMessage = value;
};

/**
 * Set a deadline for requests to complete.
 * Note that file upload requests are not affected.
 * @function AV.setRequestTimeout
 * @since 3.6.0
 * @param {number} ms
 */
AV.setRequestTimeout = ms => {
  AV._config.requestTimeout = ms;
};

// backword compatible
AV.initialize = AV.init;

const defineConfig = property =>
  Object.defineProperty(AV, property, {
    get() {
      return AV._config[property];
    },
    set(value) {
      AV._config[property] = value;
    },
  });

['applicationId', 'applicationKey', 'masterKey', 'hookKey'].forEach(
  defineConfig
);

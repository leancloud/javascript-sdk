/*!
 * LeanCloud JavaScript SDK
 * https://leancloud.cn
 *
 * Copyright 2016 LeanCloud.cn, Inc.
 * The LeanCloud JavaScript SDK is freely distributable under the MIT license.
 */

const AV = module.exports = require('./av');

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

AV.Error = require('./error');

/**
 * Options to controll the authentication for an operation
 * @typedef {Object} AuthOptions
 * @property {String} sessionToken Specify a user to excute the operation as.
 * @property {Boolean} useMasterKey Indicates whether masterKey is used for this operation. Only valid when masterKey is set.
 */

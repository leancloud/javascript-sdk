/*!
 * AVOSCloud JavaScript SDK
 * Built: Mon Jun 03 2013 13:45:00
 * https://leancloud.cn
 *
 * Copyright 2015 LeanCloud.cn, Inc.
 * The AVOS Cloud JavaScript SDK is freely distributable under the MIT license.
 */

/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

'use strict';

let AV = module.exports = {};
AV._ = require('underscore');
AV.version = require('./version');
AV.Promise = require('./promise');
AV.localStorage = require('./localstorage');
// 挂载所有内部配置项
AV._config = AV._config || {};

// 以下模块为了兼容原有代码，使用这种加载方式。
require('./utils')(AV);
require('./error')(AV);
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

// Backward compatibility
AV.AV = AV;

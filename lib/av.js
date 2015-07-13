/*!
 * AVOSCloud JavaScript SDK
 * Built: Mon Jun 03 2013 13:45:00
 * https://leancloud.cn
 *
 * Copyright 2015 LeanCloud.cn, Inc.
 * The AVOS Cloud JavaScript SDK is freely distributable under the MIT license.
 *
 * Copyright 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
 * Released under the MIT license.
 */

// The module order is important
var AV = {};

AV._ = require('underscore');
AV.version = require('./version');

// 以下模块为了兼容原有代码，使用这种加载方式。
require('./utils')(AV);
require('./error')(AV);
require('./event')(AV);
require('./geopoint')(AV);
require('./acl')(AV);
require('./op')(AV);
require('./relation')(AV);
require('./promise')(AV);
require('./file')(AV);
require('./object')(AV);
require('./role')(AV);
require('./collection')(AV);
require('./view')(AV);
require('./user')(AV);
require('./query')(AV);
require('./facebook')(AV);
require('./history')(AV);
require('./router')(AV);
require('./cloudfunction')(AV);
require('./push')(AV);
require('./status')(AV);
require('./search')(AV);
require('./insight')(AV);
AV.BigQuery = require('./bigquery');

AV.AV = AV; // Backward compatibility
module.exports = AV;

/*!
 * AVOSCloud JavaScript SDK
 * Built: Mon Jun 03 2013 13:45:00
 * https://leancloud.cn
 *
 * Copyright 2015 LeanCloud.cn, Inc.
 * The AVOS Cloud JavaScript SDK is freely distributable under the MIT license.
 */

var AV = {};

AV._ = require('underscore');
AV.VERSION = require('./version');
AV.Promise = require('./promise');
AV.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
AV.localStorage = require('localStorage');

// 以下模块为了兼容原有代码，使用这种加载方式。
// The module order is important.
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
require('./bigquery')(AV);

global.AV = AV;

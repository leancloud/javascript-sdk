/*!
 * AVOSCloud JavaScript SDK
 * Built: Mon Jun 03 2013 13:45:00
 * https://leancloud.cn
 *
 * Copyright 2015 LeanCloud.cn, Inc.
 * The AVOS Cloud JavaScript SDK is freely distributable under the MIT license.
 *
 * Includes: Underscore.js
 * Copyright 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
 * Released under the MIT license.
 */

var fs = require('fs');
var path = require('path');

var include = function(filename) {
  var script = fs.readFileSync(path.join(__dirname, filename), {'encoding': 'utf-8'});
  module._compile(script, filename);
};

//The module order is important
[
  'underscore.js',
  'version.js',
  'utils.js',
  'error.js',
  'event.js',
  'geopoint.js',
  'acl.js',
  'op.js',
  'relation.js',
  'promise.js',
  'file.js',
  'object.js',
  'role.js',
  'collection.js',
  'view.js',
  'user.js',
  'query.js',
  'facebook.js',
  'history.js',
  'router.js',
  'cloudfunction.js',
  'push.js',
  'status.js',
  'search.js'
].forEach(include);

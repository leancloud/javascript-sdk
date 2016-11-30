'use strict';

var version = require('../version');
var comments = [process.env.PLATFORM || 'Node.js'].concat(require('./comments'));

module.exports = 'LeanCloud-JS-SDK/' + version + ' (' + comments.join('; ') + ')';
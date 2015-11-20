'use strict';

var _ = require('underscore');
var AV = require('./AV');

global.AV = _.extend(AV, global.AV);

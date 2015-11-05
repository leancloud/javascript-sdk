'use strict';

var AV = require('./AV');

global.AV = global.AV || {};

// 防止多个 SDK 互相覆盖 AV 命名空间
for (var k in AV) {
  global.AV[k] = AV[k];
}

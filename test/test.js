'use strict';

if (typeof require !== 'undefined') {
  GLOBAL.debug = require('debug')('test');
  GLOBAL.expect = require('expect.js');
  GLOBAL.serverURL = 'http://192.168.1.216:3000';
  GLOBAL.AV = require('../dist/node/av');
}

AV._config.APIServerURL = 'https://cn-stg1.avoscloud.com';
AV.init({
  appId: 'mxrb5nn3qz7drek0etojy5lh4yrwjnk485lqajnsgjwfxrb5',
  appKey: 'd7sbus0d81mrum4tko4t8gl74b27vl0rh762ff7ngrb6ymmq',
  masterKey: 'l0n9wu3kwnrtf2cg1b6w2l87nphzpypgff6240d0lxui2mm4'
});
AV.setProduction(true);
AV._config.isUsingMasterKey = true;

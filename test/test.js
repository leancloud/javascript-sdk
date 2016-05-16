'use strict';

if (typeof require !== 'undefined') {
  GLOBAL.debug = require('debug')('test');
  GLOBAL.expect = require('expect.js');
  GLOBAL.serverURL = 'http://192.168.1.216:3000';
  GLOBAL.AV = require('../dist/node/av');
}

// AV._config.APIServerURL = 'https://cn-stg1.avoscloud.com';
// AV.init({
//   appId: 'mxrb5nn3qz7drek0etojy5lh4yrwjnk485lqajnsgjwfxrb5',
//   appKey: 'd7sbus0d81mrum4tko4t8gl74b27vl0rh762ff7ngrb6ymmq',
//   masterKey: 'l0n9wu3kwnrtf2cg1b6w2l87nphzpypgff6240d0lxui2mm4'
// });
AV.init({
  appId: '95TNUaOSUd8IpKNW0RSqSEOm-9Nh9j0Va',
  appKey: 'gNAE1iHowdQvV7cqpfCMGaGN',
  masterKey: 'ue9M9nqwD4MQNXD3oiN5rAOv'
});
AV.setProduction(true);
AV._useMasterKey = true;

'use strict';

if (!process) process = { env: {}};

if (typeof require !== 'undefined') {
  global.debug = require('debug')('test');
  global.expect = require('expect.js');
  global.AV = require('../src');
}

// AV._config.APIServerURL = 'https://cn-stg1.avoscloud.com';
// AV.init({
//   appId: 'mxrb5nn3qz7drek0etojy5lh4yrwjnk485lqajnsgjwfxrb5',
//   appKey: 'd7sbus0d81mrum4tko4t8gl74b27vl0rh762ff7ngrb6ymmq',
//   masterKey: 'l0n9wu3kwnrtf2cg1b6w2l87nphzpypgff6240d0lxui2mm4'
// });
AV.init({
  appId: process.env.APPID || '95TNUaOSUd8IpKNW0RSqSEOm-9Nh9j0Va',
  appKey: process.env.APPKEY || 'gNAE1iHowdQvV7cqpfCMGaGN',
  masterKey: process.env.MASTERKEY || 'ue9M9nqwD4MQNXD3oiN5rAOv',
  hookKey: process.env.HOOKKEY || '2iCbUZDgEF0siKxmCn2kVQXV',
  region: process.env.REGION || 'cn',
});
AV.setProduction(true);

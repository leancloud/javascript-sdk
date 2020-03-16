if (typeof process === 'undefined') process = { env: {} };

if (typeof require !== 'undefined') {
  global.debug = require('debug')('test');
  global.expect = require('expect.js');
  global.AV = require('../src/entry');
}

// AV.init({
//   appId: 'Vpe1RqHgS5VGWBlhB6pdiiow-null',
//   appKey: 'OxKVgM0izOIckMi9WiT0pBSf',
//   masterKey: 'RCLNNJ6l51YJXzv7YG4fHA5v',
//   serverURLs: 'https://cn-stg1.leancloud.cn',
// });

AV.init({
  appId: process.env.APPID || '95TNUaOSUd8IpKNW0RSqSEOm-9Nh9j0Va',
  appKey: process.env.APPKEY || 'gNAE1iHowdQvV7cqpfCMGaGN',
  masterKey: process.env.MASTERKEY || 'ue9M9nqwD4MQNXD3oiN5rAOv',
  hookKey: process.env.HOOKKEY || '2iCbUZDgEF0siKxmCn2kVQXV',
  serverURLs: process.env.SERVER_URL || 'https://95tnuaos.lc-cn-e1-shared.com',
});
AV.setProduction(true);

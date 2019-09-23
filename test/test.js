if (typeof process === 'undefined') process = { env: {} };

if (typeof require !== 'undefined') {
  global.debug = require('debug')('test');
  global.expect = require('expect.js');
  global.AV = require('../src');
}

// AV.init({
//   appId: 'Vpe1RqHgS5VGWBlhB6pdiiow-null',
//   appKey: 'OxKVgM0izOIckMi9WiT0pBSf',
//   masterKey: 'RCLNNJ6l51YJXzv7YG4fHA5v',
//   serverURLs: 'https://cn-stg1.leancloud.cn',
// });

function serverURLsWithSuffix(appId, suffix) {
  const id = appId.slice(0, 8).toLowerCase();

  return {
    push: `https://${id}.push.${suffix}`,
    stats: `https://${id}.stats.${suffix}`,
    engine: `https://${id}.engine.${suffix}`,
    api: `https://${id}.api.${suffix}`,
    rtm: `https://${id}.rtm.${suffix}`,
  };
}

function serverUrls() {
  if (process.env.SERVER_URL) {
    return process.env.SERVER_URL;
  } else if (process.env.SERVER_URL_SUFFIX) {
    return serverURLsWithSuffix(process.env.SERVER_URL_SUFFIX);
  } else {
    return undefined;
  }
}

AV.init({
  appId: process.env.APPID || '95TNUaOSUd8IpKNW0RSqSEOm-9Nh9j0Va',
  appKey: process.env.APPKEY || 'gNAE1iHowdQvV7cqpfCMGaGN',
  masterKey: process.env.MASTERKEY || 'ue9M9nqwD4MQNXD3oiN5rAOv',
  hookKey: process.env.HOOKKEY || '2iCbUZDgEF0siKxmCn2kVQXV',
  serverURLs: serverUrls(),
});
AV.setProduction(true);

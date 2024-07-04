if (typeof process === 'undefined') process = { env: {} };

if (typeof require !== 'undefined') {
  global.debug = require('debug')('test');
  global.expect = require('expect.js');
  global.AV = require('../src/entry');
}

AV.init({
  appId: process.env.APPID,
  appKey: process.env.APPKEY,
  masterKey: process.env.MASTERKEY,
  hookKey: process.env.HOOKKEY,
  serverURLs: process.env.SERVER_URL,
});
AV.setProduction(true);

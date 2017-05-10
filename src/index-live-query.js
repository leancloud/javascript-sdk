const AV = require('./index');

const { Realtime } = require('leancloud-realtime/core');
const { LiveQueryPlugin } = require('leancloud-realtime-plugin-live-query');
Realtime.__preRegisteredPlugins = [LiveQueryPlugin];
AV._sharedConfig.liveQueryRealtime = Realtime;

module.exports = AV;

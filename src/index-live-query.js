const AV = require('./index');

const {
  Realtime,
  setAdapters: setRTMAdapters,
} = require('leancloud-realtime/core');
const { LiveQueryPlugin } = require('leancloud-realtime-plugin-live-query');
Realtime.__preRegisteredPlugins = [LiveQueryPlugin];
AV._sharedConfig.liveQueryRealtime = Realtime;

const { setAdapters } = AV;
AV.setAdapters = adapters => {
  setAdapters(adapters);
  setRTMAdapters(adapters);
};
const adapters = require('@leancloud/runtime-adapters-node');
AV.setAdapters(adapters);

module.exports = AV;

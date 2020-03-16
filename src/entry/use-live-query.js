const {
  Realtime,
  setAdapters: setRTMAdapters,
} = require('leancloud-realtime/core');
const { LiveQueryPlugin } = require('leancloud-realtime-plugin-live-query');
Realtime.__preRegisteredPlugins = [LiveQueryPlugin];

module.exports = AV => {
  AV._sharedConfig.liveQueryRealtime = Realtime;

  const { setAdapters } = AV;
  AV.setAdapters = adapters => {
    setAdapters(adapters);
    setRTMAdapters(adapters);
  };

  return AV;
};

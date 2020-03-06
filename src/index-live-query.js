const AV = require('./index');

const {
  Realtime,
  setAdaptor: setRTMAdaptor,
  setAdaptors: setRTMAdaptors,
} = require('leancloud-realtime/core');
const { LiveQueryPlugin } = require('leancloud-realtime-plugin-live-query');
Realtime.__preRegisteredPlugins = [LiveQueryPlugin];
AV._sharedConfig.liveQueryRealtime = Realtime;

const { setAdaptor, setAdaptors } = AV;
AV.setAdaptor = (name, adaptor) => {
  setAdaptor(name, adaptor);
  setRTMAdaptor(name, adaptor);
};
AV.setAdaptors = adaptors => {
  setAdaptors(adaptors);
  setRTMAdaptors(adaptors);
};
const adaptors = require('./builtin-adaptors');
AV.setAdaptors(adaptors);
const WebSocket = require('isomorphic-ws');
AV.setAdaptors({ WebSocket });

module.exports = AV;

const adapters = require('@leancloud/platform-adapters-node');

module.exports = AV => {
  AV.setAdapters(adapters);
  return AV;
};

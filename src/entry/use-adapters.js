const adapters = require('@leancloud/platform-adapters-node');
const getUA = require('../ua');
const comments = (process.env.CLIENT_PLATFORM
  ? [process.env.CLIENT_PLATFORM]
  : []
).concat(require('../ua/comments'));

module.exports = AV => {
  AV.setAdapters(adapters);
  AV._sharedConfig.userAgent = getUA(comments);
  return AV;
};

const adapters = require('@leancloud/platform-adapters-node');
const getUA = require('../ua');
const comments = (process.env.PLATFORM === 'NODE_JS'
  ? [process.env.PLATFORM]
  : []
).concat(require('../ua/comments'));

module.exports = AV => {
  AV.setAdapters(adapters);
  AV._sharedConfig.userAgent = getUA(comments);
  return AV;
};

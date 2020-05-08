const AV = require('./core');
const adapters = require('@leancloud/platform-adapters-weapp');

AV.setAdapters(adapters);

module.exports = AV;

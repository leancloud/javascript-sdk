const { create, entry, name } = require('./common');

const config = create();

config.entry = {
  [`${name}-weapp`]: entry,
  [`${name}-weapp-min`]: entry,
};
config.resolve.aliasFields = ['weapp', 'browser'];

module.exports = config;

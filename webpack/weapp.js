const { create, name } = require('./common');

const config = create();
const entry = './src/entry/index-weapp.js';

config.entry = {
  [`${name}-weapp`]: entry,
  [`${name}-weapp-min`]: entry,
};
config.resolve.aliasFields = ['weapp', 'browser'];

module.exports = config;

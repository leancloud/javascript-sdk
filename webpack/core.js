const { create, name } = require('./common');

const config = create();

const entry = process.env.LIVE_QUERY
  ? './src/entry/core-live-query.js'
  : './src/entry/core.js';

config.entry = {
  [`${name}-core`]: entry,
  [`${name}-core-min`]: entry,
};

module.exports = config;

const _ = require('underscore');
const adapters = {};

const getAdapter = name => {
  const adapter = adapters[name];
  if (adapter === undefined) {
    throw new Error(`${name} adapter is not configured`);
  }
  return adapter;
};
const setAdapters = newAdapters => {
  _.extend(adapters, newAdapters);
};

module.exports = {
  getAdapter,
  setAdapters,
};

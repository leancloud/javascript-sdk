const adapters = {};

const getAdapter = name => {
  const adapter = adapters[name];
  if (adapter === undefined) {
    throw new Error(`${name} adapter is not configured`);
  }
  return adapter;
};
const setAdapters = newAdapters => {
  Object.assign(adapters, newAdapters);
};

module.exports = {
  getAdapter,
  setAdapters,
};

const adaptors = {};

const getAdaptor = name => {
  const adaptor = adaptors[name];
  if (adaptor === undefined) {
    throw new Error(`${name} adaptor is not configured`);
  }
  return adaptor;
};
const setAdaptor = (name, adaptor) => {
  adaptors[name] = adaptor;
};
const setAdaptors = newAdaptors => {
  Object.assign(adaptors, newAdaptors);
};

module.exports = {
  getAdaptor,
  setAdaptor,
  setAdaptors,
};

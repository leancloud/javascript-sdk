const _ = require('underscore');
const EventEmitter = require('eventemitter3');
const { inherits } = require('./utils');

const AdapterManager = inherits(EventEmitter, {
  constructor() {
    EventEmitter.apply(this);
    this._adapters = {};
  },
  getAdapter(name) {
    const adapter = this._adapters[name];
    if (adapter === undefined) {
      throw new Error(`${name} adapter is not configured`);
    }
    return adapter;
  },
  setAdapters(newAdapters) {
    _.extend(this._adapters, newAdapters);
    _.keys(newAdapters).forEach(name => this.emit(name, newAdapters[name]));
  },
});

const adapterManager = new AdapterManager();

module.exports = {
  getAdapter: adapterManager.getAdapter.bind(adapterManager),
  setAdapters: adapterManager.setAdapters.bind(adapterManager),
  adapterManager,
};

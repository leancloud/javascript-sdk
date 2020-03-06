var Promise = require('./promise');
var { getAdaptor } = require('./adaptor');

var syncApiNames = ['getItem', 'setItem', 'removeItem', 'clear'];

const localStorage = {
  get async() {
    return getAdaptor('storage').async;
  },
};

// wrap sync apis with async ones.
syncApiNames.forEach(function(apiName) {
  localStorage[apiName + 'Async'] = function() {
    const storage = getAdaptor('storage');
    return Promise.resolve(storage[apiName].apply(storage, arguments));
  };

  localStorage[apiName] = function() {
    const storage = getAdaptor('storage');
    if (!storage.async) {
      return storage[apiName].apply(storage, arguments);
    }
    const error = new Error(
      'Synchronous API [' + apiName + '] is not available in this runtime.'
    );
    error.code = 'SYNC_API_NOT_AVAILABLE';
    throw error;
  };
});

module.exports = localStorage;

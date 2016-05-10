'use strict';
const storage = require('./localstorage');
const AV = require('./av');

const remove = exports.remove = storage.removeItemAsync.bind(storage);

exports.get = (key) => {
  return storage.getItemAsync(`${AV.applicationId}/${key}`)
    .then(cache => {
      try {
        cache = JSON.parse(cache);
      } catch (e) {
        return null;
      }
      if (cache) {
        const expired = cache.expiredAt && cache.expiredAt < Date.now();
        if (!expired) {
          return cache.value;
        }
        return remove(key).then(() => null);
      }
      return null;
    });
};

exports.set = (key, value, ttl) => {
  const cache = {
    value
  };
  if (typeof ttl === 'number') {
    cache.expiredAt = Date.now() + ttl;
  }
  return storage.setItemAsync(
    `${AV.applicationId}/${key}`,
     JSON.stringify(cache)
   );
};

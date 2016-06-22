/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

const storage = require('./localstorage');
const AV = require('./av');

const remove = exports.remove = storage.removeItemAsync.bind(storage);

const formatCacheData = (cacheData, key, isAsync) => {
  try {
    cacheData = JSON.parse(cacheData);
  } catch (e) {
    return null;
  }
  if (cacheData) {
    const expired = cacheData.expiredAt && cacheData.expiredAt < Date.now();
    if (!expired) {
      return cacheData.value;
    }
    if (isAsync) {
      return remove(key).then(() => null);
    } else {
      remove(key);
      return null;
    }
  }
  return null;
};

exports.isAsync = () => storage.async;

exports.get = (key) => {
  key = `${AV.applicationId}/${key}`;
  const cache = storage.getItem(key);
  return formatCacheData(cache, key);
};

exports.getAsync = (key) => {
  key = `${AV.applicationId}/${key}`;
  return storage.getItemAsync(key)
    .then(cache => formatCacheData(cache, key, true));
};

exports.set = (key, value, ttl) => {
  const cache = { value };
  if (typeof ttl === 'number') {
    cache.expiredAt = Date.now() + ttl;
  }
  return storage.setItemAsync(
    `${AV.applicationId}/${key}`,
     JSON.stringify(cache)
   );
};

/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

const storage = require('./localstorage');
const AV = require('./av');

const remove = exports.remove = storage.removeItem.bind(storage);
const removeAsync = exports.removeAsync = storage.removeItemAsync.bind(storage);

const getCacheData = (cacheData, key, isAsyncFlag) => {
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
    if (isAsyncFlag) {
      return removeAsync(key).then(() => null);
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
  return getCacheData(cache, key);
};

exports.getAsync = (key) => {
  key = `${AV.applicationId}/${key}`;
  return storage.getItemAsync(key)
    .then(cache => getCacheData(cache, key, true));
};

exports.set = (key, value, ttl) => {
  const cache = { value };
  if (typeof ttl === 'number') {
    cache.expiredAt = Date.now() + ttl;
  }
  storage.setItem(`${AV.applicationId}/${key}`, JSON.stringify(cache));
};

exports.setAsync = (key, value, ttl) => {
  const cache = { value };
  if (typeof ttl === 'number') {
    cache.expiredAt = Date.now() + ttl;
  }
  return storage.setItemAsync(
    `${AV.applicationId}/${key}`,
     JSON.stringify(cache)
   );
};

const ajax = require('./utils/ajax');
const Cache = require('./cache');

function AppRouter(AV) {
  this.AV = AV;
  this.lockedUntil = 0;
  Cache.getAsync('serverURLs')
    .then(data => {
      if (this.disabled) return;
      if (!data) return this.lock(0);
      const { serverURLs, lockedUntil } = data;
      this.AV._setServerURLs(serverURLs, false);
      this.lockedUntil = lockedUntil;
    })
    .catch(() => this.lock(0));
}

AppRouter.prototype.disable = function disable() {
  this.disabled = true;
};
AppRouter.prototype.lock = function lock(ttl) {
  this.lockedUntil = Date.now() + ttl;
};
AppRouter.prototype.refresh = function refresh() {
  if (this.disabled) return;
  if (Date.now() < this.lockedUntil) return;
  this.lock(10);
  const url = 'https://app-router.com/2/route';
  return ajax({
    method: 'get',
    url,
    query: {
      appId: this.AV.applicationId,
    },
  })
    .then(servers => {
      if (this.disabled) return;
      let ttl = servers.ttl;
      if (!ttl) throw new Error('missing ttl');
      ttl = ttl * 1000;
      const protocal = 'https://';
      const serverURLs = {
        push: protocal + servers.push_server,
        stats: protocal + servers.stats_server,
        engine: protocal + servers.engine_server,
        api: protocal + servers.api_server,
      };
      this.AV._setServerURLs(serverURLs, false);
      this.lock(ttl);
      return Cache.setAsync(
        'serverURLs',
        {
          serverURLs,
          lockedUntil: this.lockedUntil,
        },
        ttl
      );
    })
    .catch(error => {
      // bypass all errors
      console.warn(`refresh server URLs failed: ${error.message}`);
      this.lock(600);
    });
};

module.exports = AppRouter;

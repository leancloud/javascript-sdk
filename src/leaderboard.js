const _ = require('underscore');
const Promise = require('./promise');
const { request } = require('./request');
const { ensureArray, parseDate } = require('./utils');
const AV = require('./av');

const LeaderboardVersionChangeInterval = {
  NEVER: 'never',
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
};

const LeaderboardOrder = {
  ASCENDING: 'ascending',
  DESCENDING: 'descending',
};

function Statistic({ user, name, value, position, version }) {
  this.name = name;
  this.value = value;
  this.user = user;
  this.position = position;
  this.version = version;
}

function Leaderboard(statisticName) {
  this.statisticName = statisticName;
  this.versionChangeInterval = undefined;
  this.version = undefined;
  this.nextResetAt = undefined;
}

Leaderboard.createWithoutData = statisticName => new Leaderboard(statisticName);
Leaderboard.createLeaderboard = (
  { statisticName, order, versionChangeInterval },
  authOptions
) =>
  request({
    method: 'POST',
    path: '/play/leaderboards',
    data: {
      statisticName,
      order,
      versionChangeInterval,
    },
    authOptions,
  }).then(data => {
    const leaderboard = new Leaderboard(statisticName);
    return leaderboard._finishFetch(data);
  });
Leaderboard.getLeaderboard = (statisticName, authOptions) =>
  Leaderboard.createWithoutData(statisticName).fetch(authOptions);
Leaderboard.getStatistics = (user, { statisticNames } = {}, authOptions) =>
  Promise.resolve().then(() => {
    if (!(user && user.id)) throw new Error('user must be an AV.User');
    return request({
      method: 'GET',
      path: `/play/users/${user.id}/statistics`,
      query: {
        statistics: statisticNames ? ensureArray(statisticNames) : undefined,
      },
      authOptions,
    }).then(({ results }) =>
      results.map(statisticData => {
        const {
          statisticName: name,
          statisticValue: value,
          version,
        } = AV._decode(statisticData);
        return new Statistic({ user, name, value, version });
      })
    );
  });
Leaderboard.updateStatistics = (user, statistics, authOptions) =>
  Promise.resolve().then(() => {
    if (!(user && user.id)) throw new Error('user must be an AV.User');
    const data = _.map(statistics, (value, key) => ({
      statisticName: key,
      statisticValue: value,
    }));
    return request({
      method: 'POST',
      path: `/play/users/${user.id}/statistics`,
      data,
      authOptions,
    }).then(({ results }) =>
      results.map(statisticData => {
        const {
          statisticName: name,
          statisticValue: value,
          version,
        } = AV._decode(statisticData);
        return new Statistic({ user, name, value, version });
      })
    );
  });

_.extend(Leaderboard.prototype, {
  _finishFetch(data) {
    _.forEach(data, (value, key) => {
      if (key === 'updatedAt' || key === 'objectId') return;
      if (key === 'expiredAt') {
        key = 'nextResetAt';
      }
      if (value.__type === 'Date') {
        value = parseDate(value.iso);
      }
      this[key] = value;
    });
    return this;
  },
  fetch(authOptions) {
    return request({
      method: 'GET',
      path: `/play/leaderboards/${this.statisticName}`,
      authOptions,
    }).then(data => this._finishFetch(data));
  },
  _getResults({ skip, limit, includeUserKeys }, authOptions, self) {
    return request({
      method: 'GET',
      path: `/play/leaderboards/${this.statisticName}/positions${
        self ? '/self' : ''
      }`,
      query: {
        skip,
        limit,
        includeUser: includeUserKeys
          ? ensureArray(includeUserKeys).join(',')
          : undefined,
      },
      authOptions,
    }).then(({ results }) =>
      results.map(statisticData => {
        const {
          user,
          statisticName: name,
          statisticValue: value,
          position,
        } = AV._decode(statisticData);
        return new Statistic({ user, name, value, position });
      })
    );
  },
  getResults({ skip, limit, includeUserKeys } = {}, authOptions) {
    return this._getResults({ skip, limit, includeUserKeys }, authOptions);
  },
  getResultsAroundUser({ limit, includeUserKeys } = {}, authOptions) {
    return this._getResults({ limit, includeUserKeys }, authOptions, true);
  },
  updateVersionChangeInterval(versionChangeInterval, authOptions) {
    return request({
      method: 'PUT',
      path: `/play/leaderboards/${this.statisticName}`,
      data: {
        versionChangeInterval,
      },
      authOptions,
    }).then(data => this._finishFetch(data));
  },
  reset(authOptions) {
    return request({
      method: 'PUT',
      path: `/play/leaderboards/${this.statisticName}/incrementVersion`,
      authOptions,
    }).then(data => this._finishFetch(data));
  },
});

module.exports = {
  Leaderboard,
  LeaderboardOrder,
  LeaderboardVersionChangeInterval,
};

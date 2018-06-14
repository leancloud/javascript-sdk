const _ = require('underscore');
const Promise = require('./promise');
const { request } = require('./request');
const { ensureArray, parseDate } = require('./utils');
const AV = require('./av');

/**
 * The version change interval for Leaderboard
 * @enum
 */
AV.LeaderboardVersionChangeInterval = {
  NEVER: 'never',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
};

/**
 * The order of the leaderboard results
 * @enum
 */
AV.LeaderboardOrder = {
  ASCENDING: 'ascending',
  DESCENDING: 'descending',
};

/**
 * The update strategy for Leaderboard
 * @enum
 */
AV.LeaderboardUpdateStrategy = {
  /** Only keep the best statistic. If the leaderboard is in descending order, the best statistic is the highest one. */
  BETTER: 'better',
  /** Keep the last updated statistic */
  LAST: 'last',
};

/**
 * @typedef {Object} Ranking
 * @property {number} rank Starts at 0
 * @property {number} value the statistic value of this ranking
 * @property {AV.User} user The user of this ranking
 * @property {Statistic[]} [includedStatistics] Other statistics of the user, specified by the `includeStatistic` option of `AV.Leaderboard.getResults()`
 */

/**
 * @class
 */
function Statistic({ name, value, version }) {
  /**
   * @type {string}
   */
  this.name = name;
  /**
   * @type {number}
   */
  this.value = value;
  /**
   * @type {number?}
   */
  this.version = version;
}

const parseStatisticData = statisticData => {
  const { statisticName: name, statisticValue: value, version } = AV._decode(
    statisticData
  );
  return new Statistic({ name, value, version });
};

/**
 * @class
 */
AV.Leaderboard = function(statisticName) {
  /**
   * @type {string}
   */
  this.statisticName = statisticName;
  /**
   * @type {AV.LeaderboardOrder}
   */
  this.order = undefined;
  /**
   * @type {AV.LeaderboardUpdateStrategy}
   */
  this.updateStrategy = undefined;
  /**
   * @type {AV.LeaderboardVersionChangeInterval}
   */
  this.versionChangeInterval = undefined;
  /**
   * @type {number}
   */
  this.version = undefined;
  /**
   * @type {Date?}
   */
  this.nextResetAt = undefined;
  /**
   * @type {Date?}
   */
  this.createdAt = undefined;
};
const Leaderboard = AV.Leaderboard;

/**
 * Create an instance of Leaderboard for the give statistic name.
 * @param {string} statisticName
 * @return {AV.Leaderboard}
 */
AV.Leaderboard.createWithoutData = statisticName =>
  new Leaderboard(statisticName);
/**
 * (masterKey required) Create a new Leaderboard.
 * @param {Object} options
 * @param {string} options.statisticName
 * @param {AV.LeaderboardOrder} options.order
 * @param {AV.LeaderboardVersionChangeInterval} [options.versionChangeInterval] default to WEEK
 * @param {AV.LeaderboardUpdateStrategy} [options.updateStrategy] default to BETTER
 * @param {AuthOptions} [authOptions]
 * @return {Promise<AV.Leaderboard>}
 */
AV.Leaderboard.createLeaderboard = (
  { statisticName, order, versionChangeInterval, updateStrategy },
  authOptions
) =>
  request({
    method: 'POST',
    path: '/leaderboard/leaderboards',
    data: {
      statisticName,
      order,
      versionChangeInterval,
      updateStrategy,
    },
    authOptions,
  }).then(data => {
    const leaderboard = new Leaderboard(statisticName);
    return leaderboard._finishFetch(data);
  });
/**
 * Get the Leaderboard with the specified statistic name.
 * @param {string} statisticName
 * @param {AuthOptions} [authOptions]
 * @return {Promise<AV.Leaderboard>}
 */
AV.Leaderboard.getLeaderboard = (statisticName, authOptions) =>
  Leaderboard.createWithoutData(statisticName).fetch(authOptions);
/**
 * Get Statistics for the specified user.
 * @param {AV.User} user The specified AV.User pointer.
 * @param {Object} [options]
 * @param {string[]} [options.statisticNames] Specify the statisticNames. If not set, all statistics of the user will be fetched.
 * @param {AuthOptions} [authOptions]
 * @return {Promise<Statistic[]>}
 */
AV.Leaderboard.getStatistics = (user, { statisticNames } = {}, authOptions) =>
  Promise.resolve().then(() => {
    if (!(user && user.id)) throw new Error('user must be an AV.User');
    return request({
      method: 'GET',
      path: `/leaderboard/users/${user.id}/statistics`,
      query: {
        statistics: statisticNames
          ? ensureArray(statisticNames).join(',')
          : undefined,
      },
      authOptions,
    }).then(({ results }) => results.map(parseStatisticData));
  });
/**
 * Update Statistics for the specified user.
 * @param {AV.User} user The specified AV.User pointer.
 * @param {Object} statistics A name-value pair representing the statistics to update.
 * @param {AuthOptions} [authOptions]
 * @return {Promise<Statistic[]>}
 */
AV.Leaderboard.updateStatistics = (user, statistics, authOptions) =>
  Promise.resolve().then(() => {
    if (!(user && user.id)) throw new Error('user must be an AV.User');
    const data = _.map(statistics, (value, key) => ({
      statisticName: key,
      statisticValue: value,
    }));
    return request({
      method: 'POST',
      path: `/leaderboard/users/${user.id}/statistics`,
      data,
      authOptions,
    }).then(({ results }) => results.map(parseStatisticData));
  });

_.extend(
  Leaderboard.prototype,
  /** @lends AV.Leaderboard.prototype */ {
    _finishFetch(data) {
      _.forEach(data, (value, key) => {
        if (key === 'updatedAt' || key === 'objectId') return;
        if (key === 'expiredAt') {
          key = 'nextResetAt';
        }
        if (key === 'createdAt') {
          value = parseDate(value);
        }
        if (value && value.__type === 'Date') {
          value = parseDate(value.iso);
        }
        this[key] = value;
      });
      return this;
    },
    /**
     * Fetch data from the srever.
     * @param {AuthOptions} [authOptions]
     * @return {Promise<AV.Leaderboard>}
     */
    fetch(authOptions) {
      return request({
        method: 'GET',
        path: `/leaderboard/leaderboards/${this.statisticName}`,
        authOptions,
      }).then(data => this._finishFetch(data));
    },
    _getResults(
      { skip, limit, selectUserKeys, includeStatistics },
      authOptions,
      self
    ) {
      return request({
        method: 'GET',
        path: `/leaderboard/leaderboards/${this.statisticName}/ranks${
          self ? '/self' : ''
        }`,
        query: {
          skip,
          limit,
          includeUser: selectUserKeys
            ? ensureArray(selectUserKeys).join(',')
            : undefined,
          includeStatistics: includeStatistics
            ? ensureArray(includeStatistics).join(',')
            : undefined,
        },
        authOptions,
      }).then(({ results: rankings }) =>
        rankings.map(rankingData => {
          const {
            user,
            statisticValue: value,
            rank,
            statistics = [],
          } = AV._decode(rankingData);
          return {
            user,
            value,
            rank,
            includedStatistics: statistics.map(parseStatisticData),
          };
        })
      );
    },
    /**
     * Retrieve a list of ranked users for this Leaderboard.
     * @param {Object} [options]
     * @param {number} [options.skip] The number of results to skip. This is useful for pagination.
     * @param {number} [options.limit] The limit of the number of results.
     * @param {string[]} [options.selectUserKeys] Specify keys of the users to include
     * @param {string[]} [options.includeStatistics] Specify other statistics to include in the Rankings
     * @param {AuthOptions} [authOptions]
     * @return {Promise<Ranking[]>}
     */
    getResults(
      { skip, limit, selectUserKeys, includeStatistics } = {},
      authOptions
    ) {
      return this._getResults(
        { skip, limit, selectUserKeys, includeStatistics },
        authOptions
      );
    },
    /**
     * Retrieve a list of ranked users for this Leaderboard, centered on the specified user.
     * @param {Object} [options]
     * @param {number} [options.limit] The limit of the number of results.
     * @param {string[]} [options.selectUserKeys] Specify keys of the users to include
     * @param {string[]} [options.includeStatistics] Specify other statistics to include in the Rankings
     * @param {AuthOptions} [authOptions]
     * @return {Promise<Ranking[]>}
     */
    getResultsAroundUser(
      { limit, selectUserKeys, includeStatistics } = {},
      authOptions
    ) {
      return this._getResults(
        { limit, selectUserKeys, includeStatistics },
        authOptions,
        true
      );
    },
    _update(data, authOptions) {
      return request({
        method: 'PUT',
        path: `/leaderboard/leaderboards/${this.statisticName}`,
        data,
        authOptions,
      }).then(result => this._finishFetch(result));
    },
    /**
     * (masterKey required) Update the version change interval of the Leaderboard.
     * @param {AV.LeaderboardVersionChangeInterval} versionChangeInterval
     * @param {AuthOptions} [authOptions]
     * @return {Promise<AV.Leaderboard>}
     */
    updateVersionChangeInterval(versionChangeInterval, authOptions) {
      return this._update({ versionChangeInterval }, authOptions);
    },
    /**
     * (masterKey required) Update the version change interval of the Leaderboard.
     * @param {AV.LeaderboardUpdateStrategy} updateStrategy
     * @param {AuthOptions} [authOptions]
     * @return {Promise<AV.Leaderboard>}
     */
    updateUpdateStrategy(updateStrategy, authOptions) {
      return this._update({ updateStrategy }, authOptions);
    },
    /**
     * (masterKey required) Reset the Leaderboard. The version of the Leaderboard will be incremented by 1.
     * @param {AuthOptions} [authOptions]
     * @return {Promise<AV.Leaderboard>}
     */
    reset(authOptions) {
      return request({
        method: 'PUT',
        path: `/leaderboard/leaderboards/${
          this.statisticName
        }/incrementVersion`,
        authOptions,
      }).then(data => this._finishFetch(data));
    },
    /**
     * (masterKey required) Delete the Leaderboard and its all archived versions.
     * @param {AuthOptions} [authOptions]
     * @return {void}
     */
    destroy(authOptions) {
      return AV.request({
        method: 'DELETE',
        path: `/leaderboard/leaderboards/${this.statisticName}`,
        authOptions,
      }).then(() => undefined);
    },
  }
);

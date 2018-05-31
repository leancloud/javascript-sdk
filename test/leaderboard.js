const statisticName = `score_${Date.now()}`;

describe('Leaderboard', () => {
  before(function setUpLeaderboard() {
    return AV.Leaderboard.createLeaderboard(
      {
        statisticName,
        updateStrategy: AV.LeaderboardUpdateStrategy.BETTER,
        order: AV.LeaderboardOrder.ASCENDING,
        versionChangeInterval: AV.LeaderboardVersionChangeInterval.WEEK,
      },
      {
        useMasterKey: true,
      }
    ).then(leaderboard => {
      this.leaderboard = leaderboard;
    });
  });

  function validateLeaderboard(leaderboard) {
    leaderboard.should.be.instanceof(AV.Leaderboard);
    leaderboard.statisticName.should.be.eql(statisticName);
    leaderboard.updateStrategy.should.be.eql(
      AV.LeaderboardUpdateStrategy.BETTER
    );
    leaderboard.versionChangeInterval.should.be.eql(
      AV.LeaderboardVersionChangeInterval.WEEK
    );
    leaderboard.order.should.be.eql(AV.LeaderboardOrder.ASCENDING);
    leaderboard.version.should.be.eql(0);
    leaderboard.nextResetAt.should.be.a.Date();
  }

  it('shoud have properties', function() {
    validateLeaderboard(this.leaderboard);
  });

  it('query', () =>
    AV.Leaderboard.getLeaderboard(statisticName).then(validateLeaderboard));

  it('mutation by client should be rejected', function() {
    return this.leaderboard
      .updateVersionChangeInterval(AV.LeaderboardVersionChangeInterval.NEVER)
      .should.be.rejected();
  });
  it('mutation with masterKey', function() {
    return this.leaderboard
      .updateVersionChangeInterval(AV.LeaderboardVersionChangeInterval.DAY, {
        useMasterKey: true,
      })
      .then(leaderboard => {
        leaderboard.versionChangeInterval.should.be.eql(
          AV.LeaderboardVersionChangeInterval.DAY
        );
      });
  });
  it('mutation with masterKey', function() {
    return this.leaderboard
      .updateUpdateStrategy(AV.LeaderboardUpdateStrategy.LAST, {
        useMasterKey: true,
      })
      .then(leaderboard => {
        leaderboard.updateStrategy.should.be.eql(
          AV.LeaderboardUpdateStrategy.LAST
        );
      });
  });

  describe('Statistics', function() {
    let users;
    let currentUser;
    let stats;
    before(() =>
      Promise.all(
        ['0', '1', '2', '3'].map(value =>
          AV.User.signUp(Date.now() + value, Date.now() + value)
        )
      )
        .then(result => {
          users = result;
          currentUser = users[2];
          return Promise.all(
            users.map((user, index) =>
              AV.Leaderboard.updateStatistics(
                user,
                { [statisticName]: index },
                {
                  user,
                }
              )
            )
          );
        })
        .then(result => {
          stats = result[2];
        })
    );

    after(() =>
      Promise.all(users.map(user => user.destroy({ useMasterKey: true })))
    );

    function validateStatistic(statistic) {
      statistic.name.should.eql(statisticName);
      statistic.value.should.eql(2);
      statistic.user.id.should.eql(currentUser.id);
    }

    it('shoud have properties', () => {
      const statistic = stats[0];
      validateStatistic(statistic);
      statistic.version.should.eql(0);
    });

    it('get statistics', () =>
      AV.Leaderboard.getStatistics(currentUser, undefined, {
        user: currentUser,
      }).then(statistics => {
        statistics.should.be.an.Array();
        validateStatistic(statistics[0]);
        statistics[0].version.should.eql(0);
      }));

    it('getResults', function() {
      const leaderboard = this.leaderboard;
      return leaderboard
        .getResults({ includeUserKeys: ['username'] })
        .then(statistics => {
          statistics.should.be.an.Array();
          statistics.should.be.length(4);
          statistics
            .map(statistic => statistic.position)
            .should.eql([0, 1, 2, 3]);
          validateStatistic(statistics[2]);
          statistics[2].user
            .get('username')
            .should.be.eql(currentUser.get('username'));
        });
    });
    it('getResultsAroundUser', function() {
      const leaderboard = this.leaderboard;
      return leaderboard
        .getResultsAroundUser({ limit: 3 }, { user: currentUser })
        .then(statistics => {
          statistics.should.be.an.Array();
          statistics.should.be.length(3);
          validateStatistic(statistics[1]);
          statistics.map(statistic => statistic.position).should.eql([1, 2, 3]);
        });
    });
  });

  after(function() {
    return this.leaderboard.destroy({ useMasterKey: true });
  });
});

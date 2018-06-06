const statisticName = `score_${Date.now()}`;
const statisticName2 = `score_${Date.now()}_2`;

describe('Leaderboard', () => {
  before(function setUpLeaderboard() {
    return Promise.all([
      AV.Leaderboard.createLeaderboard(
        {
          statisticName,
          updateStrategy: AV.LeaderboardUpdateStrategy.BETTER,
          order: AV.LeaderboardOrder.ASCENDING,
          versionChangeInterval: AV.LeaderboardVersionChangeInterval.WEEK,
        },
        {
          useMasterKey: true,
        }
      ),
      AV.Leaderboard.createLeaderboard(
        {
          statisticName: statisticName2,
          updateStrategy: AV.LeaderboardUpdateStrategy.BETTER,
          order: AV.LeaderboardOrder.ASCENDING,
          versionChangeInterval: AV.LeaderboardVersionChangeInterval.NEVER,
        },
        {
          useMasterKey: true,
        }
      ),
    ]).then(([leaderboard, leaderboard2]) => {
      this.leaderboard = leaderboard;
      this.leaderboard2 = leaderboard2;
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
                { [statisticName]: index, [statisticName2]: -index },
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
        const score = statistics.find(
          statistic => statistic.name === statisticName
        );
        validateStatistic(score);
        score.version.should.eql(0);
      }));

    it('getResults', function() {
      const leaderboard = this.leaderboard;
      return leaderboard
        .getResults({
          selectUserKeys: ['username'],
          includeStatistics: [statisticName2],
        })
        .then(rankings => {
          rankings.should.be.an.Array();
          rankings.should.be.length(4);
          rankings.map(ranking => ranking.rank).should.eql([0, 1, 2, 3]);
          rankings[2].value.should.eql(2);
          rankings[2].user
            .get('username')
            .should.be.eql(currentUser.get('username'));
          rankings[2].includedStatistics.should.be.an.Array();
          rankings[2].includedStatistics[0].name.should.be.eql(statisticName2);
        });
    });
    it('include a non-exist statistic should throw', function() {
      const leaderboard = this.leaderboard;
      return leaderboard
        .getResults({
          includeStatistics: ['fake'],
        })
        .should.be.rejected();
    });
    it('getResultsAroundUser', function() {
      const leaderboard = this.leaderboard;
      return leaderboard
        .getResultsAroundUser({ limit: 3 }, { user: currentUser })
        .then(rankings => {
          rankings.should.be.an.Array();
          rankings.should.be.length(3);
          rankings[1].value.should.eql(2);
          expect(rankings[1].user.get('username')).to.be(undefined);
          rankings[1].includedStatistics.should.be.an.Array();
          rankings.map(ranking => ranking.rank).should.eql([1, 2, 3]);
        });
    });
  });

  after(function() {
    return Promise.all([
      this.leaderboard.destroy({ useMasterKey: true }),
      this.leaderboard2.destroy({ useMasterKey: true }),
    ]);
  });
});

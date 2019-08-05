const statisticName = `score_${Date.now()}`;
const statisticName2 = `score_${Date.now()}_2`;

const Company = AV.Object.extend('Company');

describe('Leaderboard', () => {
  before(async function setUpLeaderboard() {
    const [leaderboard, leaderboard2] = await Promise.all([
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
    ]);
    this.leaderboard = leaderboard;
    this.leaderboard2 = leaderboard2;
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
  it('getArchives', function() {
    return this.leaderboard.getArchives(undefined, {
      useMasterKey: true,
    });
  });

  describe('Statistics', function() {
    let users;
    let currentUser;
    let stats;
    before(async () => {
      const company = await new Company({ name: 'LeanCloud' }).save();
      users = await Promise.all(
        ['0', '1', '2', '3'].map(value =>
          new AV.User({ company })
            .setUsername(Date.now() + value)
            .setPassword(Date.now() + value)
            .signUp()
        )
      );
      currentUser = users[2];
      stats = (await Promise.all(
        users.map((user, index) =>
          AV.Leaderboard.updateStatistics(
            user,
            { [statisticName]: index, [statisticName2]: -index },
            {
              user,
            }
          )
        )
      ))[2];
    });

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

    it('count', function() {
      return this.leaderboard.count().then(count => count.should.be.eql(4));
    });

    it('getResults', function() {
      const leaderboard = this.leaderboard;
      return leaderboard
        .getResults({
          selectUserKeys: ['username'],
          includeUserKeys: 'company',
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
          const company = rankings[2].user.get('company');
          company.should.be.instanceof(Company);
          company.get('name').should.be.eql('LeanCloud');
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
    it('get results around user', function() {
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
    it('get results around a specified user', function() {
      const leaderboard = this.leaderboard;
      return leaderboard
        .getResultsAroundUser(users[1], { limit: 3 }, { user: currentUser })
        .then(rankings => {
          rankings.should.be.an.Array();
          rankings.should.be.length(3);
          rankings[1].value.should.eql(1);
          expect(rankings[1].user.get('username')).to.be(undefined);
          rankings[1].includedStatistics.should.be.an.Array();
          rankings.map(ranking => ranking.rank).should.eql([0, 1, 2]);
        });
    });
    it('delete statistics', function() {
      const leaderboard = this.leaderboard;
      return AV.Leaderboard.deleteStatistics(currentUser, statisticName, {
        user: currentUser,
      })
        .then(() => leaderboard.getResults())
        .then(rankings => rankings.should.be.length(3));
    });
  });

  after(function() {
    return Promise.all([
      this.leaderboard.destroy({ useMasterKey: true }),
      this.leaderboard2.destroy({ useMasterKey: true }),
    ]);
  });
});

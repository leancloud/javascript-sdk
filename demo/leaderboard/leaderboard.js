let configs = {};
try {
  configs = JSON.parse(localStorage.getItem('js-sdk-demo/configs')) || {};
} catch (e) {}

const {
  appId = 'FNHw86LIu6lnFToIEDemKCQl-gzGzoHsz',
  appKey = 'DyvpOorH5HK1CVLDqDhb4gNT',
} = configs;

AV.init({
  appId,
  appKey,
});

const MAX_RESULTS_COUNT = 12;

const leaderboard = AV.Leaderboard.createWithoutData('score');

Vue.component('animated-integer', {
  template: '<span>{{ tweeningValue }}</span>',
  props: {
    value: {
      type: Number,
      required: true,
    },
  },
  data: function() {
    return {
      tweeningValue: this.value,
    };
  },
  watch: {
    value: function(newValue, oldValue) {
      this.tween(oldValue, newValue);
    },
  },
  methods: {
    tween: function(startValue, endValue) {
      var vm = this;
      function animate() {
        if (TWEEN.update()) {
          requestAnimationFrame(animate);
        }
      }

      new TWEEN.Tween({ tweeningValue: startValue })
        .to({ tweeningValue: endValue }, 500)
        .onUpdate(function(object) {
          vm.tweeningValue = object.tweeningValue.toFixed(0);
        })
        .start();

      animate();
    },
  },
});

var app = new Vue({
  data: {
    rankings: [],
    score: null,
    highScore: 0,
    newHighScore: false,
    username: '',
    password: '',
    user: {},
    rolling: false,
    nextResetAt: null,
  },

  created: function() {
    var user = AV.User.current();
    if (user) {
      this.user = user.toJSON();
    } else {
      this.fetchResults();
    }
    leaderboard
      .fetch()
      .then(
        () => (this.nextResetAt = leaderboard.nextResetAt.toLocaleString())
      );
  },

  watch: {
    'user.objectId': {
      handler: function(id) {
        this.fetchResults();
        if (!id) {
          this.score = null;
          this.highScore = 0;
          this.newHighScore = false;
        }
      },
    },
  },

  methods: {
    roll() {
      if (this.rolling) return;
      this.rolling = true;
      this.newHighScore = false;
      setTimeout(() => {
        this.score = Math.ceil(Math.pow(Math.random(), 2) * 1000);
        if (this.score > this.highScore) {
          this.newHighScore = true;
          this.highScore = this.score;
          this.updateScore(this.score);
        }
        this.rolling = false;
      }, 1000);
    },

    updateScore(score) {
      AV.Leaderboard.updateStatistics(AV.User.current(), {
        score,
      })
        .then(this.fetchResults.bind(this))
        .catch(alert);
    },

    fetchResults: function() {
      console.log('fetch results');
      Promise.all([
        leaderboard.getResults({
          limit: MAX_RESULTS_COUNT,
          selectUserKeys: ['username'],
        }),
        Promise.resolve(AV.User.current()).then(
          currentUser =>
            currentUser
              ? leaderboard.getResultsAroundUser(currentUser, {
                  limit: 3,
                  selectUserKeys: ['username'],
                })
              : []
        ),
      ])
        .then(([topRankings, [beforeUserRankings, userRanking]]) => {
          console.log(topRankings, [beforeUserRankings, userRanking]);
          let rankings;
          if (userRanking && userRanking.rank >= MAX_RESULTS_COUNT) {
            rankings = [
              ...topRankings.slice(0, -2),
              beforeUserRankings,
              userRanking,
            ];
          } else {
            rankings = topRankings;
          }
          this.rankings = JSON.parse(JSON.stringify(rankings));
          if (userRanking) {
            this.highScore = userRanking.value;
          }
        })
        .catch(console.error);
    },

    login: function() {
      AV.User.logIn(this.username, this.password)
        .then(
          function(user) {
            this.user = user.toJSON();
            this.username = this.password = '';
          }.bind(this)
        )
        .catch(alert);
    },

    signup: function() {
      AV.User.signUp(this.username, this.password)
        .then(
          function(user) {
            this.user = user.toJSON();
            this.username = this.password = '';
          }.bind(this)
        )
        .catch(alert);
    },

    logout: function() {
      AV.User.logOut();
      this.user = {};
    },
  },
});

// mount
app.$mount('#app');

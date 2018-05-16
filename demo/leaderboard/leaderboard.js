AV.init({
  appId: 'FNHw86LIu6lnFToIEDemKCQl-gzGzoHsz',
  appKey: 'DyvpOorH5HK1CVLDqDhb4gNT',
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
    statistics: [],
    score: null,
    hightScore: 0,
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
          this.hightScore = 0;
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
        if (this.score > this.hightScore) {
          this.newHighScore = true;
          this.hightScore = this.score;
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
          includeUserKeys: ['username'],
        }),
        Promise.resolve(
          AV.User.current()
            ? leaderboard.getResultsAroundUser({
                limit: 3,
                includeUserKeys: ['username'],
              })
            : []
        ),
      ])
        .then(([tops, [beforeUser, user]]) => {
          console.log(tops, [beforeUser, user]);
          let statistics;
          if (user && user.position >= MAX_RESULTS_COUNT) {
            statistics = [...tops.slice(0, -2), beforeUser, user];
          } else {
            statistics = tops;
          }
          this.statistics = JSON.parse(JSON.stringify(statistics));
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

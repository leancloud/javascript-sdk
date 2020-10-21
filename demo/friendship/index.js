const events = [];
const listeners = [];

function broadcast(event, value) {
  events.push([event, value]);
  listeners.forEach((listener) => listener(event, value));
}

Vue.component('friend-request-to', {
  template: '#friend-request-to',
  props: ['username', 'status'],
});

Vue.component('friend-request-from', {
  template: '#friend-request-from',
  props: ['username', 'status'],
});

Vue.filter('statusName', (value) => {
  switch (value) {
    case 'pending':
      return '待验证';
    case 'accept':
      return '已添加';
    case 'decline':
      return '已拒绝';
  }
});

function createApp(el) {
  return new Vue({
    el,
    template: '#friend-demo',
    data: {
      username: '',
      password: '',
      tabIndex: 0,
      user: null,
      tabIndex: 0,
      targetObjectId: '',
      myRequests: [],
      requests: [],
      tip: '',
    },
    mounted() {
      const listener = (e, { from, to }) => {
        if (to.objectId === this.$data.user.objectId) {
          switch (e) {
            case 'request':
              this.$data.requests.push({ ...from, status: 'pending' });
              break;
            case 'accept':
              {
                const req = this.$data.myRequests.find((req) => req.objectId === from.objectId);
                if (req) {
                  req.status = 'accept';
                }
              }
              break;
            case 'decline':
              {
                const req = this.$data.myRequests.find((req) => req.objectId === from.objectId);
                if (req) {
                  req.status = 'decline';
                }
              }
              break;
          }
        }
      };
      listeners.push(listener);
    },
    methods: {
      handleLogin() {
        const { username, password } = this.$data;
        if (!username || !password) {
          this.$data.tip = '请输入用户名和密码';
          return;
        }
        this.$data.user = {
          username,
          objectId: Math.random().toString(36).slice(-8),
        };
      },
      handleSignUp() {
        const { username, password } = this.$data;
        if (!username || !password) {
          this.$data.tip = '请输入用户名和密码';
          return;
        }
        this.$data.user = { username, password };
      },
      handleSendRequest() {
        const { targetObjectId } = this.$data;
        if (!targetObjectId) {
          this.$data.tip = '请输入对方的 objectId';
          return;
        }
        if (targetObjectId === this.$data.user.objectId) {
          this.$data.tip = '不能添加自己为好友';
          return;
        }
        this.$data.targetObjectId = '';
        const req = {
          from: this.$data.user,
          to: { objectId: targetObjectId },
        };
        broadcast('request', req);
        this.$data.myRequests.push({ ...req.to, status: 'pending' });
      },
      handleAccept(user) {
        broadcast('accept', {
          from: this.$data.user,
          to: user,
        });
        user.status = 'accept';
      },
      handleDecline(user) {
        broadcast('decline', {
          from: this.$data.user,
          to: user,
        });
        user.status = 'decline';
      },
    },
  });
}

const app1 = createApp('#app1');
const app2 = createApp('#app2');

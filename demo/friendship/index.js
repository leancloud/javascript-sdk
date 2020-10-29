Vue.component('friend-item', {
  template: '#friend-item',
  props: ['username'],
});

Vue.component('request-item', {
  template: '#request-item',
  props: ['username', 'status'],
});

Vue.filter('statusName', (value) => {
  switch (value) {
    case 'pending':
      return '待验证';
    case 'accepted':
      return '已接受';
    case 'declined':
      return '已拒绝';
  }
});

const lcApp = new LC.App({
  appId: 'R5EkvLasr16SMD4sJs3PROCf-gzGzoHsz',
  appKey: 'KF3a4Xvk2HTcERPya1rSL9Fs',
  serverURL: 'https://r5ekvlas.lc-cn-n1-shared.com',
});

const User = new LC.User(lcApp);
const Friendship = new LC.Friendship(lcApp);

function getErrorMessage(error) {
  if (!(error instanceof Error)) {
    return error.toString();
  }
  if (typeof error.error === 'string') {
    return error.error;
  } else {
    return error.message;
  }
}

function createApp(el) {
  return new Vue({
    el,
    template: '#friend-demo',
    data: {
      tabIndex: 0,
      username: '',
      password: '',
      user: null,
      targetUsername: '',
      friends: [],
      requests: [],
      tip: '',
    },
    methods: {
      upsertFriend(newFriend) {
        for (let i = 0; i < this.$data.friends.length; ++i) {
          const friend = this.$data.friends[i];
          if (friend.objectId === newFriend.objectId) {
            Object.assign(friend, newFriend);
            return;
          }
        }
        this.$data.friends.push(newFriend);
      },
      upsertRequest(newRequest) {
        for (let i = 0; i < this.$data.requests.length; ++i) {
          const request = this.$data.requests[i];
          if (request.objectId === newRequest.objectId) {
            Object.assign(request, newRequest);
            return;
          }
        }
        this.$data.requests.unshift(newRequest);
      },
      removeFriend(objectId) {
        for (let i = 0; i < this.$data.friends.length; ++i) {
          const friend = this.$data.friends[i];
          if (friend.objectId === newFriend.objectId) {
            this.$data.friends.splice(i, 1);
            return;
          }
        }
      },
      async fetchFriends() {
        const friends = await Friendship.getFriends(this.user);
        friends.forEach((friend) =>
          this.upsertFriend({
            objectId: friend.objectId,
            username: friend.username,
          })
        );
      },
      async fetchRequests() {
        const requests = await Friendship.getReceivedRequests(this.user, 'all', {
          include: 'user',
        });
        requests.forEach((request) =>
          this.upsertRequest({
            objectId: request.objectId,
            username: request.user.username,
            status: request.status,
          })
        );
      },
      async subscribeFriendChange() {
        const query = Friendship.getFriendQuery(this.user);
        const liveQuery = await query.subscribe();
        const handleRequestAccepted = async (request) => {
          const friend = await User.object(request.data.followee.objectId).get();
          this.upsertFriend({
            objectId: request.data.followee.objectId,
            username: friend.username,
          });
        };
        liveQuery.on('create', () => console.log('create'));
        liveQuery.on('enter', () => console.log('enter'));
        liveQuery.on('update', () => console.log('update'));
      },
      async subscribeRequestChange() {
        const query = Friendship.getReceivedRequestQuery(this.user);
        const liveQuery = await query.subscribe();
        liveQuery.on('create', async (request) => {
          const user = await User.object(request.user.objectId).get();
          this.upsertRequest({
            objectId: request.objectId,
            username: user.username,
            status: request.status,
          });
        });
      },
      async handleLogin() {
        const { username, password } = this.$data;
        if (!username || !password) {
          this.$data.tip = '请输入用户名和密码';
          return;
        }
        try {
          this.$data.user = await User.login(username, password);
          this.fetchFriends();
          this.fetchRequests();
          this.subscribeFriendChange();
          this.subscribeRequestChange();
        } catch (error) {
          this.$data.tip = getErrorMessage(error);
        }
      },
      async handleSignUp() {
        const { username, password } = this.$data;
        if (!username || !password) {
          this.$data.tip = '请输入用户名和密码';
          return;
        }
        try {
          this.$data.user = await User.signUp({ username, password });
        } catch (error) {
          this.$data.tip = getErrorMessage(error);
        }
      },
      async handleSendRequest() {
        const { targetUsername } = this.$data;
        if (!targetUsername) {
          this.$data.tip = '请输入对方的用户名';
          return;
        }
        try {
          const target = await User.where('username', '==', targetUsername).first();
          if (!target) {
            this.$data.tip = '查无此人';
            return;
          }
          await Friendship.request(this.user, target.objectId);
          this.$data.tip = '请求已发送，等待对方确认';
          this.$data.targetUsername = '';
        } catch (error) {
          this.$data.tip = getErrorMessage(error);
        }
      },
      handleAccept(request) {
        request.status = 'accepted';
        Friendship.acceptRequest(this.user, request.objectId);
      },
      handleDecline(request) {
        request.status = 'declined';
        Friendship.declineRequest(this.user, request.objectId);
      },
    },
  });
}

const app1 = createApp('#app1');
const app2 = createApp('#app2');

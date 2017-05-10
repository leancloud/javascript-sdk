var AV;

// 检测是否在 Nodejs 环境下运行
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  AV = require('../live-query');
} else {
  AV = window.AV;
}

// 初始化
var appId = 'a5CDnmOX94uSth8foK9mjHfq-gzGzoHsz';
var appKey = 'Ue3h6la9zH0IxkUJmyhLjk9h';
var region = 'cn';

// const appId = 'QvNM6AG2khJtBQo6WRMWqfLV-gzGzoHsz';
// const appKey = 'be2YmUduiuEnCB2VR9bLRnnV';
// const region = 'us';

AV.init({ appId: appId, appKey: appKey, region: region });

av.Captcha.request().then(captcha => {
  captcha.bind({
    textInput: 'code',
    image: 'captcha',
    verifyButton: 'verify',
  }, {
    success: validateCode => console.log('validateCode: ' + validateCode),
    error: console.error,
  });
});
new AV.Query('Todo').subscribe().then(subscription => {
  subscription.on('create', console.log);
  subscription.on('update', console.log);
  subscription.on('delete', console.log);
  // subscription.unsubscribe();
});

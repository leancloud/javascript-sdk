var av = void 0;

// 检测是否在 Nodejs 环境下运行
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  av = require('../dist/node/av');
} else {
  av = window.AV;
}

// 初始化
var appId = 'a5CDnmOX94uSth8foK9mjHfq-gzGzoHsz';
var appKey = 'Ue3h6la9zH0IxkUJmyhLjk9h';
var region = 'cn';

// const appId = 'QvNM6AG2khJtBQo6WRMWqfLV-gzGzoHsz';
// const appKey = 'be2YmUduiuEnCB2VR9bLRnnV';
// const region = 'us';

av.init({ appId: appId, appKey: appKey, region: region });

let captchaToken;
const captchaImage = document.getElementById('captcha');
const captchaInput = document.getElementById('code');

function refreshCaptcha(){
  AV.Cloud.requestCaptcha({
    size: 6,
    ttl: 30,
  }).then(function(data) {
    captchaToken = data.captchaToken;
    captchaImage.src = data.url;
  }).catch(console.error);
}
refreshCaptcha();

function verify() {
  AV.Cloud.verifyCaptcha(captchaInput.value, captchaToken).then(function(validateCode) {
    console.log('validateCode: ' + validateCode);
  }, console.error);
}

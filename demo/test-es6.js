/*
  请参考 README.md 中的开发方式，
  执行 gulp dev 该文件会被编译为 test-es5.js 并自动运行此文件
*/

/* eslint no-console: ["error", { allow: ["log"] }] */
/* eslint no-undef: ["error", { "AV": true }] */

'use strict';

let global = global || window;
let AV = global.AV || {};

// 检测是否在 Nodejs 环境下运行
if (typeof(process) !== 'undefined' && process.versions && process.versions.node) {
  AV = require('../dist/node/av');
}

// 初始化
const appId = 'a5CDnmOX94uSth8foK9mjHfq-gzGzoHsz';
const appKey = 'Ue3h6la9zH0IxkUJmyhLjk9h';
const region = 'cn';

// const appId = 'QvNM6AG2khJtBQo6WRMWqfLV-gzGzoHsz';
// const appKey = 'be2YmUduiuEnCB2VR9bLRnnV';
// const region = 'us';

AV.init({ appId, appKey, region });

// 基本存储
const TestClass = AV.Object.extend('TestClass');
const testObj = new TestClass();
testObj.set({
  name: 'hjiang',
  phone: '123123123',
});

testObj.save().then(() => {
  console.log('success');
}).catch((err) => {
  console.log('failed');
  console.log(err);
});

// 存储文件
const base64 = 'd29ya2luZyBhdCBhdm9zY2xvdWQgaXMgZ3JlYXQh';
const file = new AV.File('myfile.txt', { base64 });
file.metaData('format', 'txt file');
file.save().then(() => {
  console.log(file.get('url'));
}).catch((error) => {
  console.log(error);
});

// 查找文件
const query = new AV.Query(TestClass);
query.equalTo('name', 'hjiang');
query.find().then((list) => {
  console.log(list);
});

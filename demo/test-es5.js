'use strict';

// 初始化
var appId = 'a5CDnmOX94uSth8foK9mjHfq-gzGzoHsz';
var appKey = 'Ue3h6la9zH0IxkUJmyhLjk9h';
AV.init({
  appId: appId,
  appKey: appKey
});

// 基本存储
var TestClass = AV.Object.extend('TestClass');
var testObj = new TestClass();
testObj.set({
  name: 'hjiang',
  phone: '123123123'
});

testObj.save().then(function () {
  console.log('success');
}).catch(function (err) {
  console.log('failed');
  console.log(err);
});

// 存储文件
var base64 = 'd29ya2luZyBhdCBhdm9zY2xvdWQgaXMgZ3JlYXQh';
var file = new AV.File('myfile.txt', { base64: base64 });
file.metaData('format', 'txt file');
file.save().then(function (data) {
  console.log(data);
}).catch(function (error) {
  console.log(error);
});

// 查找文件
var query = new AV.Query(TestClass);
query.equalTo('name', 'hjiang');
query.find().then(function (list) {
  console.log(list);
});
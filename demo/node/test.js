// Nodejs 4.x 版本已经支持 EcmaScript2015 (ES6)

const AV = require('../../dist/node/av');

// 初始化
const appId = 'a5CDnmOX94uSth8foK9mjHfq-gzGzoHsz';
const appKey = 'Ue3h6la9zH0IxkUJmyhLjk9h';

AV.init({ appId, appKey });

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
  console.log('success');
}).catch((error) => {
  console.log(error);
});

// 查找文件
const query = new AV.Query(TestClass);
query.equalTo('name', 'hjiang');
query.find().then(() => {
  console.log('success');
});

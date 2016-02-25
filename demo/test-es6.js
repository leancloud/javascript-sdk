// 初始化
const appId = 'a5CDnmOX94uSth8foK9mjHfq-gzGzoHsz';
const appKey = 'Ue3h6la9zH0IxkUJmyhLjk9h';
AV.init({
  appId: appId,
  appKey: appKey
});

const TestClass = AV.Object.extend('TestClass');
const testObj = new TestClass();
testObj.set({
  name: 'hjiang',
  phone: '123123123'
});
testObj.save().then(() => {
  console.log('success');
}).catch((err) => {
  console.log('failed');
  console.log(err);
});

const base64 = 'd29ya2luZyBhdCBhdm9zY2xvdWQgaXMgZ3JlYXQh';
var file = new AV.File('myfile.txt', { base64: base64 });
file.metaData('format', 'txt file');
file.save().then((data) => {
  console.log(data);
}).catch((error) => {
  console.log(error);
});


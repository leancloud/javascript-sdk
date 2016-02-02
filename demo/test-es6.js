// 初始化
const appId = 'a5CDnmOX94uSth8foK9mjHfq-gzGzoHsz';
const appKey = 'Ue3h6la9zH0IxkUJmyhLjk9h';
AV.init({
  appId: appId,
  appKey: appKey
});
// AV.initialize(appId, appKey);

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

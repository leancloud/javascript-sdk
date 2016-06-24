var Cache = AV.Cache;
var wait = function wait(time) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, time);
  });
};

describe('Cache async', function () {
  var getValue = function getValue() {
    return Cache.getAsync('__test');
  };
  it('get/set async', function () {
    return Cache.setAsync('__test', 1).then(getValue).then(function (value) {
      expect(value).to.be(1);
      return Cache.setAsync('__test', '1', 100).then(getValue);
    }).then(function (value) {
      expect(value).to.be('1');
      return wait(110).then(getValue);
    }).then(function (value) {
      expect(value).to.be(null);
    });
  });
});

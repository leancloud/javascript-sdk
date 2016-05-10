var Cache = AV.Cache;
var wait = function wait(time) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, time);
  });
};

describe('Cache', function () {
  var getValue = function getValue() {
    return Cache.get('__test');
  };
  it('get/set', function () {
    return Cache.set('__test', 1).then(getValue).then(function (value) {
      expect(value).to.be(1);
      return Cache.set('__test', '1', 100).then(getValue);
    }).then(function (value) {
      expect(value).to.be('1');
      return wait(110).then(getValue);
    }).then(function (value) {
      expect(value).to.be(null);
    });
  });
});

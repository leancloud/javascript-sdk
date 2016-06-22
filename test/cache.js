var Cache = AV.Cache;
var wait = function wait(time) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, time);
  });
};

describe('Cache sync', function () {
  var getValue = function getValue() {
    return Cache.get('__test');
  };
  it('get/set sync', function () {
    Cache.set('__test', 1);
    var value = getValue();
    expect(value).to.be(1);
    Cache.set('__test', '1', 100);
    value = getValue();
    expect(value).to.be('1');
    wait(110).then(getValue)
    .then(function(data) {
      expect(data).to.be(null);
    });
  });
});

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

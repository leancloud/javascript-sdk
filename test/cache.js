var Cache = AV.Cache;
const wait = time => new Promise(resolve => setTimeout(resolve, time));

describe('Cache', () => {
  const getValue = () => Cache.get('__test');
  it('get/set', () =>
    Cache.set('__test', 1).then(getValue).then(value => {
      expect(value).to.be(1);
      return Cache.set('__test', '1', 100).then(getValue);
    }).then(value => {
      expect(value).to.be('1');
      return wait(110).then(getValue);
    }).then(value => {
      expect(value).to.be(null);
    })
  );
});

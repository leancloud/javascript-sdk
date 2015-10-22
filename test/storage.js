var Storage = AV.localStorage;
var testKey = '__test__';

describe('Storage', function() {
  describe('sync', function() {
    it('set, get', function() {
      Storage.setItem(testKey, testKey);
      var result = Storage.getItem(testKey);
      expect(result).to.be(testKey);
    });
    it('remove', function() {
      Storage.setItem(testKey, testKey);
      Storage.removeItem(testKey);
      var result = Storage.getItem(testKey);
      expect(result).to.be(null);
    });
    it('clear', function() {
      Storage.setItem(testKey, testKey);
      Storage.clear();
      var result = Storage.getItem(testKey);
      expect(result).to.be(null);
    });
  });

  describe('async', function() {
    it('set, get', function(done) {
      Storage.setItemAsync(testKey, testKey).then(function() {
        return Storage.getItem(testKey);
      }).then(function(result) {
        expect(result).to.be(testKey);
        done();
      });
    });
    it('remove', function(done) {
      Storage.setItemAsync(testKey, testKey).then(function() {
        return Storage.removeItemAsync(testKey);
      }).then(function() {
        return Storage.getItemAsync(testKey);
      }).then(function(result) {
        expect(result).to.be(null);
        done();
      });
    });
    it('clear', function(done) {
      Storage.setItemAsync(testKey, testKey).then(function() {
        return Storage.clearAsync(testKey);
      }).then(function() {
        return Storage.getItemAsync(testKey);
      }).then(function(result) {
        expect(result).to.be(null);
        done();
      });
    });
  });
});

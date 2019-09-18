'use strict';

import { setupPolly } from './polly';

describe('AV.Cloud', function() {
  setupPolly();

  var originalServerURLs, originalAppId, originalAppKey, originalUseMasterKey;

  before(function() {
    originalServerURLs = AV._config.serverURLs;
    originalAppId = AV.applicationId;
    originalAppKey = AV.applicationKey;
    originalUseMasterKey = AV._config.useMasterKey;

    AV.setServerURLs('https://api.leancloud.cn');
    AV.applicationId = '4h2h4okwiyn8b6cle0oig00vitayum8ephrlsvg7xo8o19ne';
    AV.applicationKey = '3xjj1qw91cr3ygjq9lt0g8c3qpet38rrxtwmmp0yffyoy2t4';
    AV._config.useMasterKey = false;

    AV.User._currentUser = null;
  });

  describe('#getServerDate', function() {
    it('should return a date.', function() {
      return AV.Cloud.getServerDate().then(function(date) {
        expect(date).to.be.a('object');
        expect(date instanceof Date).to.be(true);
      });
    });
  });

  describe('#rpc', function() {
    it('receive complex object', function() {
      return AV.Cloud.rpc('complexObject').then(function(result) {
        expect(result.foo).to.be('bar');
        expect(result.t).to.be.a(Date);
        expect(result.t.toISOString()).to.be('2015-05-14T09:21:18.273Z');

        expect(result.avObject).to.be.a(AV.Object);
        expect(result.avObject.className).to.be('ComplexObject');
        expect(result.avObject.get('numberColumn')).to.be(1.23);
        expect(result.avObject.get('arrayColumn')).to.eql([1, 2, 3]);
        expect(result.avObject.get('objectColumn')).to.eql({ foo: 'bar' });
        expect(result.avObject.get('stringColumn')).to.be('testString');
        expect(result.avObject.get('anyColumn')).to.be('');
        expect(result.avObject.get('booleanColumn')).to.be(true);
        expect(result.avObject.get('pointerColumn')).to.be.a(AV.Object);
        expect(result.avObject.get('pointerColumn').id).to.be(
          '55069e5be4b0c93838ed8e6c'
        );
        expect(result.avObject.get('relationColumn')).to.be.a(AV.Relation);
        expect(result.avObject.get('relationColumn').targetClassName).to.be(
          'TestObject'
        );
        expect(result.avObject.get('geopointColumn')).to.be.a(AV.GeoPoint);
        expect(result.avObject.get('geopointColumn').latitude).to.be(0);
        expect(result.avObject.get('geopointColumn').longitude).to.be(30);
        expect(result.avObject.get('dateColumn')).to.be.a(Date);
        expect(result.avObject.get('dateColumn').toISOString()).to.be(
          '2015-05-14T06:24:47.000Z'
        );
        expect(result.avObject.get('fileColumn')).to.be.a(AV.File);
        expect(result.avObject.get('fileColumn').name()).to.be('ttt.jpg');
        expect(result.avObject.get('fileColumn').url()).to.be(
          'http://lc-4h2h4okw.cn-n1.lcfile.com/4qSbLMO866Tf4YtT9QEwJwysTlHGC9sMl7bpTwhQ.jpg'
        );

        result.avObjects.forEach(function(object) {
          expect(object).to.be.a(AV.Object);
          expect(object.className).to.be('ComplexObject');
        });
      });
    });

    it('receive bare AVObject', function() {
      return AV.Cloud.rpc('bareAVObject').then(function(result) {
        expect(result).to.be.a(AV.Object);
        expect(result.className).to.be('ComplexObject');
        expect(result.get('fileColumn')).to.be.a(AV.File);
      });
    });

    it('receive array of AVObjects', function() {
      return AV.Cloud.rpc('AVObjects').then(function(result) {
        result.forEach(function(object) {
          expect(object).to.be.a(AV.Object);
          expect(object.className).to.be('ComplexObject');
        });
      });
    });

    it('send AVObject', function() {
      var avObject = new AV.Object('ComplexObject');
      var avObjectItem = new AV.Object('ComplexObject');

      avObject.set({
        name: 'avObject',
        pointerColumn: AV.Object.createWithoutData(
          '_User',
          '55069e5be4b0c93838ed8e6c'
        )._toPointer(),
      });

      avObjectItem.set({
        name: 'avObjects',
      });

      return AV.Object.saveAll([avObject, avObjectItem]).then(function() {
        return AV.Cloud.rpc('testAVObjectParams', {
          avObject: avObject,
          avFile: AV.File.withURL(
            'hello.txt',
            'http://ac-1qdney6b.qiniudn.com/3zLG4o0d27MsCQ0qHGRg4JUKbaXU2fiE35HdhC8j.txt'
          ),
          avObjects: [avObjectItem],
        });
      });
    });

    it('send bare AVObject', function() {
      var avObject = new AV.Object('ComplexObject');

      avObject.set({
        name: 'avObject',
        avFile: AV.File.withURL(
          'hello.txt',
          'http://ac-1qdney6b.qiniudn.com/3zLG4o0d27MsCQ0qHGRg4JUKbaXU2fiE35HdhC8j.txt'
        ),
      });

      return AV.Cloud.rpc('testBareAVObjectParams', avObject);
    });
  });

  after(function() {
    AV.setServerURLs(originalServerURLs);
    AV.applicationId = originalAppId;
    AV.applicationKey = originalAppKey;
    AV._config.useMasterKey = originalUseMasterKey;
  });
});

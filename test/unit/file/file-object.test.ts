import 'should';
import { App } from '../../../src/app/app';
import { FileObjectRef, FileObject } from '../../../src/storage/file';
import { adapters } from '../../../src/utils/test-adapters';

const app = new App({
  appId: 'test-app-id',
  appKey: 'test-app-key',
  serverURL: 'test-server-url',
});

describe('FileObjectRef', function () {
  const ref = new FileObjectRef(app, 'test-file-id');

  describe('#get', function () {
    it('should return a FileObject', async function () {
      adapters.responses.push({ body: { objectId: 'test-file-id' } });
      (await ref.get()).should.instanceOf(FileObject);
    });
  });

  describe('#update', function () {
    it('should update only name/url/mime_type/metaData/ACL', async function () {
      adapters.responses.push({ body: { objectId: 'test-file-id' } });
      await ref.update({
        name: 'test-name',
        url: 'test-url',
        mime_type: 'test-mime',
        metaData: { key: 'value' },
        otherKey: 'value',
      });
      const req = adapters.requests.pop();
      req.body.should.containEql({
        name: 'test-name',
        url: 'test-url',
        mime_type: 'test-mime',
        metaData: { key: 'value' },
      });
      (!req.body['otherKey']).should.true();
    });

    it('should return a FileObject', async function () {
      adapters.responses.push({ body: { objectId: 'test-file-id' } });
      (await ref.update({})).should.instanceOf(FileObject);
    });
  });
});

describe('FileObject', function () {
  const file = new FileObject(app, 'test-file-id');
  file.data = {
    name: 'test-file-name',
    url: 'test-file-url',
    mime_type: 'test-file-mime',
    metaData: {
      size: 123,
    },
  };

  describe('#name', function () {
    it('should return name in data', function () {
      file.name.should.eql(file.data.name);
    });
  });

  describe('#url', function () {
    it('should return url in data', function () {
      file.url.should.eql(file.data.url);
    });
  });

  describe('#size', function () {
    it('should return size in data.metaData', function () {
      file.size.should.eql(file.data.metaData.size);
    });
  });

  describe('#thumbnailURL', function () {
    it('should set mode to 1 when scaleToFie is false', function () {
      file
        .thumbnailURL(100, 200, 100, false, 'jpg')
        .should.eql(file.url + '?imageView/1/w/100/h/200/q/100/format/jpg');
    });

    it('should set mode to 2 when scaleToFie is true', function () {
      file
        .thumbnailURL(100, 200, 100, true, 'jpg')
        .should.eql(file.url + '?imageView/2/w/100/h/200/q/100/format/jpg');
    });
  });

  describe('#get', function () {
    it('should return a FileObject', async function () {
      adapters.responses.push({ body: { objectId: 'test-file-id' } });
      (await file.get()).should.instanceOf(FileObject);
    });
  });

  describe('#update', function () {
    it('should return a FileObject', async function () {
      adapters.responses.push({ body: { objectId: 'test-file-id' } });
      (await file.update({})).should.instanceOf(FileObject);
    });
  });
});

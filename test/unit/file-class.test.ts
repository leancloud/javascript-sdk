import 'should';
import { App } from '../../src/app/app';
import { adapters } from '../../src/utils/test-adapters';
import { FileClass } from '../../src/storage/file-class';
import { FileObjectRef } from '../../src/storage/file';
import { API_VERSION } from '../../src/const';

describe('FileClass', function () {
  const app = new App({
    appId: 'test-app-id',
    appKey: 'test-app-key',
    serverURL: 'test-server-url',
  });
  const _File = new FileClass(app);

  describe('#object', function () {
    it('should return a FileObjectRef', function () {
      _File.object('test-file-id').should.instanceOf(FileObjectRef);
    });
  });

  describe('#_getFileTokens', function () {
    it('should send POST request to /fileTokens', async function () {
      await Reflect.get(_File, '_getFileTokens').call(_File, 'test-name');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/fileTokens`);
    });

    it('check parameters', async function () {
      await Reflect.get(_File, '_getFileTokens').call(_File, 'test-name', 'test-mime', null, {
        key: 'value',
      });
      const req = adapters.requests.pop();
      req.body.should.eql({
        name: 'test-name',
        mime_type: 'test-mime',
        ACL: null,
        metaData: { key: 'value' },
      });
    });
  });

  describe('#_invokeFileCallback', function () {
    it('should send POST to /fileCallback', async function () {
      await Reflect.get(_File, '_invokeFileCallback').call(_File, 'test-token', false);
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/fileCallback`);
    });

    it('check parameters', async function () {
      await Reflect.get(_File, '_invokeFileCallback').call(_File, 'test-token', true);
      const req = adapters.requests.pop();
      req.body.should.eql({
        token: 'test-token',
        result: true,
      });
    });
  });
});

import 'should';
import { App } from '../../../src/app';
import { adapters } from '../../test-adapters';
import { FileClass, FileObjectRef } from '../../../src/file';

describe('FileClass', () => {
  const app = new App({
    appId: 'test-app-id',
    appKey: 'test-app-key',
    serverURL: 'test-server-url',
  });
  const _File = new FileClass(app);

  describe('#object', () => {
    it('should return a FileObjectRef', () => {
      _File.object('test-file-id').should.instanceOf(FileObjectRef);
    });
  });

  describe('#_getFileTokens', () => {
    it('should send POST request to /fileTokens', async () => {
      await Reflect.get(_File, '_getFileTokens').call(_File, 'test-name');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.url.should.endWith('/fileTokens');
    });

    it('check parameters', async () => {
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

  describe('#_invokeFileCallback', () => {
    it('should send POST to /fileCallback', async () => {
      await Reflect.get(_File, '_invokeFileCallback').call(_File, 'test-token', false);
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.url.should.endWith('/fileCallback');
    });

    it('check parameters', async () => {
      await Reflect.get(_File, '_invokeFileCallback').call(_File, 'test-token', true);
      const req = adapters.requests.pop();
      req.body.should.eql({
        token: 'test-token',
        result: true,
      });
    });
  });
});

import 'should';
import { HTTP } from '../../src/http';
import { adapters } from '../test-adapters';

describe('HTTP', () => {
  describe('.request', () => {
    it('basic request', async function () {
      await HTTP.request({
        method: 'POST',
        url: 'https://example.com/',
        header: {
          testHeaderKey: 'testHeaderValue',
        },
        query: {
          num: 123,
          str: '456',
          bool: true,
        },
        body: {
          testBodyKey: 'testBodyValue',
        },
      });
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.url.should.eql('https://example.com/');
      req.header.testHeaderKey.should.eql('testHeaderValue');
      req.query.should.eql({
        num: '123',
        str: '456',
        bool: 'true',
      });
      req.body.should.eql({
        testBodyKey: 'testBodyValue',
      });
    });
  });
});

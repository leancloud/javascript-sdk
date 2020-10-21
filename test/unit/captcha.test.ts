import 'should';
import { adapters } from '../../src/utils/test-adapters';
import { App } from '../../src/app';
import { API_VERSION } from '../../src/const';
import { Captcha } from '../../src/captcha';

describe('Captcha', function () {
  const app = new App({
    appId: 'test-app-id',
    appKey: 'test-app-key',
    serverURL: 'test-server-url',
  });
  const captcha = new Captcha(app);

  describe('#refresh', function () {
    it('should send GET request to /requestCaptcha', async function () {
      await captcha.refresh();
      const req = adapters.requests.pop();
      req.method.should.eql('GET');
      req.path.should.eql(`${API_VERSION}/requestCaptcha`);
    });

    it('check options', async function () {
      await captcha.refresh({ width: 200, height: 100, size: 5, ttl: 120 });
      const req = adapters.requests.pop();
      req.query.should.containEql({ width: '200', height: '100', size: '5', ttl: '120' });
    });

    it('should refresh url and token', async function () {
      adapters.responses.push({
        status: 200,
        body: {
          captcha_url: 'test-url',
          captcha_token: 'test-token',
        },
      });
      await captcha.refresh();
      captcha.url.should.eql('test-url');
      captcha.token.should.eql('test-token');
    });
  });

  describe('#verify', function () {
    it('should send POST request to /verifyCaptcha', async function () {
      await captcha.verify('test-code');
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/verifyCaptcha`);
    });

    it('check code and token', async function () {
      captcha.token = 'test-token';
      await captcha.verify('test-code');
      const req = adapters.requests.pop();
      req.body.should.eql({
        captcha_code: 'test-code',
        captcha_token: 'test-token',
      });
    });

    it('should refresh validateToken', async function () {
      adapters.responses.push({
        status: 200,
        body: { validate_token: 'test-validate-token' },
      });
      await captcha.verify('');
      captcha.validateToken.should.eql('test-validate-token');
    });
  });
});

import 'should';
import { adapters } from '../../src/utils/test-adapters';
import { App } from '../../src/app/app';
import { Push } from '../../src/push/push';
import { Query } from '../../src/storage/query';
import { API_VERSION } from '../../src/const';

describe('Push', function () {
  const app = new App({
    appId: 'test-app-id',
    appKey: 'test-app-key',
    serverURL: 'test-server-url',
  });
  const push = new Push(app);

  describe('#send', function () {
    it('shoud send POST request to /push', async function () {
      await push.send({});
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.path.should.eql(`${API_VERSION}/push`);
    });

    it('check data and options', async function () {
      const pushTime = new Date();
      const expirationTime = new Date();
      await push.send(
        { key: 'value' },
        {
          query: new Query('', app).where('key', '==', 'value'),
          channels: ['channel1', 'channel2'],
          pushTime,
          expirationTime,
          notificationId: 'test-notification-id',
          reqId: 'test-req-id',
          prod: 'dev',
          topic: 'test-topic',
          apnsTeamId: 'test-apns-team-id',
          flowControl: 123,
          notificationChannel: 'test-notification-channel',
        }
      );
      let req = adapters.requests.pop();
      req.body.should.containEql({
        data: { key: 'value' },
        where: { key: 'value' },
        channels: ['channel1', 'channel2'],
        push_time: pushTime.toISOString(),
        expiration_time: expirationTime.toISOString(),
        notification_id: 'test-notification-id',
        req_id: 'test-req-id',
        prod: 'dev',
        topic: 'test-topic',
        apns_team_id: 'test-apns-team-id',
        flow_control: 123,
        _notificationChannel: 'test-notification-channel',
      });

      await push.send({ key: 'value' }, { expirationInterval: 123 });
      req = adapters.requests.pop();
      req.body.should.containEql({ expiration_interval: 123 });
    });

    it('should throw error when set both expirationTime and expirationInterval', function () {
      return push.send({}, { expirationTime: new Date(), expirationInterval: 1 }).should.rejected();
    });
  });
});

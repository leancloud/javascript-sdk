import 'should';
import { adapters } from '../test-adapters';
import { App } from '../../src/app';
import { Push } from '../../src/push/push';
import { Query } from '../../src/query';

describe('Push', () => {
  const app = new App({
    appId: 'test-app-id',
    appKey: 'test-app-key',
    serverURL: 'test-server-url',
  });
  const push = new Push(app);

  describe('#send', () => {
    it('shoud send POST request to /push', async () => {
      await push.send({});
      const req = adapters.requests.pop();
      req.method.should.eql('POST');
      req.url.should.endWith('/push');
    });

    it('check data and options', async () => {
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

    it('should throw error when set both expirationTime and expirationInterval', () => {
      return push.send({}, { expirationTime: new Date(), expirationInterval: 1 }).should.rejected();
    });
  });
});

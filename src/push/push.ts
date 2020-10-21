import { App, AuthOptions } from '../app/app';
import type { Query } from '../query';

export interface PushOptions extends AuthOptions {
  query?: Query;
  channels?: string[];
  pushTime?: Date;
  expirationTime?: Date;
  expirationInterval?: number;
  notificationId?: string;
  reqId?: string;
  prod?: 'prod' | 'dev';
  topic?: string;
  apnsTeamId?: string;
  flowControl?: number;
  notificationChannel?: string;
}

export class Push {
  constructor(public app: App) {}

  static send(data: Record<string, unknown>, options?: PushOptions): Promise<void> {
    return new Push(App.default).send(data, options);
  }

  async send(data: Record<string, unknown>, options?: PushOptions): Promise<void> {
    if (options?.expirationTime && options?.expirationInterval) {
      throw new Error(`Both expirationTime and expirationInterval cannot be set`);
    }
    await this.app.request({
      service: 'push',
      method: 'POST',
      path: `/push`,
      body: {
        data,
        where: options?.query?.toJSON(),
        channels: options?.channels,
        push_time: options?.pushTime?.toISOString(),
        expiration_time: options?.expirationTime?.toISOString(),
        expiration_interval: options?.expirationInterval,
        notification_id: options?.notificationId,
        req_id: options?.reqId,
        prod: options?.prod,
        topic: options?.topic,
        apns_team_id: options?.apnsTeamId,
        flow_control: options?.flowControl,
        _notificationChannel: options?.notificationChannel,
      },
      options,
    });
  }
}

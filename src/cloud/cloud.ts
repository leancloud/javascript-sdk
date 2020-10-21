import { AuthOptions, App } from '../app/app';
import { lcEncode } from '../object';

interface RequestSMSCodeOptions extends AuthOptions {
  smsType?: string;
  ttl?: number;
  name?: string;
  op?: string;
  template?: string;
  sign?: string;
  validateToken?: string;
  variables?: Record<string, unknown>;
}

export class Cloud {
  constructor(public app: App) {}

  static requestSMSCode(mobilePhoneNumber: string, options?: RequestSMSCodeOptions): Promise<void> {
    return new Cloud(App.default).requestSMSCode(mobilePhoneNumber, options);
  }

  static verifySMSCode(
    mobilePhoneNumber: string,
    smsCode: string,
    options?: AuthOptions
  ): Promise<void> {
    return new Cloud(App.default).verifySMSCode(mobilePhoneNumber, smsCode, options);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static run(name: string, data?: unknown, options?: AuthOptions): Promise<any> {
    return new Cloud(App.default).run(name, data, options);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static rpc(name: string, data?: unknown, options?: AuthOptions): Promise<any> {
    return new Cloud(App.default).rpc(name, data, options);
  }

  async requestSMSCode(mobilePhoneNumber: string, options?: RequestSMSCodeOptions): Promise<void> {
    await this.app.request({
      method: 'POST',
      path: `/requestSmsCode`,
      body: {
        ...options?.variables,
        mobilePhoneNumber,
        smsType: options?.smsType,
        ttl: options?.ttl,
        name: options?.name,
        op: options?.op,
        template: options?.template,
        sign: options?.sign,
        validate_token: options?.validateToken,
      },
      options,
    });
  }

  async verifySMSCode(
    mobilePhoneNumber: string,
    smsCode: string,
    options?: AuthOptions
  ): Promise<void> {
    await this.app.request({
      method: 'POST',
      path: `/verifySmsCode/${smsCode}`,
      body: { mobilePhoneNumber },
      options,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async run(name: string, data?: unknown, options?: AuthOptions): Promise<any> {
    const res = await this.app.request({
      service: 'engine',
      method: 'POST',
      path: `/functions/${name}`,
      body: lcEncode(data, { full: true }),
      options,
    });
    return res.body.result;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async rpc(name: string, data?: unknown, options?: AuthOptions): Promise<any> {
    const res = await this.app.request({
      service: 'engine',
      method: 'POST',
      path: `/call/${name}`,
      body: lcEncode(data, { full: true }),
      options,
    });
    return this.app.decode(res.body.result);
  }
}

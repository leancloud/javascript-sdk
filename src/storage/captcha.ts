import { App, AuthOptions } from '../app/app';
import { API_VERSION } from '../const';

export interface RefreshCaptchaOptions extends AuthOptions {
  width?: number;
  height?: number;
  size?: number;
  ttl?: number;
}

interface BindCaptchaOptions {
  textInput?: string | HTMLInputElement;
  image?: string | HTMLImageElement;
  verifyButton?: string | HTMLElement;
  success?: (validateToken?: string) => void;
  error?: (error?: Error) => void;
}

export class Captcha {
  token: string;
  url: string;
  validateToken: string;

  private _binder: CaptchaDomBinder;

  constructor(public app: App) {}

  static async request(app: App, options?: RefreshCaptchaOptions): Promise<Captcha>;
  static async request(options?: RefreshCaptchaOptions): Promise<Captcha>;
  static async request(
    arg1: App | RefreshCaptchaOptions,
    options?: RefreshCaptchaOptions
  ): Promise<Captcha> {
    if (arg1 instanceof App) {
      const captcha = new Captcha(arg1);
      await captcha.refresh(options);
      return captcha;
    } else {
      const captcha = new Captcha(App.default);
      await captcha.refresh(arg1);
      return captcha;
    }
  }

  async refresh(options?: RefreshCaptchaOptions): Promise<void> {
    this.validateToken = null;
    const res = await this.app.request({
      method: 'GET',
      path: `${API_VERSION}/requestCaptcha`,
      query: {
        width: options?.width,
        height: options?.height,
        size: options?.size,
        ttl: options?.ttl,
      },
      options,
    });
    this.token = res.body['captcha_token'];
    this.url = res.body['captcha_url'];
  }

  async verify(code: string, options?: AuthOptions): Promise<string> {
    if (!this.token) {
      throw new Error('The captcha token is empty, you should call refresh first');
    }
    const res = await this.app.request({
      method: 'POST',
      path: `${API_VERSION}/verifyCaptcha`,
      body: {
        captcha_code: code,
        captcha_token: this.token,
      },
      options,
    });
    this.validateToken = res.body['validate_token'];
    return this.validateToken;
  }

  bind(options: BindCaptchaOptions): void {
    if (!this._binder) {
      this._binder = new CaptchaDomBinder(this, options);
    }
    this._binder.bind();
  }

  unbind(): void {
    if (this._binder) {
      this._binder.unbind();
    }
  }
}

class CaptchaDomBinder {
  captcha: Captcha;
  image: HTMLImageElement;
  input: HTMLInputElement;
  button: HTMLElement;
  onSuccess: BindCaptchaOptions['success'];
  onError: BindCaptchaOptions['error'];
  onRefresh: () => Promise<void>;
  onVerify: () => Promise<void>;

  constructor(captcha: Captcha, options: BindCaptchaOptions) {
    this.captcha = captcha;
    if (typeof options.image === 'string') {
      this.image = document.getElementById(options.image) as HTMLImageElement;
    } else {
      this.image = options.image;
    }
    if (typeof options.textInput === 'string') {
      this.input = document.getElementById(options.textInput) as HTMLInputElement;
    } else {
      this.input = options.textInput;
    }
    if (typeof options.verifyButton === 'string') {
      this.button = document.getElementById(options.verifyButton);
    } else {
      this.button = options.verifyButton;
    }
    this.onSuccess = options.success;
    this.onError = options.error;
    this.onRefresh = this.refresh.bind(this);
    this.onVerify = this.verify.bind(this);
  }

  async refresh(): Promise<void> {
    try {
      await this.captcha.refresh();
      this.image.src = this.captcha.url;
      if (this.input) {
        this.input.value = '';
        this.input.focus();
      }
    } catch (err) {
      this.onError?.(err);
    }
  }

  async verify(): Promise<void> {
    try {
      const code = this.input.value;
      await this.captcha.verify(code);
      if (this.onSuccess) {
        this.onSuccess(this.captcha.validateToken);
      }
    } catch (err) {
      this.onError?.(err);
    }
  }

  bind(): void {
    if (this.image) {
      this.image.src = this.captcha.url;
      this.image.addEventListener('click', this.onRefresh);
    }
    if (this.input && this.button) {
      this.button.addEventListener('click', this.onVerify);
    }
  }

  unbind(): void {
    if (this.image) {
      this.image.removeEventListener('click', this.onRefresh);
    }
    if (this.button) {
      this.button.removeEventListener('click', this.onVerify);
    }
  }
}

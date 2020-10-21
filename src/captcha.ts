import { App, AuthOptions } from './app/app';

export interface RefreshCaptchaOptions extends AuthOptions {
  width?: number;
  height?: number;
  size?: number;
  ttl?: number;
}

interface BindCaptchaOptions {
  /**
   * An input element typed text, or the id for the element.
   */
  textInput?: string | HTMLInputElement;

  /**
   * An image element, or the id for the element.
   */
  image?: string | HTMLImageElement;

  /**
   * A button element, or the id for the element.
   */
  verifyButton?: string | HTMLElement;

  /**
   * Success callback will be called if the code is verified. The param `validateToken` can be used
   * for further SMS request.
   */
  success?: (validateToken: string) => void;

  /**
   * Error callback will be called if something goes wrong, detailed in param `error.message`.
   */
  error?: (error: Error) => void;
}

export class Captcha {
  /**
   * The captchaToken of the captcha.
   *
   * @since 5.0.0
   */
  token: string;

  /**
   * The image url of the captcha.
   *
   * @since 5.0.0
   */
  url: string;

  /**
   * The validateToken of the captcha.
   *
   * @since 5.0.0
   */
  validateToken: string;

  private _binder: CaptchaDomBinder;

  constructor(public app: App) {}

  /**
   * Request a captcha.
   *
   * @since 5.0.0
   */
  static async request(app: App, options?: RefreshCaptchaOptions): Promise<Captcha>;

  /**
   * Request a captcha from the default App.
   *
   * @since 5.0.0
   */
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

  /**
   * Refresh the captcha. The `url` of the current Captcha will be updated.
   *
   * @since 5.0.0
   */
  async refresh(options?: RefreshCaptchaOptions): Promise<void> {
    this.validateToken = null;
    const res = await this.app.request({
      method: 'GET',
      path: `/requestCaptcha`,
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

  /**
   * Verify the captcha.
   *
   * @since 5.0.0
   * @param code The code from user input.
   */
  async verify(code: string, options?: AuthOptions): Promise<string> {
    if (!this.token) {
      throw new Error('The captcha token is empty, you should call refresh first');
    }
    const res = await this.app.request({
      method: 'POST',
      path: `/verifyCaptcha`,
      body: {
        captcha_code: code,
        captcha_token: this.token,
      },
      options,
    });
    this.validateToken = res.body['validate_token'];
    return this.validateToken;
  }

  /**
   * Bind the captcha to HTMLElements. **ONLY AVAILABLE in browsers**.
   *
   * @since 5.0.0
   */
  bind(options: BindCaptchaOptions): void {
    if (!this._binder) {
      this._binder = new CaptchaDomBinder(this, options);
      this._binder.bind();
    }
  }

  /**
   * Unbind the captcha from HTMLElements. **ONLY AVAILABLE in browsers**.
   *
   * @since 5.0.0
   */
  unbind(): void {
    this._binder?.unbind();
  }
}

/**
 * @internal
 */
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

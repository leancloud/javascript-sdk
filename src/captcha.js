const _ = require('underscore');
const { tap } = require('./utils');

module.exports = AV => {
  /**
   * @class
   * @example
   * AV.Captcha.request().then(captcha => {
   *   captcha.bind({
   *     textInput: 'code', // the id for textInput
   *     image: 'captcha',
   *     verifyButton: 'verify',
   *   }, {
   *     success: (validateCode) => {}, // next step
   *     error: (error) => {}, // present error.message to user
   *   });
   * });
   */
  AV.Captcha = function Captcha(options, authOptions) {
    this._options = options;
    this._authOptions = authOptions;
    /**
     * The image url of the captcha
     * @type string
     */
    this.url = undefined;
    /**
     * The captchaToken of the captcha.
     * @type string
     */
    this.captchaToken = undefined;
    /**
     * The validateToken of the captcha.
     * @type string
     */
    this.validateToken = undefined;
  };

  /**
   * Refresh the captcha
   * @return {Promise.<string>} a new capcha url
   */
  AV.Captcha.prototype.refresh = function refresh() {
    return AV.Cloud._requestCaptcha(this._options, this._authOptions).then(
      ({ captchaToken, url }) => {
        _.extend(this, { captchaToken, url });
        return url;
      }
    );
  };

  /**
   * Verify the captcha
   * @param {String} code The code from user input
   * @return {Promise.<string>} validateToken if the code is valid
   */
  AV.Captcha.prototype.verify = function verify(code) {
    return AV.Cloud.verifyCaptcha(code, this.captchaToken).then(
      tap(validateToken => (this.validateToken = validateToken))
    );
  };

  if (process.env.PLATFORM === 'Browser') {
    /**
     * Bind the captcha to HTMLElements. <b>ONLY AVAILABLE in browsers</b>.
     * @param [elements]
     * @param {String|HTMLInputElement} [elements.textInput] An input element typed text, or the id for the element.
     * @param {String|HTMLImageElement} [elements.image] An image element, or the id for the element.
     * @param {String|HTMLElement} [elements.verifyButton] A button element, or the id for the element.
     * @param [callbacks]
     * @param {Function} [callbacks.success] Success callback will be called if the code is verified. The param `validateCode` can be used for further SMS request.
     * @param {Function} [callbacks.error] Error callback will be called if something goes wrong, detailed in param `error.message`.
     */
    AV.Captcha.prototype.bind = function bind(
      { textInput, image, verifyButton },
      { success, error }
    ) {
      if (typeof textInput === 'string') {
        textInput = document.getElementById(textInput);
        if (!textInput)
          throw new Error(`textInput with id ${textInput} not found`);
      }
      if (typeof image === 'string') {
        image = document.getElementById(image);
        if (!image) throw new Error(`image with id ${image} not found`);
      }
      if (typeof verifyButton === 'string') {
        verifyButton = document.getElementById(verifyButton);
        if (!verifyButton)
          throw new Error(`verifyButton with id ${verifyButton} not found`);
      }

      this.__refresh = () =>
        this.refresh()
          .then(url => {
            image.src = url;
            if (textInput) {
              textInput.value = '';
              textInput.focus();
            }
          })
          .catch(err => console.warn(`refresh captcha fail: ${err.message}`));
      if (image) {
        this.__image = image;
        image.src = this.url;
        image.addEventListener('click', this.__refresh);
      }

      this.__verify = () => {
        const code = textInput.value;
        this.verify(code)
          .catch(err => {
            this.__refresh();
            throw err;
          })
          .then(success, error)
          .catch(err => console.warn(`verify captcha fail: ${err.message}`));
      };
      if (textInput && verifyButton) {
        this.__verifyButton = verifyButton;
        verifyButton.addEventListener('click', this.__verify);
      }
    };

    /**
     * unbind the captcha from HTMLElements. <b>ONLY AVAILABLE in browsers</b>.
     */
    AV.Captcha.prototype.unbind = function unbind() {
      if (this.__image)
        this.__image.removeEventListener('click', this.__refresh);
      if (this.__verifyButton)
        this.__verifyButton.removeEventListener('click', this.__verify);
    };
  }

  /**
   * Request a captcha
   * @param [options]
   * @param {Number} [options.width] width(px) of the captcha, ranged 60-200
   * @param {Number} [options.height] height(px) of the captcha, ranged 30-100
   * @param {Number} [options.size=4] length of the captcha, ranged 3-6. MasterKey required.
   * @param {Number} [options.ttl=60] time to live(s), ranged 10-180. MasterKey required.
   * @return {Promise.<AV.Captcha>}
   */
  AV.Captcha.request = (options, authOptions) => {
    const captcha = new AV.Captcha(options, authOptions);
    return captcha.refresh().then(() => captcha);
  };
};

const _ = require('underscore');
const { _request, request } = require('./request');

module.exports = function(AV) {
  /**
   * Contains functions for calling and declaring
   * <p><strong><em>
   *   Some functions are only available from Cloud Code.
   * </em></strong></p>
   *
   * @namespace
   * @borrows AV.Captcha.request as requestCaptcha
   */
  AV.Cloud = AV.Cloud || {};

  _.extend(
    AV.Cloud,
    /** @lends AV.Cloud */ {
      /**
       * Makes a call to a cloud function.
       * @param {String} name The function name.
       * @param {Object} [data] The parameters to send to the cloud function.
       * @param {AuthOptions} [options]
       * @return {Promise} A promise that will be resolved with the result
       * of the function.
       */
      run(name, data, options) {
        return request({
          service: 'engine',
          method: 'POST',
          path: `/functions/${name}`,
          data: AV._encode(data, null, true),
          authOptions: options,
        }).then(resp => {
          return AV._decode(resp).result;
        });
      },

      /**
       * Makes a call to a cloud function, you can send {AV.Object} as param or a field of param; the response
       * from server will also be parsed as an {AV.Object}, array of {AV.Object}, or object includes {AV.Object}
       * @param {String} name The function name.
       * @param {Object} [data] The parameters to send to the cloud function.
       * @param {AuthOptions} [options]
       * @return {Promise} A promise that will be resolved with the result of the function.
       */
      rpc(name, data, options) {
        if (_.isArray(data)) {
          return Promise.reject(
            new Error(
              "Can't pass Array as the param of rpc function in JavaScript SDK."
            )
          );
        }

        return request({
          service: 'engine',
          method: 'POST',
          path: `/call/${name}`,
          data: AV._encodeObjectOrArray(data),
          authOptions: options,
        }).then(resp => {
          return AV._decode(resp).result;
        });
      },

      /**
       * Make a call to request server date time.
       * @return {Promise.<Date>} A promise that will be resolved with the result
       * of the function.
       * @since 0.5.9
       */
      getServerDate() {
        return _request('date', null, null, 'GET').then(function(resp) {
          return AV._decode(resp);
        });
      },

      /**
       * Makes a call to request an sms code for operation verification.
       * @param {String|Object} data The mobile phone number string or a JSON
       *    object that contains mobilePhoneNumber,template,sign,op,ttl,name etc.
       * @param {String} data.mobilePhoneNumber
       * @param {String} [data.template] sms template name
       * @param {String} [data.sign] sms signature name
       * @param {String} [data.smsType] sending code by `sms` (default) or `voice` call
       * @param {SMSAuthOptions} [options]
       * @return {Promise} A promise that will be resolved if the request succeed
       */
      requestSmsCode(data, options = {}) {
        if (_.isString(data)) {
          data = { mobilePhoneNumber: data };
        }
        if (!data.mobilePhoneNumber) {
          throw new Error('Missing mobilePhoneNumber.');
        }
        if (options.validateToken) {
          data = _.extend({}, data, {
            validate_token: options.validateToken,
          });
        }
        return _request('requestSmsCode', null, null, 'POST', data, options);
      },

      /**
       * Makes a call to verify sms code that sent by AV.Cloud.requestSmsCode
       * @param {String} code The sms code sent by AV.Cloud.requestSmsCode
       * @param {phone} phone The mobile phoner number.
       * @return {Promise} A promise that will be resolved with the result
       * of the function.
       */
      verifySmsCode(code, phone) {
        if (!code) throw new Error('Missing sms code.');
        var params = {};
        if (_.isString(phone)) {
          params['mobilePhoneNumber'] = phone;
        }

        return _request('verifySmsCode', code, null, 'POST', params);
      },

      _requestCaptcha(options, authOptions) {
        return _request(
          'requestCaptcha',
          null,
          null,
          'GET',
          options,
          authOptions
        ).then(({ captcha_url: url, captcha_token: captchaToken }) => ({
          captchaToken,
          url,
        }));
      },

      /**
       * Request a captcha.
       */
      requestCaptcha: AV.Captcha.request,

      /**
       * Verify captcha code. This is the low-level API for captcha.
       * Checkout {@link AV.Captcha} for high abstract APIs.
       * @param {String} code the code from user input
       * @param {String} captchaToken captchaToken returned by {@link AV.Cloud.requestCaptcha}
       * @return {Promise.<String>} validateToken if the code is valid
       */
      verifyCaptcha(code, captchaToken) {
        return _request('verifyCaptcha', null, null, 'POST', {
          captcha_code: code,
          captcha_token: captchaToken,
        }).then(({ validate_token: validateToken }) => validateToken);
      },
    }
  );
};

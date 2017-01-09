'use strict';

var _ = require('underscore');
var AVRequest = require('./request').request;

module.exports = function (AV) {
  /**
   * Contains functions for calling and declaring
   * <p><strong><em>
   *   Some functions are only available from Cloud Code.
   * </em></strong></p>
   *
   * @namespace
   */
  AV.Cloud = AV.Cloud || {};

  _.extend(AV.Cloud, /** @lends AV.Cloud */{
    /**
     * Makes a call to a cloud function.
     * @param {String} name The function name.
     * @param {Object} data The parameters to send to the cloud function.
     * @param {AuthOptions} options
     * @return {Promise} A promise that will be resolved with the result
     * of the function.
     */
    run: function run(name, data, options) {
      var request = AVRequest('functions', name, null, 'POST', AV._encode(data, null, true), options);

      return request.then(function (resp) {
        return AV._decode(resp).result;
      });
    },

    /**
     * Makes a call to a cloud function, you can send {AV.Object} as param or a field of param; the response
     * from server will also be parsed as an {AV.Object}, array of {AV.Object}, or object includes {AV.Object}
     * @param {String} name The function name.
     * @param {Object} data The parameters to send to the cloud function.
     * @param {AuthOptions} options
     * @return {Promise} A promise that will be resolved with the result of the function.
     */
    rpc: function rpc(name, data, options) {
      if (_.isArray(data)) {
        return Promise.reject(new Error('Can\'t pass Array as the param of rpc function in JavaScript SDK.'));
      }

      return AVRequest('call', name, null, 'POST', AV._encodeObjectOrArray(data), options).then(function (resp) {
        return AV._decode(resp).result;
      });
    },

    /**
     * Make a call to request server date time.
     * @return {Promise.<Date>} A promise that will be resolved with the result
     * of the function.
     * @since 0.5.9
     */
    getServerDate: function getServerDate() {
      var request = AVRequest("date", null, null, 'GET');

      return request.then(function (resp) {
        return AV._decode(resp);
      });
    },

    /**
     * Makes a call to request a sms code for operation verification.
     * @param {Object} data The mobile phone number string or a JSON
     *    object that contains mobilePhoneNumber,template,op,ttl,name etc.
     * @return {Promise} A promise that will be resolved with the result
     * of the function.
     */
    requestSmsCode: function requestSmsCode(data) {
      if (_.isString(data)) {
        data = { mobilePhoneNumber: data };
      }
      if (!data.mobilePhoneNumber) {
        throw new Error('Missing mobilePhoneNumber.');
      }
      var request = AVRequest("requestSmsCode", null, null, 'POST', data);
      return request;
    },

    /**
     * Makes a call to verify sms code that sent by AV.Cloud.requestSmsCode
     * @param {String} code The sms code sent by AV.Cloud.requestSmsCode
     * @param {phone} phone The mobile phoner number(optional).
     * @return {Promise} A promise that will be resolved with the result
     * of the function.
     */
    verifySmsCode: function verifySmsCode(code, phone) {
      if (!code) throw new Error('Missing sms code.');
      var params = {};
      if (_.isString(phone)) {
        params['mobilePhoneNumber'] = phone;
      }

      var request = AVRequest("verifySmsCode", code, null, 'POST', params);
      return request;
    }
  });
};
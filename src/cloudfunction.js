/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

const _ = require('underscore');
const AVRequest = require('./request').request;

module.exports = function(AV) {
  /**
   * @namespace Contains functions for calling and declaring
   * <a href="/docs/cloud_code_guide#functions">cloud functions</a>.
   * <p><strong><em>
   *   Some functions are only available from Cloud Code.
   * </em></strong></p>
   */
  AV.Cloud = AV.Cloud || {};

  _.extend(AV.Cloud, /** @lends AV.Cloud */ {
    /**
     * Makes a call to a cloud function.
     * @param {String} name The function name.
     * @param {Object} data The parameters to send to the cloud function.
     * @param {Object} [options]
     * @param {String} [options.sessionToken]
     * @return {AV.Promise} A promise that will be resolved with the result
     * of the function.
     */
    run: function(name, data, options) {
      var request = AVRequest('functions', name, null, 'POST',
                                   AV._encode(data, null, true), options && options.sessionToken);

      return request.then(function(resp) {
        return AV._decode(null, resp).result;
      });
    },

    /**
     * Makes a call to a cloud function, you can send {AV.Object} as param or a field of param; the response
     * from server will also be parsed as an {AV.Object}, array of {AV.Object}, or object includes {AV.Object}
     * @param {String} name The function name.
     * @param {Object} data The parameters to send to the cloud function.
     * @param {Object} [options]
     * @param {String} [options.sessionToken]
     * @return {AV.Promise} A promise that will be resolved with the result of the function.
     */
    rpc: function(name, data, options) {
      if (_.isArray(data)) {
        return AV.Promise.reject(new Error('Can\'t pass Array as the param of rpc function in JavaScript SDK.'));
      }

      return AVRequest('call', name, null, 'POST', AV._encodeObjectOrArray(data),
                       options && options.sessionToken).then(function(resp) {
        return AV._decode('', resp).result;
      });
    },

    /**
     * Make a call to request server date time.
     * @return {AV.Promise} A promise that will be resolved with the result
     * of the function.
     * @since 0.5.9
     */
    getServerDate: function() {
      var request = AVRequest("date", null, null, 'GET');

      return request.then(function(resp) {
        return AV._decode(null, resp);
      });
    },

    /**
     * Makes a call to request a sms code for operation verification.
     * @param {Object} data The mobile phone number string or a JSON
     *    object that contains mobilePhoneNumber,template,op,ttl,name etc.
     * @return {AV.Promise} A promise that will be resolved with the result
     * of the function.
     */
    requestSmsCode: function(data){
      if(_.isString(data)) {
        data = { mobilePhoneNumber: data };
      }
      if(!data.mobilePhoneNumber) {
        throw "Missing mobilePhoneNumber.";
      }
      var request = AVRequest("requestSmsCode", null, null, 'POST',
                                    data);
      return request;
    },

    /**
     * Makes a call to verify sms code that sent by AV.Cloud.requestSmsCode
     * @param {String} code The sms code sent by AV.Cloud.requestSmsCode
     * @param {phone} phone The mobile phoner number(optional).
     * @return {AV.Promise} A promise that will be resolved with the result
     * of the function.
     */
    verifySmsCode: function(code, phone){
      if(!code)
        throw "Missing sms code.";
      var params = {};
      if(_.isString(phone)) {
         params['mobilePhoneNumber'] = phone;
      } else {
        // To be compatible with old versions.
         options = phone;
      }

      var request = AVRequest("verifySmsCode", code, null, 'POST',
                                   params);
      return request;
    }
  });
};

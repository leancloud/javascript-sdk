/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

'use strict';

var dataURLToBlob = function dataURLToBlob(base64) {
  // 兼容 dataURL
  if (base64.split(',')[0] && base64.split(',')[0].indexOf('base64') >= 0) {
    base64 = base64.split(',')[1];
  }
  return new Buffer(base64, 'base64');
};

module.exports = dataURLToBlob;
/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
**/

'use strict';

var Storage = require('localstorage-memory');
Storage.async = false;

module.exports = Storage;
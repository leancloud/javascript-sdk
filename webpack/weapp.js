var config = require('./common')();

config.entry = './src/index-weapp.js';
config.output.filename = 'av-weapp.js';
config.resolve.aliasFields = ['weapp', 'browser'];

module.exports = config;

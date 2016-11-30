var config = require('./common')();

config.output.filename = 'av-rn.js';
config.resolve.aliasFields = ['react-native', 'browser'];
config.externals = {
  'react-native': 'react-native'
};

module.exports = config;

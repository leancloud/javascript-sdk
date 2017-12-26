const { create, entry, name } = require('./common');

const config = create();

config.entry = {
  [`${name}-rn-min`]: entry,
};
config.resolve.aliasFields = ['react-native', 'browser'];
config.externals = {
  'react-native': 'react-native',
};

config.module.loaders.push({
  test: /\.js$/,
  enforce: 'pre',
  exclude: /(node_modules|bower_components|\.spec\.js)/,
  use: [
    {
      loader: 'webpack-strip-block',
      options: {
        start: 'NODE-ONLY:start',
        end: 'NODE-ONLY:end'
      }
    }
  ]
});

module.exports = config;

var path = require('path');
var webpack = require('webpack');

module.exports = function() {
  return {
    entry: './src/index.js',
    output: {
      filename: 'av.js',
      libraryTarget: "umd2",
      library: "AV",
      path: path.resolve(__dirname, '../dist')
    },
    resolve: {},
    devtool: 'source-map',
    node: {
      // do not polyfill Buffer
      Buffer: false,
      process: false,
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          include: [
            path.resolve(__dirname, '../src'),
            path.resolve(__dirname, '../node_modules/weapp-polyfill'),
          ],
          loader: 'babel-loader',
          query: {
            presets: ['es2015']
          }
        }
      ]
    },
    plugins: [
      new webpack.EnvironmentPlugin([
        "CLIENT_PLATFORM"
      ])
    ]
  }
};

const merge = require('webpack-merge')
const common = require('./webpack.common')
const MinifyPlugin = require('babel-minify-webpack-plugin')
const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const library = 'EarlyParser'
const entry = {
  EarleyParser: path.resolve(__dirname, path.join('..', 'src', 'Parser.js')),
}

module.exports = merge(common, {
  entry,
  plugins: [
    new CleanWebpackPlugin(['lib'], {
      root: path.resolve(__dirname, '..'),
    }),
  ],
  optimization: {
    // minimize: false,
    minimizer: [
      new MinifyPlugin({
        keepClassName: true,
      }),
    ],
  },
  mode: 'production',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '..', 'lib'),
    library,
    libraryTarget: 'umd',
    globalObject: 'this',
    umdNamedDefine: true,
  },
})

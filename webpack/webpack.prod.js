const merge = require('webpack-merge')
const common = require('./webpack.common')
const MinifyPlugin = require('babel-minify-webpack-plugin')
const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const library = {
  name: 'earley-parser',
  type: 'umd',
}
const entry = {
  'earley-parser': path.resolve(__dirname, path.join('..', 'src', 'index.js')),
}

module.exports = merge(common, {
  entry,
  plugins: [
    new CleanWebpackPlugin(['dist'], {
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
    path: path.resolve(__dirname, '..', 'dist'),
    library,
    globalObject: 'this',
    umdNamedDefine: true,
  },
})

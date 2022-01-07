const merge = require('webpack-merge')
const path = require('path')
const common = require('./webpack.common')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const pkg = require('../package.json')

const cwd = process.cwd()
const dependencies = pkg.dependencies || {}
const index = {
  hash: true,
  template: 'examples/index.html',
  chunks: ['main'],
}
const entry = {
  main: [
    ...Object.keys(dependencies),
    path.resolve(process.cwd(), path.join('examples', 'main.js')),
  ],
}

module.exports = merge(common, {
  mode: 'development',
  entry,
  output: {
    filename: '[name].js',
    path: path.resolve(cwd, 'examples', 'dist'),
  },
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(cwd, 'examples', 'dist'),
    overlay: true,
    port: 9010,
    historyApiFallback: true,
  },
  plugins: [
    new CleanWebpackPlugin([path.join(cwd, 'examples', 'dist')], {
      root: path.resolve(cwd),
    }),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin(index),
  ],
  module: {
    rules: [
      {
        test: /\.html$/,
        use: ['html-loader'],
      },
    ],
  },
})

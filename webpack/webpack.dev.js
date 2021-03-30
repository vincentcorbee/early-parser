const merge = require('webpack-merge')
const path = require('path')
const common = require('./webpack.common')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const pkg = require('../package.json')

const cwd = process.cwd()
const dependencies = pkg.dependencies || {}
const index = {
  hash: true,
  template: 'index.html',
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
    new MiniCssExtractPlugin({
      filename: '[name].bundle.css',
    }),
    new HtmlWebpackPlugin(index),
  ],
  module: {
    rules: [
      {
        test: /\.(s*)css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [require('autoprefixer')()],
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.html$/,
        use: ['html-loader'],
      },
      {
        test: /\.(png|jp(e*)g|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8000,
              name: 'img/[hash]-[name].[ext]',
            },
          },
        ],
      },
    ],
  },
})

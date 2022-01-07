const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const config = {
  output: {
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  plugins: [new BundleAnalyzerPlugin({ analyzerPort: 9898 })],
  module: {
    rules: [
      {
        test: /\.[j|t]s$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  optimization: {
    moduleIds: 'named',
  },
}
module.exports = config

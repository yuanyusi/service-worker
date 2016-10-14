var path = require('path');
var webpack = require('webpack');

module.exports = {
  context: path.join(__dirname, 'client'),
  devtool: 'source-map',
  entry: [
  'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
    'webpack/hot/only-dev-server',
    './crud'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [
    // js
    {
      test: /\.js$/,
      loader: 'babel-loader',
      exclude : /node_modules/,
      //include: path.join(__dirname, '.')
	  include: __dirname
    },
    // CSS
    { 
      test: [/\.styl$/, /\.css$/],
      //include: path.join(__dirname, 'client'),
      loader: 'style-loader!css-loader!stylus-loader'
    }
    ]
  }
};
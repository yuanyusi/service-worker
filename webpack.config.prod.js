var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: [    
    './client/crud'
  ],
  cache: true,
  debug: true,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': "'production'"
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
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
      include: path.join(__dirname, 'client'),
      loader: 'style-loader!css-loader!stylus-loader'
    },
    {
		test: /\.ico$/,
		loader: "url-loader",
		query: { mimetype: "image/x-icon" }
	}
    ]
  }
};

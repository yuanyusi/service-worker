var path = require('path');
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config.dev');

var app = express();
var compiler = webpack(config);
var webpackHotMiddleware = require("webpack-hot-middleware");

var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey = fs.readFileSync('sslcert/key.pem', 'utf8');
var certificate = fs.readFileSync('sslcert/cert.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  hot: true,
  historyApiFallback: true,
  filename: 'bundle.js',
  stats: {
    colors: true,
  },
  publicPath: config.output.publicPath
}));

app.use(webpackHotMiddleware(compiler, {
  log: console.log,
  path: '/__webpack_hmr',
  heartbeat: 10 * 1000,
}));

app.use(require('webpack-hot-middleware')(compiler));

app.get('/', function(req, res) {
	 console.log("2");
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/offline.min.js', function(req, res) {
	 console.log("cek");
  res.sendFile(path.join(__dirname, 'offline.min.js'));
});

app.get('/manifest.json', function(req, res) {
	 console.log("3");
  res.sendFile(path.join(__dirname, 'manifest.json'));
});
app.get('/service-worker.js', function(req, res) {
	 console.log("5");
	     if(path.extname('service-worker.js') == '.js'){
      res.setHeader('content-type', 'application/javascript');
    }
  res.sendFile(path.join(__dirname, 'service-worker.js'));
});
app.get('/node_modules/axios/dist/axios.js', function(req, res) {
	 console.log("4");
  res.sendFile(path.join(__dirname, 'node_modules/axios/dist/axios.js'));
});

/*app.listen(7770, 'localhost', function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:7770');
});*/

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(7770);
httpsServer.listen(8443);



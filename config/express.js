var express = require('express');
var log4js = require('log4js');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var EncryptController = require('../app/controllers/encrypt.server.controller');

log4js.configure({
  appenders: [
    {type: 'console', category: 'express'}
  ]
});
module.exports = function(){
  var app = express();
  // log
  app.use(
    log4js.connectLogger(
      log4js.getLogger('express'), {
        level: log4js.levels.INFO
      }));
  app.use(bodyParser.urlencoded({
    extended: true,
    limit: '32mb'
  }));
  app.use(bodyParser.json());
  app.use(methodOverride());

  app.set('views', 'app/views');
  app.set('view engine', 'pug');
  app.get('/', function(req, res, next){
    res.render('index');
    return next();
  });
  app.use(express.static('public'));

  app.use(EncryptController.parseRequest);
  // routes
  require('../app/routes/encrypt.server.routes.js')(app);
  require('../app/routes/test.server.routes.js')(app);

  // handle 404
  app.use(function(req, res, next){
    try {
      res.json('404 Not Found');
    } catch(e) {
    }
    return next();
  });
  // handle errors
  app.use(function(err, req, res, next){
    if(err) {
      console.log('get err:', err);
      if(err.code && !isNaN(err.code) && !err.code) {
        res.status(err.code);
      } else{
        res.status(500);
      }
      if(err.message) {
        res.json(err.message);
      } else {
        res.json('Server error');
      }
      return;
    }
    res.json('404 Not Found');
  });
  return app;
};

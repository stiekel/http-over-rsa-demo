var test = require('../controllers/test.server.controller');
module.exports = function(app){
  app.get('/test', test.get);
  app.post('/test', test.post);
};

var encrypt = require('../controllers/encrypt.server.controller');
module.exports = function(app){
  app.get('/encrypt/publickey', encrypt.getPublicKey);
};

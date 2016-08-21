var RSA = require('node-rsa');
// var JSEncrypt = require('jsencrypt').JSEncrypt;
var encrypter = new RSA({b: 1024});
encrypter.setOptions({signingScheme: 'pkcs8'});
module.exports = {
  // return current public key
  getPublicKey: function(req, res, next){
    res.json({
      publicKey: encrypter.exportKey('public'),
      privateKey: encrypter.exportKey('private')
    });
  },
  parseRequest: function(req, res, next){
    // var temp = encrypter.encrypt('{"text":"hello, RSA"}', 'base64');
    // console.log('tmp:, temp', temp.toString());
    // console.log('encrypter.decrypt', encrypter.decrypt(temp).toString());

    console.log('encrypter:', encrypter);
    if(req.method === 'GET' && req.query.data && req.query.publicKey) {
      console.log('req.query.data:', req.query.data);
      req.data = encrypter.decrypt(req.query.data);
    }
    if(req.method === 'POST' && req.body.data && req.body.publicKey) {
      console.log('req.query.data:', req.body.data);
      req.data = encrypter.decrypt(req.body.data, 'utf8');
    }
    console.log('req.method:', req.method);
    console.log('req.body:', req.body);
    console.log('req.data:', req.data);
    return next();
  },
};

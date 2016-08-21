var encrypter = null;
var KEY_SIZE = 1024;
var serverEncrypter = null;
var serverPubulicKey = '';
var serverPrivateKey = '';
angular
  .module('app', ['ngResource'])
  .factory('HttpInterceptor', ['$q', HttpInterceptor])
  .config(['$httpProvider', function($httpProvider){
    $httpProvider.interceptors.push(HttpInterceptor);
  }])
  .run(function(){
    encrypter = new JSEncrypt({default_key_size: KEY_SIZE});
  })
  .controller('AppController', ['$scope', '$resource', AppController]);

function AppController ($scope, $resource) {
  $scope.errorMessage = '';
  // RSA key size
  $scope.publicKey = '';
  $scope.privateKey = '';
  $scope.text = "hello, RSA";
  $scope.method = 'get';
  // server public key, use to encrypt data in browser
  $scope.serverPubulicKey = '';
  $scope.createNewKey = function(){
    encrypter = new JSEncrypt({default_key_size: KEY_SIZE});
    $scope.privateKey = encrypter.getPrivateKey();
    $scope.publicKey = encrypter.getPublicKey();
  };

  $scope.send = function(){
    $resource('/test')[$scope.method]({text: $scope.text}, function(res){
      console.log('res', res);
    }, function(reason){
      console.log('reason', reason);
    });
  };

  $scope.getServerPublicKey = function(){
    $resource('/encrypt/publickey')
    .get({}, function(res){
      if(!res || !res.publicKey) {
        $scope.errorMessage = 'Failed to get Public key from server';
        return;
      }
      $scope.serverPubulicKey = res.publicKey;
      serverPubulicKey = res.publicKey;
      serverPrivateKey = res.privateKey;
      serverEncrypter = new JSEncrypt({default_key_size: KEY_SIZE});
      // serverEncrypter = new JSEncrypt();
      // console.log('serverEncrypter:', serverEncrypter);
      serverEncrypter.setPublicKey(res.publicKey);
      serverEncrypter.setPublicKey(res.privateKey);
      // console.log(serverEncrypter.setPublicKey($scope.publicKey));
      // console.log('after set new public key serverEncrypter:', serverEncrypter);
    }, function(reason){
      $scope.errorMessage = 'Failed to get Public key from Server';
    });
  };

  $scope.load = function(){
    if(encrypter) {
      $scope.privateKey = encrypter.getPrivateKey();
      $scope.publicKey = encrypter.getPublicKey();
    }
    $scope.getServerPublicKey();
  };
  $scope.load();
}

function HttpInterceptor ($q) {
  return {
    request: function(config){
      var tmpData = { publicKey: encrypter.getPublicKey() };
      if(config.method === 'GET' && config.params) {
        tmpData.data = serverEncrypter.encrypt(angular.toJson(config.params));
        console.log('serverEncrypter.decrypt:', serverEncrypter.decrypt(tmpData.data));
        config.params = tmpData;
      }
      if(config.method === 'POST' && config.data) {
        tmpData.data = serverEncrypter.encrypt(angular.toJson(config.data));
        config.data = tmpData;
      }
      return config;
    },
    // 请求发出时出错
    requestError: function(err){
      return $q.reject(err);
    },
    // 成功返回了响应
    response: function(res){
      return res;
    },
    // 返回的响应出错，包括后端返回响应时，设置了非 200 的 http 状态码
    responseError: function(err){
      return $q.reject(err);
    }
  }
}

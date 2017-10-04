'use strict';

// Authentication service for user variables
angular.module('users')

.factory('auth_service', ['$http', '$window', '$state', function($http, $window, $state){
  var auth = {};
	var token_name = 'random-rrhh-token';
	
	//OBS: if prefered not to save after closing the page-browser; use: 'sessionStorage'
	
	auth.saveToken = function (token, remember_session){
		if (remember_session) {
			if ($window.sessionStorage[token_name]) { $window.sessionStorage.removeItem(token_name); }
			$window.localStorage[token_name] = token;
		} else {
			if ($window.localStorage[token_name]) { $window.localStorage.removeItem(token_name); }
			$window.sessionStorage[token_name] = token;
		}
		
	};

	auth.getToken = function (){
		return $window.localStorage[token_name] ? $window.localStorage[token_name] : $window.sessionStorage[token_name];
	}

	auth.isLoggedIn = function(){
		var token = auth.getToken();

		if(token){
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};
	
	auth.checkLoggedIn = function(){
		if (!auth.isLoggedIn()) { $state.go('login', {}, {reload: true}); }
	};
	
	auth.currentUser = function(){
		if(auth.isLoggedIn()){
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload; //object with 'id' and 'username'
		}
	};
	
	auth.logIn = function(user, remember_session){
		return $http.post('/login', user).then(function(data){
			auth.saveToken(data.data.token, remember_session);
		});
	};
	
	auth.logOut = function(){
		if ($window.localStorage[token_name]) { $window.localStorage.removeItem(token_name); }
		else if ($window.sessionStorage[token_name]) { $window.sessionStorage.removeItem(token_name); }
		$state.go('login', {}, {reload: true});
	};

  return auth;
}])


// TO-DO: eliminar este método antigua, siguiendole la pista de uso antigua primero!

.factory('Authentication', [
	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
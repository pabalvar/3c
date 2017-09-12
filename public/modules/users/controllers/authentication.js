'use strict';

angular.module('users')

.controller('AuthCtrl', [
'$scope', '$state', 'auth_service', 'toastr',
function($scope, $state, auth_service, toastr){
  $scope.user = {};
	$scope.remember_session = true;

  $scope.logIn = function(){
    auth_service.logIn($scope.user, $scope.remember_session).then(
    function(){
      $state.go('app.home')
    }, function(error){
			toastr.error(error.message, {progressBar: true});
			$state.go('login');
    })
  };
}]);

/*
.controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// Redirecciona a la pagina que estaba justo antes de logearse
				$location.path(redirect_to);
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
				$scope.error="";
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response.user;
			//	var redirect_to= response.redirect_to;

				// Redirecciona a la pagina que estaba justo antes de logearse
				//$location.path(redirect_to);
				$location.path('#!');

			}).error(function(response) {

				$scope.error = response.message;


			});
		};
	}
]);
*/

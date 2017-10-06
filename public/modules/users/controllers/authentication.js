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

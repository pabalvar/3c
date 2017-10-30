'use strict';

/**
 * @ngdoc function
 * @name randomStack.controller:FullwidthlayoutCtrl
 * @description
 * # FullwidthlayoutCtrl
 * Controller of the randomStack
 */

angular.module('core')
	.controller('rdmHeaderCtlr', ['$scope', 'auth_service',
		function ($scope, auth_service) {

			//auth_service para manejar Usuario logeado 
			$scope.isLoggedIn = auth_service.isLoggedIn;
			$scope.currentUser = auth_service.currentUser;
			$scope.logOut = auth_service.logOut;

		}]);

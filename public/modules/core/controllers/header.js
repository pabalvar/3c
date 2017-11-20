'use strict';

/**
 * @ngdoc controller
 * @name core.controller:coreMainHeaderController
 * @description
 * Controlador principal
 */
angular.module('core')
	.controller('coreMainHeaderController', ['$scope', 'auth_service',
		function ($scope, auth_service) {

			//auth_service para manejar Usuario logeado 
			$scope.isLoggedIn = auth_service.isLoggedIn;
			$scope.currentUser = auth_service.currentUser;
			$scope.logOut = auth_service.logOut;

		}]);

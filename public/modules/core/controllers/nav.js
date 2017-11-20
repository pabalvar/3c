'use strict';

/**
 * @ngdoc controller
 * @name core.controller:coreMainNavController
 * @description
 * Controlador del menu izquierdo
 */
angular.module('core')
	.controller('coreMainNavController', ['$scope', 'auth_service', '$state',
		function ($scope, auth_service, $state) {
			$scope.oneAtATime = false;

			var estados = $state.get();

			// Obtener lista de menus como routes que tienen ncyBreadcrum con MenuLevel
			var menuItems = estados.filter(o => (o.ncyBreadcrumb || {}).menuLevel == 1);
			$scope.menuItems =
				menuItems.sort((a, b) => (a.ncyBreadcrumb || {}).menuPrio > (b.ncyBreadcrumb || {}).menuPrio);

			$scope.status = {
				isFirstOpen: true
			};

			$scope.isLoggedIn = auth_service.isLoggedIn;

		}]);

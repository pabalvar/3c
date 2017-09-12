'use strict';

/**
 * @ngdoc function
 * @name randomStack.controller:NavCtrl
 * @description
 * # NavCtrl
 * Controller of the randomStack
 */

angular.module('randomStack').controller('rdmNavCtrl', ['$scope', 'auth_service', '$state', function ($scope, auth_service, $state) {
	$scope.oneAtATime = false;

	var estados = $state.get();

	// Obtener lista de menus como routes que tienen ncyBreadcrum con MenuLevel
	var menuItems = estados.filter(o=>(o.ncyBreadcrumb||{}).menuLevel==1 );
	$scope.menuItems = 
	menuItems.sort((a,b) => (a.ncyBreadcrumb||{}).menuPrio > (b.ncyBreadcrumb||{}).menuPrio);
	//console.log("items",$scope.menuItems );


	$scope.status = {
		isFirstOpen: true
	};
	
	$scope.isLoggedIn = auth_service.isLoggedIn;
	
}]);

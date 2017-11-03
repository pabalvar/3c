'use strict';
/**
 * @ngdoc service
 * @name liberp.buscar
 * @requires $resource
 * @requires auth_service
 * @description permite ejecutar una consulta SQL remotamente
**/
angular.module('liberp')
	.factory('buscar', ['$resource', 'auth_service', function ($resource, auth_service) {
		return $resource('/buscar/', {}, {
			get: {
				method: 'GET',
				headers: { Authorization: 'Bearer ' + auth_service.getToken() }
			}
		});
	}])
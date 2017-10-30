'use strict';

angular.module('core')
	.factory('buscar', ['$resource', 'auth_service', function ($resource, auth_service) {
		return $resource('/buscar/', {}, {
			get: {
				method: 'GET',
				headers: { Authorization: 'Bearer ' + auth_service.getToken() }
			}
		});
	}])
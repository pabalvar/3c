'use strict';

angular.module('core')
	.factory('entidades', ['$resource', 'auth_service', function ($resource, auth_service) {
		return $resource('/entidades/:id', { id: '@id' }, {
			get: {
				method: 'GET',
				headers: { Authorization: 'Bearer ' + auth_service.getToken() }
			}
		});
	}])
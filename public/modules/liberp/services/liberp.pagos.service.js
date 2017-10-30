'use strict';

angular.module('core')
	.factory('pagos', ['$resource', 'auth_service', function ($resource, auth_service) {
		return $resource('/pagos/:id', { id: '@id' }, {
			get: {
				method: 'GET',
				headers: { Authorization: 'Bearer ' + auth_service.getToken() }
			}
		});
	}])
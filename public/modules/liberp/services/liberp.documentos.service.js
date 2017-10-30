'use strict';

angular.module('core')
	.factory('documentos', ['$resource', 'auth_service', function ($resource, auth_service) {
		return {
			traeDeuda: $resource('/documentos/traeDeuda/:id', { id: '@id' }, {
				get: {
					method: 'GET',
					headers: { Authorization: 'Bearer ' + auth_service.getToken() }
				}
			})
		}

	}])
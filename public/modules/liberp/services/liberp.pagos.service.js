'use strict';
/**
 * @ngdoc service
 * @name liberp.pagos
 * @requires $resource
 * @requires auth_service
 * @description trae los documentos de pagos de una entidad
**/
angular.module('liberp')
	.factory('pagos', ['$resource', 'auth_service', function ($resource, auth_service) {
		return $resource('/pagos/:id', { id: '@id' }, {
			get: {
				method: 'GET',
				headers: { Authorization: 'Bearer ' + auth_service.getToken() },
				responseType: 'json',
				transformResponse: (r) => { r.data = r.pagos; return r }
			},
			post: {
				method: 'POST',
				headers: { Authorization: 'Bearer ' + auth_service.getToken() }
			},
		});
	}])
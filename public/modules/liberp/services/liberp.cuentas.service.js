'use strict';
/**
 * @ngdoc service
 * @name liberp.cuentas
 * @requires $resource
 * @requires auth_service
 * @description trae los documentos de cuentas de una entidad
**/
angular.module('liberp')
	.factory('cuentas', ['$resource', 'auth_service', function ($resource, auth_service) {
		return $resource('/cuentas/:id', { id: '@id' }, {
			get: {
				method: 'GET',
				headers: { Authorization: 'Bearer ' + auth_service.getToken() },
				responseType: 'json',
				transformResponse: (r) => { r.data = r.cuentas; return r }
			}
		});
	}])
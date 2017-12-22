'use strict';
/**
 * @ngdoc service
 * @name liberp.entidades
 * @requires $resource
 * @requires auth_service
 * @description trae las entidades
**/
angular.module('liberp')
	.factory('entidades', ['$resource', 'auth_service', function ($resource, auth_service) {
		return $resource('/entidades/:id', { id: '@id' }, {
			get: {
				method: 'GET',
				headers: { Authorization: 'Bearer ' + auth_service.getToken() },
				responseType: 'json',
				transformResponse: (r) => { r.data = r.entidades; return r }
			}
		});
	}])
'use strict';
/**
 * @ngdoc service
 * @name core.meta
 * @requires $resource
 * @requires auth_service
 * @description permite ejecutar una consulta SQL remotamente
**/
angular.module('core')
	.factory('rndMeta', ['$resource', 'auth_service', function ($resource, auth_service) {
		return $resource('/meta/:id', { id: '@id' },{
			get: {
				method: 'GET'
			}
		});
	}])
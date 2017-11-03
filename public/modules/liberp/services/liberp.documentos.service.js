'use strict';
/**
 * @ngdoc service
 * @name liberp.documentos
 * @requires $resource
 * @requires auth_service
 * @description trae los documentos
**/
angular.module('liberp')
	.factory('documentos', ['$resource', 'auth_service', function ($resource, auth_service) {
		return {
			/**
			 * @ngdoc method
			 * @name liberp.documentos#traeDeuda
			 * @methodOf liberp.documentos
			 * @returns {$resource} Documentos de deuda
			 */
			traeDeuda: $resource('/documentos/traeDeuda/:id', { id: '@id' }, {
				get: {
					method: 'GET',
					headers: { Authorization: 'Bearer ' + auth_service.getToken() }
				}
			})
		}

	}])
'use strict';

angular.module('RRHH')
.factory('Contratos', ['$resource', 'auth_service', function($resource, auth_service) {
	return $resource('/contracts/:contract_id', { contract_id: '@id' }, {
		get:   {
			method: 'GET',
			headers: {Authorization: 'Bearer ' + auth_service.getToken()}
		},
        create:   {
			method: 'POST',
			headers: {Authorization: 'Bearer ' + auth_service.getToken()}
		},
        upsert:   {
			method: 'PATCH',
			headers: {Authorization: 'Bearer ' + auth_service.getToken()}
		},
        update: {
			method:'PUT',
			headers: {Authorization: 'Bearer ' + auth_service.getToken()}
		},
        delete: {
			method:'DELETE',
			headers: {Authorization: 'Bearer ' + auth_service.getToken()}
		}
  });
}])
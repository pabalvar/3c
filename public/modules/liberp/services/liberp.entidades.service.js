'use strict';

angular.module('core')
.factory('entidades', ['$resource', 'auth_service', function($resource, auth_service) {
	return $resource('/entidades/:id', { id: '@id' }, {
		get:   {
			method: 'GET',
			headers: {Authorization: 'Bearer ' + auth_service.getToken()}
        }/*,
        create:   {
			method: 'POST',
			headers: {Authorization: 'Bearer ' + auth_service.getToken()}
		},
        update: {
			method:'PUT',
			headers: {Authorization: 'Bearer ' + auth_service.getToken()}
		},
        delete: {
			method:'DELETE',
			headers: {Authorization: 'Bearer ' + auth_service.getToken()}
        }*/
  });
}])
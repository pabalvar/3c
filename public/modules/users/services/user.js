'use strict';

angular.module('users')

.factory('User', ['$resource', 'auth_service', function($resource, auth_service) {
	return $resource('/users/:user_id', { user_id: '@id' }, {
		get:    {
			method: 'GET',
			headers: {Authorization: 'Bearer ' + auth_service.getToken()}
		},
		save:   {
			method: 'POST',
			headers: {Authorization: 'Bearer ' + auth_service.getToken()}
		},
		query:  {
			method: 'GET', isArray:true,
			headers: {Authorization: 'Bearer ' + auth_service.getToken()}
		},
		delete: {
			method: 'DELETE',
			headers: {Authorization: 'Bearer ' + auth_service.getToken()}
		},
    update: {
      method: 'PUT',
			headers: {Authorization: 'Bearer ' + auth_service.getToken()}
    },
		checkExistence: {
      method: 'PUT',
			headers: {Authorization: 'Bearer ' + auth_service.getToken()}
    }
  });
}]);
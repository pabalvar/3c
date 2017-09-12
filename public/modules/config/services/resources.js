'use strict';

angular.module('config').factory('ConfigId', ['$resource',
	function($resource) {
		return $resource('/config/db/:dbId', {
			dbId: '@_id'
		}, {
			'update': {	method: 'PUT'},
			 resetConnection:{
					method: 'GET',
					url: '/config/db/reset/:dbId'
				}
		});
	}
]).factory('Config', ['$resource',
	function($resource) {
		return $resource('/config/db', {}, {
					'query': { method: 'GET', isArray: true},
        	'get': { method: 'GET'},
        	'save': {method: 'POST'},


		});
	}
])

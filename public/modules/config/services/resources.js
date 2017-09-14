'use strict';

angular.module('config')
.factory('db', ['$resource',
	function ($resource) {
		return $resource('/config/db', {}, {
			'get': { method: 'GET' },
			'save': { method: 'POST' },
			'reset':{ method: 'PUT' }
		});
	}
])

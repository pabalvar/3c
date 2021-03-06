'use strict';

angular.module('core')

.factory('Preferences', ['$q','$http', '$resource',
	function($q, $http, $resource) {
		return $resource('preferences', { }, {
			update: {method: 'PUT'},
			get: { method:'GET', url:'preferences'}
		});
	}
])

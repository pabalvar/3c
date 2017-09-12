'use strict';

// Setting up route
angular.module('config').config(['$stateProvider',
	function($stateProvider) {

		//Pages estate routing
		$stateProvider
		.state('app.configbd', {
	      url: '/config',
	      templateUrl: 'modules/config/views/config-bd.html',
		  ncyBreadcrumb: {
			parent: 'app.home',
          	label: 'Conexión',
			icon: 'fa fa-cogs',
			menuLevel:1,
			menuPrio: 100
      	  },
	    })
	}
]);

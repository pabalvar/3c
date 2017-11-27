'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'randomStack';
	var applicationModuleVendorDependencies =
		[
			//'ngAnimate',
		    'ngCookies',
		    'ngResource',
		    'ngSanitize',
		    //'ngTouch',
		    //'ngMessages',
		    'picardy.fontawesome',
		    'ui.bootstrap',
		    //'ui.router',
		    //'ui.utils',
            //'ui.grid',

		    //'angular-loading-bar',
		    'angular-momentjs',
            'FBAngular',
		    //'lazyModel',
		    'toastr',
		    'oc.lazyLoad',

		    'ui.select',
		    //'ui.tree',
		    'datatables',
		    'datatables.bootstrap',
		    //'datatables.tabletools',
		    'datatables.scroller',
		    'datatables.columnfilter',
            //'datatables.colreorder',
            //'datatables.buttons',
		   // 'easypiechart',
		    'ngTagsInput',
		    'pascalprecht.translate',
		    'ngMaterial',    
		    'chart.js',
			'ncy-angular-breadcrumb',
			'ngHandsontable',            
            'smart-table',
            'ngclipboard'
	    ];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();

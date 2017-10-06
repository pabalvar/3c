'use strict';
angular.module('core')
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('login');
    
    $stateProvider
    .state('app', {
      abstract: true,
      url: '/app',
      templateUrl: 'modules/core/views/app.html',

      resolve: {
        plugins: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load([
            'modules/core/languages/i18n/angular-locale_es-cl.js',
            'scripts/vendor/numeraljs/languages/es.js'
          ]);
        }]
      }
    })

    // home
    .state('app.home', {
      url: '/home',
      onEnter: ['auth_service', function (auth_service) { auth_service.checkLoggedIn(); }],
      templateUrl: 'modules/core/views/home.html',
      ncyBreadcrumb: {
          label: 'Inicio',
          icon: 'fa fa-home'
      }
    })

    //error
    .state('app.error', {
      url: '/error404',
      templateUrl: 'modules/core/views/error404.html',
      ncyBreadcrumb: {
          label: 'Página no encontrada'
      }
    })
       
  }]);

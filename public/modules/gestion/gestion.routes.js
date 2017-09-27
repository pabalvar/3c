'use strict';
// Registrar módulo
ApplicationConfiguration.registerModule('gestion');

// Definición de rutas
angular.module('gestion').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider

            /** Gestion : abstract */
            .state('app.gestion', {
                abstract: true,
                onEnter: ['auth_service', function (auth_service) { auth_service.checkLoggedIn(); }],
                url: '/gestion',
                template: '<div ui-view></div>'
            })
    }
]);
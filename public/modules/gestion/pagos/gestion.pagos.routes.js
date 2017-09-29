'use strict';

angular.module('gestion').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider

            /** gestion.pagos : abstract */
            .state('app.gestion.pagos', {
                abstract: true,
                onEnter: ['auth_service', function (auth_service) { auth_service.checkLoggedIn(); }],
                url: '/pagos',
                template: '<div ui-view></div>'
            })
            /** gestion.pagos : clientes */
            .state('app.gestion.pagos.clientes', {
                onEnter: ['auth_service', function (auth_service) { auth_service.checkLoggedIn(); }],
                url: '/clientes',
                templateUrl: 'modules/gestion/pagos/views/gestion.pagos.clientes.html',
                controller:'gestionPagosClientesController',
                ncyBreadcrumb: {
                    parent: 'app.home',
                    label: 'Pagos',
                    icon: 'fa fa-money',
                    menuLevel:1,
                    menuPrio: 20
                }
            })
    }
]);
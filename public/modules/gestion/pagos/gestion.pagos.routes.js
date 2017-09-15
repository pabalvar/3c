'use strict';

angular.module('core').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider

            /** Gestion : abstract */
            .state('app.gestion.pagos', {
                abstract: true,
                onEnter: ['auth_service', function (auth_service) { auth_service.checkLoggedIn(); }],
                url: '/pagos',
                template: '<div ui-view></div>'
            })
            /** Gestion : abstract */
            .state('app.gestion.pagos.clientes', {
                onEnter: ['auth_service', function (auth_service) { auth_service.checkLoggedIn(); }],
                url: '/pagos/clientes',
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
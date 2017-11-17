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
                controller: 'gestionPagosClientesController',
                ncyBreadcrumb: {
                    parent: 'app.home',
                    label: 'Pagos',
                    icon: 'fa fa-money',
                    menuLevel: 1,
                    menuPrio: 20
                }, resolve: {
                    // metaEntidad: ['rndMeta', (rndMeta) => rndMeta.get({ id: 'entidades' })], // Así se inyectaría metadatos
                    plugins: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'scripts/vendor/datatables/Responsive/dataTables.responsive.css',
                            'scripts/vendor/datatables/Responsive/dataTables.responsive.js',
                            'scripts/vendor/datatables/datatables.bootstrap.min.css',
                            'scripts/vendor/datatables/ColumnFilter/jquery.dataTables.columnFilter.js',
                            'scripts/vendor/datatables/Select/js/dataTables.select.min.js'
                        ]);
                    }]
                },
            })
    }
]);
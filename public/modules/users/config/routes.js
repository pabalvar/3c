'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
    function ($stateProvider) {
        // Users state routing
        $stateProvider

            //Login Route
            .state('login', {
                url: '/login',
                templateUrl: 'modules/users/views/authentication/login.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth_service', function ($state, auth_service) {
                    if (auth_service.isLoggedIn()) { $state.go('app.home'); }
                }]
            })

            //CRUD Routes for Users
            .state('app.users', {
                abstract: true,
                url: '/users',
                onEnter: ['auth_service', function (auth_service) { auth_service.checkLoggedIn(); }],
                template: '<div ui-view></div>'
            })
            .state('app.users.list', {
                url: '/list',
                templateUrl: 'modules/users/views/users/list.html',
                onEnter: ['auth_service', function (auth_service) { auth_service.checkLoggedIn(); }],
                ncyBreadcrumb: {
                    parent: 'app.home',
                    label: 'Usuarios web',
                    icon: 'fa fa-laptop',
                    menuLevel: 1,
                    menuPrio: 50
                },
                resolve: {
                    plugins: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'scripts/vendor/datatables/Responsive/dataTables.responsive.css',
                            'scripts/vendor/datatables/Responsive/dataTables.responsive.js',
                            'scripts/vendor/datatables/datatables.bootstrap.min.css'
                        ]);
                    }]
                }
            })
            .state('app.users.new', {
                url: '/new',
                templateUrl: 'modules/users/views/users/new.html',
                onEnter: ['auth_service', function (auth_service) { auth_service.checkLoggedIn(); }],
                ncyBreadcrumb: {
                    parent: 'app.users.list',
                    label: 'Nuevo Usuario'
                }
            })
            .state('app.users.edit', {
                url: '/edit/:user_id',
                controller: 'UserCtrl',
                templateUrl: 'modules/users/views/users/edit.html',
                onEnter: ['auth_service', function (auth_service) { auth_service.checkLoggedIn(); }],
                ncyBreadcrumb: {
                    parent: 'app.users.list',
                    label: 'Editando Usuario | {{user.email}}'
                }
            })
            .state('app.users.show', {
                url: '/show/:user_id',
                controller: 'UserCtrl',
                templateUrl: 'modules/users/views/users/show.html',
                onEnter: ['auth_service', function (auth_service) { auth_service.checkLoggedIn(); }],
                ncyBreadcrumb: {
                    parent: 'app.users.list',
                    label: 'Usuario | {{user.email}}'
                }
            });
    }
]);
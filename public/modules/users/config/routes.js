'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
    function ($stateProvider) {
        // Users state routing
        $stateProvider
            /*.
            state('profile', {
                url: '/settings/profile',
                templateUrl: 'modules/users/views/settings/edit-profile.html'
            }).
            state('password', {
                url: '/settings/password',
                templateUrl: 'modules/users/views/settings/change-password.html'
            }).
            state('accounts', {
                url: '/settings/accounts',
                templateUrl: 'modules/users/views/settings/social-accounts.html'
            }).
            state('signup', {
                url: '/signup',
                templateUrl: 'modules/users/views/authentication/signup.html'
            }).
            state('signin', {
                url: '/signin',
                templateUrl: 'modules/users/views/authentication/signin.html',
                ncyBreadcrumb: {
                    parent:'home',
                label: 'Login'
              }
            }).
            state('forgot', {
                url: '/password/forgot',
                templateUrl: 'modules/users/views/password/forgot-password.html'
            }).
            state('reset-invalid', {
                url: '/password/reset/invalid',
                templateUrl: 'modules/users/views/password/reset-password-invalid.html'
            }).
            state('reset-success', {
                url: '/password/reset/success',
                templateUrl: 'modules/users/views/password/reset-password-success.html'
            }).
            state('reset', {
                url: '/password/reset/:token',
                templateUrl: 'modules/users/views/password/reset-password.html'
            })
            */

            //Login Route
            .state('login', {
                url: '/login',
                templateUrl: 'modules/users/views/authentication/login.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth_service', function ($state, auth_service) {
                    if (auth_service.isLoggedIn()) {$state.go('app.home');}
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
                    menuLevel:1,
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
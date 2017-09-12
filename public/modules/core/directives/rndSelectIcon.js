'use strict';
angular.module("core")
    /** Selecciona en profile.selected. Requiere profile.data=[{id:'',name:'',default:true|false}] **/
    .directive("rndSelectIcon", function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                profiles: '=',
                showSelected: '@',
                icon: '@',
                title: '@'
            },
            templateUrl: 'modules/core/directives/rndSelectIcon.html',
            controller: function ($scope) {

                // init default como seleccionado
                $scope.profiles.data.forEach(function (p) {
                    if (p.default) {
                        $scope.profiles.selected = p;
                    }
                });

                /** función que selecciona el perfil **/
                $scope.setProfile = function (id) {
                    $scope.profiles.data.forEach(function (p) {
                        if (p.id == id) {
                            $scope.profiles.selected = p;
                        }
                    })
                }
            }
        }
    })

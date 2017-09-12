'use strict';
angular.module("core")

    .directive("rndSelectTabs", function () {
        return {
            restrict: 'E',
            scope: {
                resource: '=',
                keyprop: "@",
                nameprop: "@",
                ctrl: '='
            },
            templateUrl: 'modules/core/directives/rndSelectTabs.html',
            controller: function ($scope, $timeout) {
                // Función controladora
                if ($scope.ctrl) {
                    /** Dado key (codigo) indexa como objeto y array los tab seleccionados. Eg select('AFP') */
                    $scope.ctrl.select = function (Key) {
                        // convertir a array si es string
                        var key = (Key.constructor === Array)?Key:[Key]; 
                        // indexar en objeto selected={AFP:true,HABERES:true}
                        $scope.ctrl.selected = key.reduce(function(ret,i){ret[i]=true;return ret;},{});
                        // Rearmar como array (para el watcher)
                        $scope.ctrl.selectedArr = Object.keys($scope.ctrl.selected);
                    }

                    // Inicializar si viene el campo init
                    if ($scope.ctrl.init){
                        console.log("inicializando rndSelectTabs: ", $scope.ctrl.init)
                        $scope.ctrl.select($scope.ctrl.init);
                    }
                    
                }

                // Función para toggle tabs de clases
                $scope.toggleTab = function (event, clase) {
                    $scope.ctrl.selected = $scope.ctrl.selected || {};

                    if (event.ctrlKey) {
                        $scope.ctrl.selected[clase] = $scope.ctrl.selected[clase] ? false : true; // toggle con ctrl-click
                    } else if (event.shiftKey) {
                        // Seleccionar rango de tabs
                        var reachedClicked = false;
                        var reachedActive = false;
                        $scope.resource.data.forEach(function (c) {
                            if (c[$scope.keyprop] == clase) reachedClicked = true;
                            if ($scope.ctrl.selected[c[$scope.keyprop]]) reachedActive = true;
                            if ((reachedClicked ^ reachedActive) || c[$scope.keyprop] == clase) $scope.ctrl.selected[c[$scope.keyprop]] = true;
                        });
                    } else {
                        $scope.ctrl.selected = { [clase]: true }; // selecciona con click
                    }
                    // Rearmar como array (para el watcher)
                    $scope.ctrl.selectedArr = Object.keys($scope.ctrl.selected);
                }
            }
        }
    })

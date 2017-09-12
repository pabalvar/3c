'use strict';
angular.module("core")
    .directive("rndExcel", function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                data: "=",
                model: "="
            },
            templateUrl: 'modules/core/directives/rndExcel.html',
            controller: function ($scope, rndExcel) {
                $scope.toExcel = function () {
                    rndExcel.modelToExcel($scope.data, $scope.model, { fileName: 'RandomERP_reporte.xls', title: 'export_random' });
                }


            }
        }
    })
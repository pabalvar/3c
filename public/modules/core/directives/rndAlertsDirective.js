'use strict';
angular.module("core")
    .directive("rndAlerts", function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                service: '=',
                isBusy: '='
            },
            templateUrl: 'modules/core/directives/rndAlertsDirective.html'
        }
    })
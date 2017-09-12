'use strict';
angular.module("core")
    .directive("rndAlerts", function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                alertService: '=',
                isBusy: '='
            },
            template: `<div ng-show="!(isBusy[0].busy || isBusy[1].busy || isBusy[2].busy || isBusy[3].busy)"><div uib-alert ng-repeat="alert in alertService.alerts" close="alertService.close($index)" ng-class="'alert-'+alert.type"><i class="fa {{alert.icon}}"/>{{alert.msg}}</div></div>`,
        }
    })






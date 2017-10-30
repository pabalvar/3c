angular.module('core')
.directive('rndCounter', [
    function () {
        return {
            restrict: 'EA',
            scope: {
                ws: '=',
            },
            template:`<div ng-class="ws?'':'busy'"><p class="help-block ml-5 text-default">
            <span ng-show="ws.busy"><i class="fa fa-refresh fa-spin fa mr-5"/></span>
            <span ng-show="!ws.busy" class="text-strong mr-5">{{ws.recordsTotal}}</span>
            <span>resultados coincidentes</span></p></div>`
        }
    }
]
)
angular.module('core')
.directive('rndDialog', [
    function () {
        return {
            restrict: 'EA',
            scope: {
                linea: '=',
            },
            template:`
            <div ng-switch="linea.$estado.$action">
            <i ng-switch-when="M" class='fa fa-pencil-square text-warning'></i>
            <i ng-switch-when="N" class='fa fa-plus-circle  text-default'></i>
            <i ng-switch-when="D" class='fa fa-times-circle text-danger'></i>
            <i ng-switch-when="E" class='fa fa-exclamation-circle'></i>
            </div>`
        }
    }
]
)

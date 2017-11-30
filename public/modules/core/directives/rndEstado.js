angular.module('core')

    .directive('rndEstado', [
        function () {
            return {
                restrict: 'EA',
                scope: {
                    line: '='
                },
                template:`
                <span ng-switch="line.$estado.$action">
                    <span ng-switch-when="M" class="text-success" uib-tooltip="modificado">
                        <fa name="pencil-square"/>
                    </span>
                    <span ng-switch-when="N" class="text-success" uib-tooltip="nuevo">
                        <fa name="plus-circle"/>
                    </span>
                    <span ng-switch-when="D" class="text-danger" uib-tooltip="eliminado">
                        <fa name="times-circle"/>
                    </span>
                    <span ng-switch-when="E" class="text-danger" uib-tooltip="{{line.$estado.$message}}">
                        <fa name="exclamation-circle"/>
                    </span>     
                </span>`

            }
        }
    ]
    )
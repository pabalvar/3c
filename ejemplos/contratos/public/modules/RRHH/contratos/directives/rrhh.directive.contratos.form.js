angular.module('RRHH')

    .directive('rrhhContratosForm', [
        function () {
            return {
                restrict: 'EA',
                scope: {
                    contrato: '=',
                    contratos: '=',
                    model: '=',
                    modelcontrato: '=',
                    lineaction: '='
                },
                templateUrl: 'modules/RRHH/contratos/directives/rrhh.directive.contratos.form.html'
            }
        }
    ]
    )
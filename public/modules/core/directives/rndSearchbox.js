angular.module('core')

    .directive('rndSearchbox', [
        function () {
            return {
                restrict: 'EA',
                scope: {
                    source: '=',
                    options: '=?options',
                    onSelect: '=?onSelect',
                    dataset: '=?dataset',
                    meta: '=',
                    rtablas: '='
                },
                templateUrl: 'modules/core/directives/rndSearchbox.html',
                controller: ['$scope', function ($scope) {

                    // convertir el $resource en una función que acepta "texto", usada por la directiva
                    $scope.sourceP = function (texto) {

                        // ejecutar la promesa
                        return $scope.source({ search: texto }).$promise
                            .then(function (res) {
                                // incluir una referencia en cada línea a metadatos y rtablas (se necesita para renderizar opciones)
                                res.data.forEach(function (d) { d.$meta = $scope.meta; d.$rtablas = $scope.rtablas })
                                return res.data
                            })
                    };

                    // parámetros por defecto para mostrar en directiva
                    $scope.options = $scope.options || {};
                    $scope.options.placeholder = 'buscar';

                    // callback al seleccionar
                    $scope.onSelectLocal = onSelectLocal;

                    function onSelectLocal($item, $model, $label, $event) {
                        // deshacer apéndice "$model" que se anexó eventualmente en controlador parent
                        delete ($item.$meta);
                        delete ($item.$rtablas);

                        // copiar selección y borrar
                        var ret = angular.copy($scope.selected);
                        $scope.selected = undefined;

                        // Si se pasó un arreglo, hacer push del valor
                        if (angular.isArray($scope.dataset)) $scope.dataset.push(ret);

                        // llamar al callback de parent controlador
                        if (typeof ($scope.onSelect) == "function") {
                            $scope.onSelect(ret, $model, $label, $event)
                        }
                        //console.log("retorna: ", ret)
                    }

                }]
            }
        }
    ]
    )
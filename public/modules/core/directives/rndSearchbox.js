angular.module('core')
    /**
    * @ngdoc directive 
    * @name core.directive:rndSearchbox 
    * @restrict 'E'
    * @scope
    * @param {Promise|Array} source Array de objeto con datos o bien función que entrega una promesa
    * @param {Array} meta Objeto de metadatos de datos de source 
    * @param {Array} dataset (retorno) Datos seleccionados 
    * @param {Object} rtablas Objeto rtabla para enmascarar datos
    * @param {Object} options Objeto de opciones. (recomendado poblar en html)
    * @param {string} options.placeholder Texto a mostrar en el campo de búsqueda
    * @element ANY
    * @description
    * Directiva que permite seleccionar elemento mientras se escribe. Requiere una promesa o un array, además de un objeto metadatos.<br>
    * <img src="img/rndSearchbox.jpg" alt="rndSearchbox">
    * @example
    * <pre>   
    <script>
    
    // Metadatos
     $scope.metaEntidad = [
      { field: "NOKOEN", name: "Nombre", visible: true, datatype: 'string:capitalize' },
      { field: "KOEN", name: "Código", visible: true, pk: true },
      { field: "TIEN", name: "Tipo", visible: true, datatype: 'rtabla', tabla: 'TipoEntidad', options: { returnSrv: "id", returnClient: "name" } },
      { field: "SUEN", name: "Suc.", visible: true, pk: true }
     ]
    
     // Array para guardar el dato seleccionado
     $scope.pasoEntidad = [];
    
     // Función (promesa en este caso) que pide datos
    $scope.traeEntidad = function(query){
     return entidades.get({ 
         fields: $scope.metaEntidad.map(m => m.field), 
         search: query.search, 
         size: 10, 
         order: 'NOKOEN' 
     });
    }
    
    </script>
    
    <rnd-searchbox options="{placeholder:'buscar entidad'}"
        meta="metaEntidad"
        dataset="pasoEntidad"
        source="traeEntidad"
        rtablas="rtablas">
    </rnd-searchbox>
    </pre>
    **/
    .directive('rndSearchbox', [
        function () {
            return {
                restrict: 'E',
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
                    $scope.$offline = false;

                    // convertir el $resource en una función que acepta "texto", usada por la directiva
                    $scope.sourceP = function (texto) {
                        // ejecutar la promesa
                        return $scope.source({ search: texto }).$promise
                            .then(function (res) {
                                $scope.$offline = false;
                                // incluir una referencia en cada línea a metadatos y rtablas (se necesita para renderizar opciones)
                                res.data.forEach(function (d) { d.$meta = $scope.meta; d.$rtablas = $scope.rtablas })
                                return res.data
                            })
                            .catch(function (err){
                                $scope.$offline = true;
                                console.log("error", err)
                            })
                    };

                    // parámetros por defecto para mostrar en directiva
                    $scope.options = $scope.options || {};
                    $scope.options.placeholder = 'buscar';

                    // callback al seleccionar
                    $scope.onSelectLocal = onSelectLocal;
                    /** @ngdoc method
                     * esta huea */
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
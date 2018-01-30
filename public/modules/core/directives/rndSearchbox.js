angular.module('core')
    /**
    * @ngdoc directive 
    * @name core.directive:rndSearchbox 
    * @restrict 'E'
    * @scope
    * @param {Promise|Array} source Array de objeto con datos o bien función que entrega una promesa
    * @param {rndMeta} meta Objeto de metadatos de datos de source 
    * @param {Array} dataset (retorno) Datos seleccionados 
    * @param {rndRtabla} rtablas Objeto rtabla para enmascarar datos
    * @param {Object} options Objeto de opciones. (recomendado poblar en html)
    * @param {string} options.placeholder Texto a mostrar en el campo de búsqueda
    * @param {string} options.nameprop Field del metadato a usar en el la lísta de resultados como principal
    * @param {boolean} options.keep Guarda selecciones en dataset (por defecto reemplaza con la última)
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
                    dialog: '=?dialog',
                    dataset: '=?dataset',
                    meta: '=',
                    rtablas: '=',
                    api: '='
                },
                templateUrl: 'modules/core/directives/rndSearchbox.html',
                controller: ['$scope', 'rndDialog', 'focus', function ($scope, rndDialog, focus) {

                    /** Inicialización */

                    // $offline indica cuando no hay conexión
                    $scope.$offline = false;

                    // Inicializar id de instancia
                    $scope.id = rndDialog.newRandomString()();

                    // Inicializar API instancia
                    $scope.api = $scope.api || {};
                    $scope.api.id = $scope.id;

                    // Inicializar opciones por defecto para mostrar en directiva
                    $scope.options = $scope.options || {};
                    $scope.options.placeholder = 'buscar';

                    // índice de columna en meta que contiene el nombre principal a mostrar
                    $scope.namepropIx = getNamePropIx($scope.options, $scope.meta);

                    // callback al seleccionar item
                    $scope.onSelectLocal = onSelectLocal;

                    // convertir el $resource en una función que acepta "texto", usada por la directiva
                    $scope.sourceP = sourceP;

                    // Si viene opción getFocus, fijar foco en campo de search
                    $scope.dialog = $scope.dialog||{}
                    if ($scope.dialog.getFocus) getFocus(200)

                    /** Detalles implementación */

                    // Función que data una entrada de texto, llama al recurso con texto como parámetro search
                    function sourceP(texto) {

                        // ejecutar la promesa
                        return $scope.source({ search: texto }).$promise
                            .then(function (res) {
                                $scope.$offline = false;

                                // incluir una referencia en cada línea a metadatos y rtablas (se necesita para renderizar opciones)
                                res.data.forEach(function (d) { d.$meta = $scope.meta; d.$rtablas = $scope.rtablas })
                                return res.data
                            })
                            .catch(function (err) {
                                $scope.$offline = true;
                                console.log("error", err)
                            })
                    };


                    // Buscar qué campo mostrar en línea principal
                    function getNamePropIx(options, meta) {
                        var namePropIx = -1;
                        if (options.nameprop) {
                            namePropIx = meta.data.findIndex(f => f.field == options.nameprop)
                            if (namePropIx < 0) console.warn("rndSearchbox: no hay metadato llamado " + options.nameprop);
                        } else {
                            namePropIx = meta.findIndex(f => f.nameprop);
                        }
                        var ret = (namePropIx < 0) ? 1 : namePropIx; // Si ninguna columna es nameprop, usar columna 1
                        return ret;
                    }


                    function onSelectLocal($item, $model, $label, $event) {
                        // deshacer apéndice "$model" que se anexó eventualmente en controlador parent
                        delete ($item.$meta);
                        delete ($item.$rtablas);

                        // copiar selección y borrar
                        var ret = angular.copy($scope.selected);
                        $scope.selected = undefined;

                        // Si se pasó un arreglo entregar valor
                        if (angular.isArray(($scope.dataset || {}).data)) {
                            // Opción keep -> push
                            if ($scope.options.keep) $scope.dataset.data.push(ret);
                            // sin opción keep -> reemplaza valor por el actual
                            else $scope.dataset.data[0] = ret;
                        }

                        // llamar al callback de parent controlador
                        if (typeof (($scope.dialog || {}).onChange) == "function") {
                            $scope.dialog.onChange(ret, $model, $label, $event);
                        }
                        //console.log("retorna: ", ret)
                    }

                    // Fija el foco en cuadro de búsqueda
                    function getFocus(delay) {
                        console.log("fijando foco en id=", $scope.id)
                        //if (!$scope.id) console.log("no hay id!")
                        focus($scope.id, delay);
                    }

                }]
            }
        }
    ]
    )
angular.module('core')
    /**
    * @ngdoc directive 
    * @name core.directive:rndProfile 
    * @restrict 'EA'
    * @scope
    * @param {Promise|Array} source Array de objeto con datos o bien función que entrega una promesa
    * @param {rndMeta} meta Objeto de metadatos de datos de source 
    * @param {rndRtabla} rtablas Objeto rtabla para enmascarar datos
    * @param {Object} options Objeto de opciones. (recomendado poblar en el html)
    * @param {string} options.title Título del cuadro
    * @param {string} options.showEmpty texto a mostrar si no hay datos (acepta html)
    * @param {string} options.nameprop Field del metadato a usar en el la lísta de resultados como principal
    * @element ANY
    * @description
    * Directiva que permite seleccionar elemento mientras se escribe. Requiere una promesa o un array, además de un objeto metadatos.<br>
    * <img src="img/rndProfile.png" alt="rndProfile">
    * @example
    * <pre>   
    <script>
    
    // Metadatos
     $scope.metaEntidad = {data:[
      { field: "NOKOEN", name: "Nombre", visible: true, datatype: 'string:capitalize' },
      { field: "KOEN", name: "Código", visible: true, pk: true },
      { field: "TIEN", name: "Tipo", visible: true, datatype: 'rtabla', tabla: 'TipoEntidad', options: { returnSrv: "id", returnClient: "name" } },
      { field: "SUEN", name: "Suc.", visible: true, pk: true }
     ]}
    
     // Array para guardar el dato seleccionado
     $scope.pasoEntidad = {data:[]};
    
     // Función (promesa en este caso) que pide datos
    $scope.traeEntidad = function(query){
     return entidades.get({ 
         fields: $scope.metaEntidad.map(m => m.field), 
         search: query.search, 
         size: 10, 
         order: 'NOKOEN' 
     },$scope.pasoEntidad);
    }
    
    </script>
    
<!-- Entidad -->
<rnd-profile 
    meta="metaEntidad.data"
    options="{showEmpty:'<h2>¡Nadie aquí!</h2><p>Usa el cuadro de búsqueda para traer la deuda de un cliente</p>', title:'Datos entidad'}"
    source="pasoEntidad"
    rtablas="metaEntidad.rtablas">
</rnd-profile>
<!-- /Entidad -->
    </pre>
    **/
    .directive('rndProfile', [
        function () {
            return {
                restrict: 'EA',
                scope: {
                    options: "=",
                    dataset: "=",
                    source: "=",
                    meta: "=",
                    rtablas: "=?rtablas",
                },
                templateUrl: 'modules/core/directives/rndProfile.html',
                controller: ['$scope', function ($scope) {
                    // Buscar qué campo mostrar en línea principal
                    var namePropIx = -1;
                    if ($scope.options.nameprop) {
                        namePropIx = $scope.meta.data.findIndex(f => f.field == $scope.options.nameprop)
                        if (namePropIx < 0) console.warn("rndProfile: no hay metadato llamado " + $scope.options.nameprop);
                    } else {
                        namePropIx = $scope.meta.data.findIndex(f => f.nameprop);
                    }
                    $scope.namepropIx = (namePropIx < 0) ? 1 : namePropIx; // Si ninguna columna es nameprop, usar columna 1
                }]
            }
        }
    ]
    )

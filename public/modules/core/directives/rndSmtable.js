'use strict';
/**
* @ngdoc directive 
* @name core.directive:rndSmtable 
* @restrict 'E'
* @scope
* @param {Object} source Objeto que contiene los datos
* @param {Array} source.data Colección de objetos de datos
* @param {Object} meta Objeto de metadatos de datos de <code>source</source> 
* @param {Object} rtablas Objeto rtabla para enmascarar datos
* @param {Object} options Objeto de opciones. (recomendado poblar en vista)
* @param {string} options.title título a mostrar sobre la tabla
* @param {string} options.showEmpty texto a mostrar si no hay datos  (acepta html)
* @param {Object} dialog Objeto con funciones para regular lógica
* @param {function} dialog.selectRow función a llamar cuando se hace click en una línea. Se llama con los parámetros  <code>("objeto linea", source, meta, rtablas)</code>
* @element ANY
* @description
* Directiva que permite mostrar una tabla. Requiere una promesa o un array, además de un objeto metadatos.<br>
* <img src="img/rndSmtable.png" alt="rndSmtable">
* @example
* <pre>   
<script>

// Metadatos
$scope.metaDeuda = [
    { field: "IDMAEEDO", name: "IDMAEEDO", visible: false, pk: true },
    { field: "EMPRESA", name: "Emp.", description: "Empresa", visible: false },
    { field: "TIDO", name: "DP", description: "Tipo documento", visible: true },
    { field: "NUDO", name: "Número", visible: true },
    { field: "SUENDO", name: "Suc.", visible: false },
    { field: "TIMODO", name: "Timodo", visible: false },
    { field: "TAMODO", name: "Tamodo", visible: false },
    { field: "ESPGDO", name: "Estado doc.", visible: true, datatype: 'rtabla', tabla: 'EstadoPago', options: { returnSrv: "id", returnClient: "name" } },
    { field: "FEULVEDO", name: "Fecha venc.", visible: true, datatype: 'date' },
    { field: "MODO", name: "M", description: "Moneda", visible: true },
    { field: "VABRDO", name: "Valor doc.", visible: true, datatype: 'number' },
    { field: "VAABDO", name: "Saldo ant.", visible: true, datatype: 'number' },
    { field: "VAIVARET", name: "Valor IVA ret.", visible: false, datatype: 'number' },
    { field: "VAIVDO", name: "Valor IVA doc.", visible: false, datatype: 'number' },
    { field: "VANEDO", name: "Valor neto doc.", visible: false, datatype: 'number' },
    { field: "BLOQUEAPAG", name: "Bloquea pago", visible: false },
    { field: "ASIG", name: "Saldo actual", visible: true, datatype: 'number' }
]

// Objecto para guardar datos obtenidos
$scope.pasoDeuda = { data: [] };

// Función que pide los datos al servidor
$scope.traeDeuda = function (query) {
    return ws(documentos.traeDeuda.get, {
        fields: $scope.metaDeuda.map(m => m.field),
        koen: $scope.pasoEntidad.map(e => e.KOEN),
        empresa: rndEmpresa.get(),
        size: 10,
        order: 'FEULVEDO'
    }, $scope.pasoDeuda, creaCruce);
}

// Opciones
$scope.optDeuda = {
    showEmpty:'<h2>¡Todo pagado!</h2><p>no tiene deuda</p>', 
    title:'Documentos pendientes'
}

</script>

<rnd-smtable 
  meta="metaDeuda"
  options="optDeuda"
  source="pasoDeuda"
  dialog="{selectRow:selectRow}"
  rtablas="rtablas">
</rnd-smtable>
</pre>
**/
angular.module('core')
    .directive("rndSmtable", function () {
        return {
            restrict: 'E',
            scope: {
                options: "=",
                source: "=",
                meta: "=",
                rtablas: "=?rtablas",
                dialog: "=?dialog",
                api: "=?api"
            },
            templateUrl: 'modules/core/directives/rndSmtable.html',
            controller: 'rndSmtable'
        }
    })
    .controller("rndSmtable", ['$scope', 'rndDialog', 'rndORM', '$timeout', 
    function ($scope, rndDialog, rndORM, $timeout) {
        // ID aleatorio al objeto <table>
        $scope.id = rndORM.newRandomString()();

        // Anexar instancia
        $scope.api = $scope.api || {};
        $scope.api.clickRow = clickRow;

        /** Función que simula un click en una línea */
        function clickRow(rowIx){

            // definir el selector como ".id tr:nth-child(rowIx)"
            var selector = `.${$scope.id} tbody tr:nth-child(${rowIx+1})`;

            // Obtener objeto del DOM
            

            // aplicar trigger (en diferido)
            $timeout(function(){
                var el = angular.element(selector);
                console.log("el: ", el);
                el.trigger('click')
            }, 0);
        }

        /* Función utilizada para ocultar líneas por controlador */
        $scope.isLineVisible = function (line) { return !rndDialog.isLineHidden(line) };

        // Select row
        $scope.selectRow = function (linea) {
            //console.log("click en: ", linea)
            if (($scope.dialog || {}).selectRow) {
                $scope.dialog.selectRow(linea, $scope.source, $scope.meta, $scope.rtablas);
            }
        }

        // Show empty: si es true se muestra la tabla vacía, false no, texto se agrega
        if ($scope.options.showEmpty === true) $scope.alwaysShow = true;
        else {
            if (typeof ($scope.options.showEmpty) == 'string') {
                $scope.emptyHintHtml = $scope.options.showEmpty;
            } else {
                $scope.emptyHintHtml = '<h2>Ingresa datos</h2><p>para seguir</p>'
            }
        }




    }])

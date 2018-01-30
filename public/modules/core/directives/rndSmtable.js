'use strict';
/**
* @ngdoc directive 
* @name core.directive:rndSmtable 
* @restrict 'E'
* @scope
* @param {rndResource} source Objeto que contiene los datos
* @param {Array} source.data Colección de objetos de datos
* @param {rndMeta} meta Objeto de metadatos de datos de <code>source</source> 
* @param {rndRtabla} rtablas Objeto rtabla para enmascarar datos
* @param {Object} options Objeto de opciones. (recomendado poblar en vista)
* @param {string} options.title título a mostrar sobre la tabla
* @param {string} options.showEmpty texto a mostrar si no hay datos
* @param {integer} options.pagesize  número de filas a paginar 
* @param {integer} options.pageheight  fija el tamaño de la ventana (medido en número de filas) 
* @param {boolean} options.globalsearch incluye campo búsqueda global 
* @param {boolean} options.filtersearch incluye campo búsqueda por campo 
* @param {Object} dialog Objeto con funciones para regular lógica
* @param {function} dialog.selectRow función a llamar cuando se hace click en una línea. Se llama con los parámetros  <code>("objeto linea", source, meta, rtablas)</code>
* @param {function} dialog.onChange función a llamar cuando se modifica un dato. Se llama con los parámetros  <code>(newVal, oldVal, "objeto linea", source, rowIx, field, meta)</code>
* @param {function} dialog.onAddRow función a llamar después de crear línea. Se llama con los parámetros  <code>("objeto linea", source, rowIx)</code>
* @param {boolean} dialog.canCreate si permite crear líneas
* @param {Object} api Objeto de salida que expone el controlador de la tabla
* @param {function} api.clickRow función que permite simular un click sobre una línea. Paramétro: <code>rowIx</code>
* @param {function} api.redraw función recrea los objetos rnd-input de la tabla en estado edición
* @param {function} api.goToPage función simula botón ir a página. Parámetro: <code>pageIx</code> (parte en 1)
* @param {function} api.addRow función simula botón add row
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
    .controller("rndSmtable", ['$scope', 'rndDialog', '$timeout',
        function ($scope, rndDialog, $timeout) {

            /** Inicialización */

            // Inicializar id de instancia
            $scope.id = rndDialog.newRandomString()();

            // Inicializar API instancia
            $scope.api = $scope.api || {};
            $scope.api.clickRow = clickRow;
            $scope.api.goToPage = goToPage;
            $scope.api.goToRow = goToRow;
            $scope.api.redraw = redraw;
            $scope.api.addRow = addRow;
            $scope.api.id = $scope.id;
            // $scope.api.change = change;
            $scope.api.validate = validate; // mostrar validate de rndDialog

            // función que controla los comandos de teclado 
            $scope.onKeydown = onKeydown;

            // Funcíón auxiliar que entrega valor de !data.$estado.hidden 
            $scope.isLineVisible = isLineVisible;

            // Al seleccionar la línea
            $scope.selectRow = selectRow;

            // Html a mostrar cuando está vacío
            $scope.emptyHintHtml = renderEmptyHint($scope.options);


            /** Detalles de implementación */

            function onKeydown($event) {
                $event.stopPropagation()
                console.log("keydown on element:2", $event, " key:", $event.keyCode);
                // Add Row con Enter
                switch ($event.keyCode) {
                    case 38: tableGoUp($event); break;
                    case 40: tableGoDown($event); break;
                    case 39: tableGoRight($event); break;
                    case 37: tableGoLeft($event); break;
                }
                if ($event.keyCode == 13) {
                    // if ($scope.dialog.canCreate) addRow();
                }
            }

            function getFieldFromClassList(el) {
                var ret;
                el.classList.forEach(c => {
                    if (c.match(/field-/)) ret = c.replace("field-", "");
                })
                return ret;
            }
            function tableGoUp($event) {
                // Get field class of cell
                var td = $event.target.closest('td');
                var field = getFieldFromClassList(td);
                var tr = td.closest('tr');
                var prevTr = tr.previousElementSibling;
                var goalTd = angular.element(prevTr).find('.field-' + field + " input");
                goalTd.trigger('focus',100);
            }
            function tableGoDown($event) {
                var td = $event.target.closest('td');
                var field = getFieldFromClassList(td);
                var tr = td.closest('tr');
                var nextTr = tr.nextElementSibling;
                var goalTd = angular.element(nextTr).find('.field-' + field + " input");
                goalTd.trigger('focus',100);
            }
            function tableGoRight($event) {
                var td = $event.target.closest('td');
                var field = getFieldFromClassList(td);
                var goalTd = td.nextElementSibling.find('.field-' + field + " input");
                /*var field = getFieldFromClassList(td);
                var tr = td.closest('tr');
                var nextTr = ts.nextElementSibling;
                var goalTd = angular.element(nextTr).find('.field-' + field + " input");*/
                goalTd.trigger('focus',100);
            }

            function renderEmptyHint(options) {
                var ret = '';
                if (typeof (options.showEmpty) == 'string') {
                    ret = options.showEmpty;
                } else {
                    ret = '<h2>Ingresa datos</h2><p>para seguir</p>'
                }
                return ret;
            }

            function validate() {
                rndDialog.validate($scope.source, $scope.meta);
            }

            /* Función que inicializa y crea una nueva línea */
            function addRow() {
                var obj = rndDialog.createObject($scope.meta, 0, $scope.rtablas);
                rndDialog.setLineOpen(obj);
                rndDialog.setLineNew(obj);
                $scope.source.data.push(obj);
                // Llamar al controlador si se pasó onAddRow
                var rowIx = $scope.source.data.length - 1;
                if ($scope.dialog.onAddRow) {
                    $scope.dialog.onAddRow(obj, $scope.source, rowIx);
                }

                // Si la nueva línea quedó en otra página, ir a la página

            }

            function goToRow(rowIx) {
                // Calcular la página que contiene a rowIx
                var page = Math.floor(rowIx / ($scope.options.pagesize || 9999999)) + 1;
                goToPage(page);
            }

            function goToPage(page) {
                var selector;
                // definir el selector como ".id tr:nth-child(rowIx)"
                if (page == 1) {
                    selector = `table.${$scope.id} thead.table-head-pagination  li.table-first-page a`;
                } else {
                    selector = `table.${$scope.id} thead.table-head-pagination  li.table-last-page a`;
                }
                // XX ToDo: ir a una página distinta a la primera y última

                // aplicar trigger (en diferido para asegurar esté renderizado)
                $timeout(function () {
                    // Obtener objeto del DOM
                    var el = angular.element(selector);
                    el.trigger('click')
                    clickInput();
                });
            }

            /** Función que simula un click en una línea */
            function clickInput(rowIx) {
                var selector = `table.${$scope.id} tbody tr:last-child > td :input:first`;

                // aplicar trigger (en diferido para asegurar esté renderizado)
                $timeout(function () {
                    // Obtener objeto del DOM
                    var el = angular.element(selector);
                    //console.log("clicke", el);
                    el.trigger('focus')
                    clickRow()
                });
            }

            /** Función que simula un click en una línea */
            function clickRow(rowIx) {

                // definir el selector como ".id tr:nth-child(rowIx)"
                var selector = `table.${$scope.id} tbody tr:last-child`;

                // aplicar trigger (en diferido para asegurar esté renderizado)
                $timeout(function () {
                    // Obtener objeto del DOM
                    var el = angular.element(selector);
                    el.trigger('click')
                });
            }

            /* Función que fuerza el redibujado de la tabla */
            function redraw() {
                console.log("redrawing");
                $scope.blink = true;
                $timeout(() => { $scope.blink = false }, 0);
            }

            /* Función utilizada para ocultar líneas por controlador */
            function isLineVisible(line) { return !rndDialog.isLineHidden(line) };

            /** Función llamada al hacer click en línea. Llama a su vez a selectRow del controlador (si existe) */
            function selectRow(linea) {
                if (($scope.dialog || {}).selectRow) {
                    $scope.dialog.selectRow(linea, $scope.source, $scope.meta, $scope.rtablas);
                }
            }

        }])

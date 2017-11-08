'use strict';
/**
* @ngdoc directive 
* @name core.directive:rndDatatable 
* @restrict 'E'
* @scope
* @param {Promise|Array} source Array de objeto con datos o bien función que entrega una promesa
* @param {Object} meta Objeto de metadatos de datos de source 
* @param {Object} rtablas Objeto rtabla para enmascarar datos
* @param {Object} options Objeto de opciones. (recomendado poblar en html)
* @param {string} options.placeholder Texto a mostrar en el campo de búsqueda
* @param {string} options.title título a mostrar sobre la tabla (acepta html)
* @param {boolean} options.info muestra paginación
* @param {boolean} options.search muestra campo de texto de búsqueda local
* @param {boolean} options.pagination muestra controles de paginación (local)
* @element ANY
* @description
* Directiva que permite mostrar una tabla. Requiere una promesa o un array, además de un objeto metadatos.<br>
* <img src="img/rndDatatable.jpg" alt="rndDatatable">
* @example
* <pre>   
<script>

// Metadatos 
$scope.metaDeuda = [
 { field: "IDMAEEDO", name: "IDMAEEDO", visible: false, pk: true },
 { field: "EMPRESA", name: "Emp.", description:"Empresa", visible: true },
 { field: "TIDO", name: "DP", description:"Tipo documento", visible: true },
 { field: "NUDO", name: "Número", visible: true },
 { field: "SUENDO", name: "Suc.", visible: false },
 { field: "TIMODO", name: "Timodo", visible: false },
 { field: "TAMODO", name: "Tamodo", visible: false },
 { field: "ESPGDO", name: "Estado doc.", visible: true, datatype: 'rtabla', tabla: 'EstadoPago', options: { returnSrv: "id", returnClient: "name" } },
 { field: "FEULVEDO", name: "Fecha venc.", visible: true, datatype: 'date' },
 { field: "MODO", name: "M", description:"Moneda", visible: true },
 { field: "VABRDO", name: "Valor doc.", visible: true, datatype: 'number' },
 { field: "VAABDO", name: "Saldo ant.", visible: true, datatype: 'number' },
 { field: "VAIVARET", name: "Valor IVA ret.", visible: false, datatype: 'number' },
 { field: "VAIVDO", name: "Valor IVA doc.", visible: false, datatype: 'number' },
 { field: "VANEDO", name: "Valor neto doc.", visible: false, datatype: 'number' },
 { field: "BLOQUEAPAG", name: "Bloquea pago", visible: false }
]

// Instancia tabla (para reload)
$scope.apiDeuda = {}

// Opciones de tabla
$scope.optDeuda = {
    showEmpty:'<h2>¡Todo pagado!</h2><p>no tiene deuda</p>', 
    title:'Documentos pendientes'
}

// Función (promesa en este caso) que pide datos
$scope.traeDeuda = function(query){
    return documentos.traeDeuda.get({ 
        fields: $scope.metaDeuda.map(m => m.field), 
        koen: $scope.pasoEntidad.map(e => e.KOEN), 
        empresa: rndEmpresa.get(), 
        size: 10, 
        order: 'FEULVEDO' 
    });
</script>

<rnd-datatable meta="metaDeuda"
   options="optDeuda"
   source="traeDeuda"
   rtablas="rtablas"
   instance="apiDeuda">
</rnd-datatable>
</pre>
**/
angular.module('core')
    .directive("rndDatatable", function () {
        return {
            restrict: 'E',
            scope: {
                options: "=",
                source: "=",
                meta: "=",
                rtablas: "=?rtablas",
                instance: '=?instance'
            },
            templateUrl: 'modules/core/directives/rndDatatable.html',
            controller: 'rndDatatable'
        }
    })
    .controller("rndDatatable", ['$scope', 'rndDialog', 'rndDatatableFactory', function ($scope, rndDialog, rndDatatableFactory) {

        // Convertir en funcióon que entrega array
        if (angular.isArray($scope.source)) {
            // Si es array: entrega función que entrega promesa que retorna el mismo array
            $scope.sourceP = function () {
                return new Promise((r) => r($scope.source))
            }
        } else {
            // Si es función: entrega función que entrega la promesa (del ws) 
            $scope.sourceP = function () {
                $scope.busy = true;
                $scope.error = false;

                return $scope.source()
                    .$promise
                    .then(function (res) {
                        $scope.busy = false;
                        return res
                    })
                    .catch(function (err) {
                        $scope.busy = false;
                        $scope.error = true;
                        return err
                    })
            };
        }

        // Inicializar tabla
        $scope.tabla = new rndDatatableFactory({
            source: $scope.sourceP,
            meta: $scope.meta,
            rtablas: $scope.rtablas,
            ws: $scope.options.ws // ToDO: Implementación paginación por servidor
        }, $scope);

        // Conectar botón reload
        $scope.reload = $scope.tabla.reload; // interna de la directiva
        if ($scope.instance) $scope.instance.reload = $scope.tabla.reload; // retornar al controller parent

        // Observar la fuente si es un array para actualizar cambios
        if (angular.isArray($scope.source)) {
            $scope.$watch('source', $scope.reload, true)
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

    .factory('rndDatatableFactory', function (DTOptionsBuilder, DTColumnBuilder, $compile, getDatatype, $filter) {

        return initTable;

        function initTable(params, scope) {
            var ret = {};
            ret.options = initOptions(params, scope);
            ret.columns = initColumns(params, scope);
            ret.instance = null;
            ret.reload = instanceReload(ret, params);
            return ret;
        }

        // Inicializa tabla
        function initOptions(params, scope) {
            var options = params.options || {}
            var ret;

            // distinguir por el tipo de función source.
            if (params.ws) {
                ret = DTOptionsBuilder.newOptions()
                    .withOption('ajax', adaptResource(params))
                    .withOption('serverSide', true)
            } else {
                ret = DTOptionsBuilder.fromFnPromise(params.source);
            }

            ret = ret.withDataProp('data')
                .withOption('responsive', { details: { renderer: rendererResponsive(scope) } })
                .withOption('info', options.info) // mostrar "Mostrando registros xx al yy".
                .withOption('processing', true)
                .withOption('select',true)
                .withOption('bFilter', options.search) // campo búsqueda
                .withOption('bPaginate', options.pagination) // mostrar paginación abajo
                .withPaginationType('numbers')
                .withOption('lengthMenu', [[5, 10, 20, 9999], [5, 10, 20, 'todos']])
                .withDisplayLength(5)
                .withBootstrap()
                .withOption('bAutoWidth', false)
                .withOption('rowCallback', rowCallback(params, scope))
                .withOption('aaSorting', [2, 'asc'])// ordenar por APPP
                .withLanguage(optionsGetLanguage().es)
                .withOption('createdRow', function (row) {
                    $compile(angular.element(row).contents())(scope);
                })
                .withOption('initComplete', function () {
                    // Do your stuff here, you could even fire your own event here with $rootScope.$broadcast('tableInitComplete');
                    console.log("initComplete");
                });
            return ret;
        }

        /** Inicializar las columnas */
        function initColumns(params, scope) {
            var cols = []

            // Loop sobre los metadatos
            params.meta.forEach(function (m) {

                // Inicializar objeto a retornar: col
                var col = DTColumnBuilder.newColumn(m.field);

                // Título se usa una función de render
                col = col.withTitle(headerRenderer(m));

                // Calcular align derecha o izquierda
                var align = $filter('alignment')(m.datatype);
                if (align) col = col.withClass('dt-body-' + align);

                // opción visible
                if (!m.visible) col = col.notVisible();

                // Render tipo columna
                if (m.field == "$estado") {
                    col = col.notSortable();
                    col = col.withOption('width', 15);
                    col = col.renderWith(dialogRenderer(params, scope));
                } else { // todo el resto de tipos
                    col = col.renderWith(renderer(m, params, scope));
                }

                // Entregar resultado
                cols.push(col)
            });

            // Loop sobre botones (incorporados en options.buttons)
            ((params.buttons) || []).forEach(function (b) {
                var col = DTColumnBuilder.newColumn(null);
                col = col.withTitle(b.name); // opción title
                col = col.notSortable();
                col = col.withOption('width', 10);
                col = col.renderWith(buttonRenderer(b, params, scope));
                cols.push(col)
            })

            return cols;
        }

        function instanceReload(table, params) {
            return function () {
                if (table.instance) {
                    if (params.ws) {
                        table.instance.reloadData();
                    } else {
                        table.instance.changeData(params.source);
                    }
                } else {
                    console.log("no hay instancia dataTable, ignorado")
                }
            }
        }

        function buttonRenderer(button, params, scope) {

            return function (linea, type, row, meta) {
                // Anexar temporalmente dataset y línea a scope, para que compile resulte bien
                scope._dataset = params.ws.res.data
                scope[row.$estado.$id] = row;
                return `
                <a  uib-tooltip="${button.tooltip}"
                ng-click="${button.onClick}(${row.$estado.$id},_dataset)"  
                class="btn b-a b-solid btn-xs btn-ef btn-ef-1 btn-ef-1-default btn-ef-1a btn-rounded-20 mr-5">
                <i class="fa ${button.icon}"></i>
                </a>`
            }
        }

        function dialogRenderer(params, scope) {
            // Anexar temporalmente dataset y línea a scope, para que compile resulte bien
            //scope._dataset = params.ws.res.data

            return function (dato, type, row) {
                // raro que entrega estado en vez de linea
                scope[row.$estado.$id] = row;
                //console.log("DATA", estado, type, row)
                return `<span rnd-dialog linea="${row.$estado.$id}"></span>`
            }
        }

        function renderer(datatype, params, scope) {
            var rtablas = params.rtablas;
            return function (data, type, row) {
                if (!params.ws) return $filter('monitor')(data, datatype, rtablas);
                scope._res = params.ws.res
                scope[row.$estado.$id] = row;
                var ret = `<rnd-input
                 source="_res"
                 line="${row.$estado.$id}"
                 key="'${datatype.field}'"
                 index-by="UIDXCONTRAT"
                 meta="meta"
                 rtablas="ws.getRtablas"
                 ></rnd-input>`
                //var ret =  $filter('monitor')(data, datatype, rtablas);
                return ret;
            }
        }

        /** Obtiene arreglo de columnas de sorting en la query */
        function getQueryOrder(query) {
            var ret = []
            query.order.forEach(function (c) {
                var order = (c.dir == 'desc') ? '-' : '';
                // incluir sólo columnas ordenables
                if (query.columns[c.column].orderable) {
                    ret.push(order + query.columns[c.column].data);
                }
            })
            return ret;
        }

        /** Función que adapta parámetros de entrada propios de datatable (paginación, order) al formato WS*/
        function adaptResource(Params) {
            return function (query, callback, settings) {
                // convertir query en params
                var params = {
                    order: getQueryOrder(query),
                    start: query.start,
                    size: query.length,
                    type: 'datatable'
                }
                if (query.search.value) params.search = query.search.value;
                // Hacer merge si es que hay función getParams

                // Llamar a WS
                Params.source(params, callback, settings);
            }
        }

        function headerRenderer(meta) {
            // obtener título desde meta.name
            var innerHtml = meta.name;
            var cssClass = [];
            var tooltip = [];

            // Agregar descripción si viene
            if (meta.description) tooltip.push(meta.description);

            // Si es requerido agregar asterisco
            if (meta.required) {
                cssClass.push('fieldRequired');
                tooltip.push('(* Requerido)')
            }
            // Si es llave primaria agregar llave
            if (meta.pk) {
                cssClass.push('fieldPrimaryKey');
                innerHtml = '<i class="fa fa-key mr-10"></i>' + innerHtml;
                tooltip.push('(Llave primaria)')
            }

            return `<div title="${tooltip.join(' ')}"  class="${cssClass.join(' ')}">${innerHtml}</div>`;
        }

        function rowCallback(params, scope) {
            return function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                // Unbind first in order to avoid any duplicate handler (see https://github.com/l-lin/angular-datatables/issues/87)
                $('td', nRow).unbind('click');
                $('td', nRow).bind('click', function (event) {
                    //console.log(event)
                    console.log("hay params", params, scope)
                    scope.$apply(function () {
                        //console.log("aData", aData, params.ws.res.data);
                    });
                    var selected = scope.tabla.instance.DataTable.rows('.selected');
                    if (selected) selected.deselect();
                    $(nRow).toggleClass('selected');
                });

                return nRow;
            }
        }

        function rendererResponsive(scope) {
            return function (api, rowIdx, columns) {
                var data = $.map(columns, function (col, i) {
                    return col.hidden ?
                        '<li data-dtr-index="' + col.columnIndex + '" data-dt-row="' + col.rowIndex + '" data-dt-column="' + col.columnIndex + '">' +
                        '<span class="dtr-title">' +
                        col.title +
                        '</span> ' +
                        '<span class="dtr-data">' +
                        col.data +
                        '</span>' +
                        '</li>' :
                        '';
                }).join('');
                return data ?
                    $compile(angular.element($('<ul data-dtr-index="' + rowIdx + '"/>').append(data)))(scope) :
                    false;
            }
        }

        /** Traducciones de dataTables */
        function optionsGetLanguage() {
            return {
                es: {
                    "sProcessing": "...",
                    "sLengthMenu": "Mostrar _MENU_ registros",
                    "sZeroRecords": "No se encontraron resultados",
                    "sEmptyTable": "(tabla vacía)",
                    //"sInfo": "Mostrando registros _START_ al _END_ de _TOTAL_",
                    "sInfo": "Mostrando registros _START_ al _END_ de _TOTAL_ /  _MAX_",
                    "sInfoEmpty": "No hay registros que mostrar",
                    //"sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
                    "sInfoFiltered": "(filtro activo)",
                    "sInfoPostFix": "",
                    "sSearch": "Buscar:",
                    "sUrl": "",
                    "sInfoThousands": ",",
                    "sLoadingRecords": "Cargando...",
                    "oPaginate": {
                        "sFirst": "Primero",
                        "sLast": "Último",
                        "sNext": "Siguiente",
                        "sPrevious": "Anterior"
                    },
                    "oAria": {
                        "sSortAscending": ": Orden ascendente",
                        "sSortDescending": ": Orden descendente"
                    }
                }
            }
        }

    })

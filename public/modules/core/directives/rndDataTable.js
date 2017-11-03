'use strict';

angular.module('core')
    .directive("rndDatatable", function () {
        return {
            restrict: 'E',
            scope: {
                options: "=",
                dataset: "=",
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
            dataset: $scope.dataset,
            ws: $scope.options.ws
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

        // Botones por defecto
        $scope.buttons = [];
        var defaultButtons = [
            { name: 'create', onClick: 'createLine', icon: 'fa fa-plus', description: 'crear nuevo registro' }
        ]
        $scope.options.buttons = $scope.options.buttons || [];
        $scope.options.buttons.forEach(function (b) {
            var ix = defaultButtons.findIndex(i => i.name == b);
            if (ix >= 0) $scope.buttons.push(defaultButtons[ix]);
        })


        $scope.createLine = function () {
            var tmp = { data: [] }
            rndDialog.createLine(tmp, $scope.meta);
            $scope.tabla.instance.DataTable.row.add(tmp.data[0]);
            $scope.tabla.instance.DataTable.draw();
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

        /** Crea opciones
         * @params 
         */
        function initOptions(params, scope) {
            var options = params.options || {}
            var ret;

            // distinguir por el tipo de función source.
            if (params.ws) {
                ret = DTOptionsBuilder.newOptions()
                    .withOption('ajax', adaptResource(params))
                    .withOption('serverSide', true)
            } else {
                // Convertir a promesa si ya no lo es
                //var p = (angular.isArray(params.source)) ? new Promise((r) => r(params.source)) : params.source;
                ret = DTOptionsBuilder.fromFnPromise(params.source);
            }

            ret = ret.withDataProp('data')
                .withOption('responsive', { details: { renderer: rendererResponsive(scope) } })
                .withOption('info', options.info) // mostrar "Mostrando registros xx al yy". por defecto true
                .withOption('processing', true)
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

        /** entrega objeto columns.
         * @params : 
         */
        function initColumns(params, scope) {
            var cols = []
            var rtablasfn;
            params.meta.forEach(function (m) {
                var col = DTColumnBuilder.newColumn(m.field);
                col = col.withTitle(m.name); // opción title
                var align = $filter('alignment')(m.datatype);
                col = col.withClass('dt-body-' + align);
                col = m.visible ? col : col.notVisible(); // opción visible
                if (m.field == "$estado") {
                    col = col.notSortable();
                    col = col.withOption('width', 15);
                    col = col.renderWith(dialogRenderer(params, scope));
                } else {
                    col = col.renderWith(renderer(m, params, scope)); // opción renderer
                }
                cols.push(col)
            });
            ((params.buttons) || []).forEach(function (b) {
                var col = DTColumnBuilder.newColumn(null);
                col = col.withTitle(b.name); // opción title
                col = col.notSortable();
                col = col.withOption('width', 10);
                col = col.renderWith(buttonRenderer(b, params, scope)); // opción renderer
                //col = m.visible ? col : col.notVisible(); // opción visible
                //col = col.renderWith(renderer(m, params.rtablas)); // opción renderer
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
                 data="_res"
                 line="${row.$estado.$id}"
                 key="'${datatype.field}'"
                 index-by="UIDXCONTRAT"
                 columns="meta"
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

        function rowCallback(params, scope) {
            return function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                // Unbind first in order to avoid any duplicate handler (see https://github.com/l-lin/angular-datatables/issues/87)
                $('td', nRow).unbind('click');
                $('td', nRow).bind('click', function (event) {
                    //console.log(event)
                    scope.$apply(function () {
                        //console.log("aData", aData, params.ws.res.data);
                    });
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

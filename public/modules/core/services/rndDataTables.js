'use strict';

angular.module('core')

    .factory('rndDataTables', function (DTOptionsBuilder, DTColumnBuilder, $compile, getDatatype, $filter) {

        return initTable;

        function initTable(params) {
            var ret = {};
            ret.options = initOptions(params);
            ret.columns = initColumns(params);
            ret.instance = null;
            ret.reload = instanceReload (ret); 
            return ret;
        }

        function instanceReload(table){
            return function(){
                if (table.instance) {
                    console.log("llamando a interfaz de reload de dataTable");
                    table.instance.reloadData();
                }else{
                    console.log("no hay instancia dataTable, ignorado")
                }
            }
        }

        function initColumns(params) {
            var cols = []
            params.model.forEach(function (m) {
                var col = DTColumnBuilder.newColumn(m.field);
                col = col.withTitle(m.name); // opción title
                col = m.visible ? col : col.notVisible(); // opción visible
                col = col.renderWith(renderer(m, params.rtablas)); // opción renderer
                cols.push(col)
            })
            return cols;
        }

        function renderer(datatype, rtablas) {
            return function (data, type, row) {
                { return $filter('monitor')(data, datatype, rtablas) }
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
                // Llamar a WS
                Params.resource(params,callback,settings);
            }
        }


        function initOptions(params) {
            var options = params.options||{}
            var ret =
                DTOptionsBuilder.newOptions()
                    .withOption('ajax', adaptResource(params))
                    .withDataProp('data')
                    .withOption('info', options.info==undefined?true:options.info) // mostrar "Mostrando registros xx al yy". por defecto true
                    .withOption('processing', true)
                    .withOption('serverSide', true)
                    .withOption('bFilter', options.search) // campo búsqueda
                    .withOption('bPaginate', options.pagination==undefined?true:options.pagination) // mostrar paginación abajo
                    .withPaginationType('numbers')
                    .withOption('lengthMenu', [[5,10,20,9999], [5,10,20,'todos']])
                    .withDisplayLength(5)
                    .withBootstrap()
                    .withOption('aaSorting', [2, 'asc'])// ordenar por APPP
                    .withOption('responsive', true)
                    .withLanguage(optionsGetLanguage().es)
                    .withOption('createdRow', function (row) {$compile(angular.element(row).contents())(params.$scope); });                 
            return ret;
        }

        /** Traducciones de dataTables */
        function optionsGetLanguage() {
            return {
                es: {
                    "sProcessing": "...",
                    "sLengthMenu": "Mostrar _MENU_ registros",
                    "sZeroRecords": "No se encontraron resultados",
                    "sEmptyTable": "(tabla vacía)",
                    "sInfo": "Mostrando registros _START_ al _END_ de _TOTAL_",
                    "sInfoEmpty": "No hay registros que mostrar",
                    "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
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

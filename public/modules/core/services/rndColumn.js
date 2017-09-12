'use strict';
angular.module('core')
    .factory('rndColumn', ['$timeout', 'rndDialog', 'displayRtabla', 'hotRegisterer', 'parseNumber', 'getDatatype', '$filter', 'preProcess', 'encodeRtabla', 'decodeRtabla',
        function ($timeout, rndDialog, displayRtabla, hotRegisterer, parseNumber, getDatatype, $filter, preProcess, encodeRtabla, decodeRtabla) {

            // Globales
            var $dialog = rndDialog;

            // Variable a retornar
            var ret = {
                getColumns: getColumns,
                getSettings: getSettings
            }

            /** Dado un array model, entregar un array de columnas */
            function getColumns(model, rtablas, Data) {
                // var model = [{ field: '$estado', visible: true, name: '$D', datatype: '$estado', readOnly: true }]
                var result = model.filter(m => (m.visible)).map(m => parseModelAsColumn(m.field, m, rtablas, Data));// Desacoplar
                return result;
            }

            // Detalles de implementación
            function getSettings(Data, InstanceName, Columns, Scope) {

                // Closure: InstanceName, Scope, redraw
                var redraw = function () {
                    console.log("redrawing")
                    var hot = hotRegisterer.getInstance(InstanceName);
                    hotRegisterer.getInstance(InstanceName).render();
                    Scope.$apply();
                }

                // Closure: InstanceName, redraw
                var discardRow = function (dato, row_start, row_end) {
                    var hot = hotRegisterer.getInstance(InstanceName);
                    hot.alter('remove_row', row_start, row_start - row_end + 1);
                    redraw();
                }

                // Closure: InstanceName, redraw
                var deleteRow = function (dato, row_start, row_end) {
                    // Marcar el dato como modificado
                    for (var i = row_start; i < row_end + 1; i++) {
                        dato.data[i].$estado = dato.data[i].$estado || {}
                        dato.data[i].$estado.$action = 'D';
                    }
                    redraw();
                }

                var settings = {
                    manualColumnMove: false,
                    manualColumnResize: true,
                    renderAllRows: false, // para que funcione Excel
                    //afterRender:validateAll,
                    height: 420,
                    rowHeaders: false,
                    contextMenu: {
                        // Closure: Data
                        callback: function (key, options) {
                            if (key == 'discardLine') {
                                discardRow(Data, options.start.row, options.end.row);
                            } else if (key == 'deleteLine') {
                                deleteRow(Data, options.start.row, options.end.row);
                            }
                            return false;
                        },
                        items: {
                            "discardLine": { name: 'descarta línea' },
                            "deleteLine": { name: 'borrar registro' }
                        }
                    },
                    afterCreateRow: function (index, numberOfRows) {
                        if (index) {
                            Data.data.splice(index, numberOfRows); // elimina la nueva línea para evitar que se creen más
                        } else {
                            console.log("new line", index, numberOfRows);
                        }
                    },
                    afterChange: function (changes, source) {
                        var msg = '';
                        if (changes) msg = "[" + changes[0][0] + "]" + changes[0][1] + ": " + changes[0][2] + "->" + changes[0][3];
                        console.log("rndColumn.afterChange", source, msg);

                        var hot = this; // hot table instance
                        // changes = [ix,field,oldVal,newVal]

                        // Recorrer cambios y aplicar onChange hook
                        if (changes) {
                            for (var i = changes.length - 1; i >= 0; i--) {
                                var meta = Columns.find(m => m.field == changes[i][1]);
                                // Aplicar onChange
                                if (changes[i][2] != changes[i][3]) {
                                    $dialog.onChange(Data, changes[i][0], meta, changes[i][2], true);
                                    $dialog.setCellDirty(Data, changes[i][0], meta);
                                    $dialog.setLineModified(Data.data[changes[i][0]]);
                                }
                                // Aplicar validacion (Data, Columns, i, meta){
                                console.log("change validation");
                                $dialog.validateCell(Data, changes[i][0], meta)
                            }
                        } else {
                            // Si no vienen cambios validar toda la tabla
                            console.log("full validation");
                            $dialog.validateAll(Data, Columns);
                        }
                        // Aplicando redraw si no no aplica bien coloración de validaciones
                        $timeout(redraw);
                    }
                }
                return settings;
            }

            /** llena col con parámetros de columna encontrados en model */
            function parseModelAsColumn(colName, model, rtablas, Data) {
                var col = {};
                angular.copy(model || {}, col); // copia propiedades a col;

                col.title = col.name; // col.title propietario de Handsontable
                col.data = col.field; // col.data propietario de Handsontable

                if (col.datatype) { // agregar datos dependientes de tipo de dato
                    var datatype = getDatatype(col).datatype;  // type = {datatype:'date|number|currency|...(i.e. Angular)', variant:'m|CLP|... (i.e RandomOwn)'}

                    // Date
                    if (datatype == 'date') {
                        col.type = datatype;
                        col.renderer = customRenderer(col, rtablas, Data);
                        col.hotChange = function (Data, i, meta, oldval) {
                            var value = Data.data[i][meta.field];
                            var tmp = preProcess(value, col.datatype);
                            Data.data[i][meta.field] = tmp.value
                        }
                        col.hotValidator = function (Data, i, meta, oldval) {
                            var value = Data.data[i][meta.field];
                            var ret = preProcess(value, col.datatype).valid;
                            return ret;
                        }
                        col.dateFormat = 'YYYY-MM-DD'
                        col.datePickerConfig = {
                            firstDay: 1, //Monday
                            showWeekNumber: true,
                            i18n: {
                                previousMonth: 'Mes anterior',
                                nextMonth: 'Mes siguiente',
                                months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Augosto', 'Septiembre', 'Octubrer', 'Noviembre', 'Diciembre'],
                                weekdays: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado'],
                                weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sáb']
                            }
                            // PAD: ToDo: Inhabilitar días del mes dependiendo de model
                            //disableDayFn: function(date){ return date.getDay()===0||date.getDay()===6;}
                        }
                        // rtabla
                    } else if (col.tabla) {
                        col.type = 'dropdown';
                        // Obtener lista de valores desde model.options;
                        col.source = displayRtabla(rtablas[col.tabla], col.options);
                        col.renderer = customRenderer(col, rtablas, Data);
                        col.hotChange = function (Data, i, meta, oldval) {
                            var value = Data.data[i][meta.field];
                            var parse = encodeRtabla(value, rtablas[col.tabla], col.options);
                            Data.data[i][meta.field] = parse.value;
                            var ret = parse.valid;
                            return ret;
                        }
                        col.hotValidator = function (Data, i, meta, oldval) {
                            var value = Data.data[i][meta.field];
                            var validSrv = decodeRtabla(value, rtablas[col.tabla], col.options).valid;
                            var validCli = encodeRtabla(value, rtablas[col.tabla], col.options).valid;
                            var ret = validSrv || validCli;
                            return ret;
                        }
                        // checkbox
                    } else if (datatype == 'checkbox') {
                        col.type = 'checkbox'
                        // number
                    } else if (datatype.match(/number|currency/)) {
                        col.hotChange = function (Data, i, meta, oldval) {
                            var val = Data.data[i][meta.field];
                            var parse = parseNumber(val);
                            Data.data[i][meta.field] = parse.value;
                            var ret = parse.valid;
                            return ret;
                        };
                        col.hotValidator = function (Data, i, meta, oldval) {
                            var val = Data.data[i][meta.field];
                            var parse = parseNumber(val);
                            var valid = parse.valid;
                            return valid;
                        }
                        col.renderer = customRenderer(col, rtablas, Data);

                    } else if (datatype.match(/^dialog/)) { // dialog ($estado, columna diálogo)
                        col.renderer = customRenderer(col, rtablas, Data);
                    } else if (datatype == 'autocomplete') {  // autocomplete (sirve para hacer AJAX)
                        col.type = 'autocomplete';
                        col.renderer = customRenderer(col, rtablas, Data);
                        col.hotChange = function (Data, i, meta, oldval) {
                            console.log("rndColumn.hotChange");
                            // Sacar la flecha si viene
                            var val = Data.data[i][meta.field];
                            if (typeof (val == 'string')) {
                                Data.data[i][meta.field] = val.split('➙')[0].trim();
                            }
                        }
                    } else {
                        console.log(`parseModelAsColumn: Tipo de dato desconocido ${datatype} en columna ${col.data}`);
                        col.renderer = customRenderer(col, rtablas, Data);
                    }
                } else {
                    col.renderer = customRenderer(col, rtablas, Data); // no tiene datatype
                }
                return col;

            }

            /** Provee renderers custom para Handsontable */
            function customRenderer(meta, rtablas, Data) {
                var type = getDatatype(meta);

                return function (instance, td, row, col, prop, value, cellProperties) {
                    value = $filter('monitor')(value, meta, rtablas);

                    if (type.datatype == 'date') {
                        Handsontable.DateCell.renderer.apply(td, arguments);
                        td.innerHTML = value + '<div class="htAutocompleteArrow">&nbsp;&nbsp;▼</div>'
                    } else if (type.datatype == "rtabla") {
                        Handsontable.renderers.TextRenderer.apply(this, arguments);
                        td.innerHTML = value + '<div class="htAutocompleteArrow">&nbsp;&nbsp;▼</div>'
                    } else if (type.datatype.match(/number|currency/)) {
                        Handsontable.renderers.NumericRenderer.apply(this, arguments);
                        td.style.textAlign = 'right'
                        td.innerHTML = value;
                    } else if (type.datatype == "dialog") {
                        Handsontable.renderers.TextRenderer.apply(this, arguments);
                        td.style.textAlign = 'center';
                        td.className = 'htDimmed'
                        if (value) {
                            td.className = renderDialogStateClass(value.$action)
                            td.innerHTML = '<i title="' + renderDialogStateText(value.$action, value.$message) + '" class="fa ' + renderDialogStateIcon(value.$action) + '"></i>';
                        }
                    } else if (type.datatype == 'uuid') {
                        Handsontable.renderers.TextRenderer.apply(this, arguments);
                        //td.hidden = true
                    } else if (type.datatype == 'autocomplete') {
                        Handsontable.AutocompleteCell.renderer.apply(td, arguments);
                    } else {
                        Handsontable.renderers.TextRenderer.apply(this, arguments);
                        td.innerHTML = value;
                    }

                    // Aplicar Reglas

                    if (Data.data[row].$estado) {
                        if (Data.data[row].$estado[meta.field]) {
                            if (Data.data[row].$estado[meta.field].$dirty) td.style.border = '1px solid #b2e600'; // $dirty con borde verde
                            if (Data.data[row].$estado[meta.field].$invalid) {
                                td.className = 'htInvalid'; // fondo rojo
                            } else {
                                if (meta.readOnly) {
                                    td.className = 'htDimmed'; // sacar fondo rojo
                                } else {
                                    td.className = ''; // sacar fondo rojo
                                }
                            }
                        }
                        if (Data.data[row].$estado.$hidden) {
                            td.className = 'htHidden'
                        }
                    }

                    // Si es primaryKey texto bold y readOnly salvo que sea nuevo
                    if (meta.pk) {
                        td.style.fontWeight = 'bolder';
                        // Si el registro es nuevo, liberar columna pk para escritura"
                        var estado = Data.data[row].$estado; //instance.getDataAtCell(row, 0); // Ojo, 0 requiere $estado es primera columna en modelo
                        if (estado) {
                            // Llave pk es editable si la línea es nueva
                            if (estado.$action == 'N') {
                                cellProperties.readOnly = false;
                            }
                        }
                    }
                }
            }

            /**
             * dirty: borde verde
             * invalid: fondo rojo 
             * readOnly: fondo azul, 
             * primary key: bold
             */
            function renderCellStyle(td, Data, row, meta) {
                var eLine = Data.data[row].$estado||{};
                var eCell = eLine[meta.field]||{};


            }

            function renderDialogStateIcon(action) {
                var ret;
                switch (action) {
                    case 'M': ret = 'fa-pencil-square'; break;
                    case 'N': ret = 'fa-plus-circle'; break;
                    case 'D': ret = 'fa-times-circle'; break;
                    case 'E': ret = 'fa-exclamation-circle'; break;
                }
                return ret;
            }
            function renderDialogStateClass(action) {
                var ret;
                switch (action) {
                    case 'E': ret = 'text-danger'; break;
                    default: ret = 'text-success'; break;
                }
                return ret;
            }
            function renderDialogStateText(action, message) {
                var ret;
                switch (action) {
                    case 'M': ret = 'registro modificado'; break;
                    case 'N': ret = 'registro nuevo'; break;
                    case 'D': ret = 'marcado para eliminación'; break;
                }
                return ret || message;
            }

            return ret;
        }])
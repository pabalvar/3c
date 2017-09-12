'use strict';

/** Convierte drop table en JSON **/
angular.module('core')
    .factory('rndDropTable', ['parseNumber', 'rndColors', 'getDatatype', '$moment', '$filter', 'preProcess', 'toastr', 'encodeRtabla', 'decodeRtabla',
        function (parseNumber, rndColors, getDatatype, $moment, $filter, preProcess, toastr, encodeRtabla, decodeRtabla) {
            /** convierte tabla en JSON**/
            var m = {};

            /** Constructor del objeto rndTable */
            var rndTable = function () {
                return {
                    data: [],
                    visible: [],
                    columns: [],
                    columnsSrc: [],
                    fields: [], // input
                    settings: { // Default options
                        //beforeChange:function(changes,source){console.log("ESTO",changes,source);}
                    }
                }
            }

            var customRenderer = function (model, rtablas) {
                return function (instance, td, row, col, prop, value, cellProperties) {
                    value = $filter('monitor')(value, model, rtablas);
                    var type = getDatatype(model);
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
                    } else if (type.datatype.match(/estado/)) {
                        Handsontable.renderers.NumericRenderer.apply(this, arguments);
                        td.style.textAlign = 'center'
                        td.innerHTML = value;
                    } else {
                        Handsontable.renderers.TextRenderer.apply(this, arguments);
                        td.innerHTML = value;
                    }

                    // Aplicar Reglas
                    if (model.pk) td.style.fontWeight = 'bolder';
                    if (!model.found) { // muted renderer
                        td.style.color = rndColors.colorIndex('default', 80);
                        td.style.fontWeight = 'lighter';
                    }
                }
            }


            /** Entrega modelo que coincide con nombre de columna */
            var getMatch = function (colName, model) {

                var ret;
                model.some(function (m) {
                    var rules = [
                        new RegExp("^" + m.field + "$", "i"), // Caso: VALPRIN,etc
                        new RegExp("^" + m.name + "$", "i")
                    ];
                    if (rules.filter(r => colName.match(r)).length) {
                        ret = m;
                        return ret;// i.e. break
                    }
                })
                return ret;
            }
            /** Crear T.columns = [{title:,data:...}] aplicando formato encontrado en model 
               columns=[{      title:"Fecha inicio", // nombre visible de la columna
                                data:"FECHAINI", // campo JSON contiene el dato, eg. items.FECHAINI
                                required:true, // requerido
                                readOnly:true|false // no editable
                                exportable: true|false // aparece en Excel (aunque no sea visible)
                                width: number
                                pk: true|false // si es primary fixKeys
                                description: text // aparece en tooltips
                                type:numeric|date|time|checkbox|select|dropdown|autocomplete|password|handsontable
                           },...];
           */

            /* llena col con parámetros de columna encontrados en model */
            var parseModelAsColumn = function (colName, model, rtablas) {
                var col = {};
                angular.copy(model || {}, col); // copia propiedades a col;

                col.name = col.name || col.field || colName; // name es como título pero sin html 
                col.data = col.data || col.field || colName; // asegurarse de que el nombre del campo corresponda
                col.found = model ? true : false;
                col.srcField = colName;

                if (col.datatype) { // agregar datos dependientes de tipo de dato
                    var datatype = getDatatype(col).datatype;  // type = {datatype:'date|number|currency|...(i.e. Angular)', variant:'m|CLP|... (i.e RandomOwn)'}

                    // Date
                    if (datatype == 'date') {
                        col.type = datatype;
                        col.renderer = customRenderer(col, rtablas);
                        col.onValueChange = function (change) {
                            var tmp = preProcess(change[3], col.datatype);
                            change[3] = tmp.value
                            var ret = tmp.valid;
                            return ret;
                        }
                        col.validator = function (value, callback) {
                            var ret = preProcess(value, col.datatype).valid;
                            callback(ret);
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
                    } else if (col.tabla) {
                        col.type = 'dropdown';
                        // Obtener lista de valores desde model.options;
                        col.source = rtablas[col.tabla].data.map(o => o[col.options.returnClient])
                        col.renderer = customRenderer(col, rtablas);
                        col.onValueChange = function (change) {
                            // changes = [0,field,oldVal,newVal]
                            var parse = encodeRtabla(change[3], rtablas[col.tabla], col.options);
                            change[3] = parse.value;
                            var ret = parse.valid;
                            return ret;
                        }
                        col.strict = false;
                        col.validator = function (value, callback) {
                            // truco porque la primera vez viene con valor Srv, pero debido a que 
                            // el dropdown usa valores Cli, al cambiar valor viene el valor Cli
                            var validSrv = decodeRtabla(value, rtablas[col.tabla], col.options).valid;
                            var validCli = encodeRtabla(value, rtablas[col.tabla], col.options).valid;
                            callback(validSrv || validCli);
                        }
                    } else if (datatype == 'checkbox') {
                        col.type = 'checkbox'
                    } else if (datatype.match(/number|currency/)) {
                        col.onValueChange = function (change) {
                            // changes = [0,field,oldVal,newVal]
                            var parse = parseNumber(change[3]);
                            change[3] = parse.value;
                            var ret = parse.valid;
                            return ret;
                        },
                            col.validator = function (value, callback) {
                                var parse = parseNumber(value);
                                var valid = parse.valid;
                                callback(valid);
                            }
                        col.renderer = customRenderer(col, rtablas);
                        ///col.type = 'numeric'
                    } else {
                        console.log(`Tipo de dato desconocido ${datatype} en columna ${col.data}`);
                        col.renderer = customRenderer(col, rtablas);
                    }
                } else {
                    col.renderer = customRenderer(col, rtablas); // no tiene datatype
                }
                return col;

            }
            var colHeadTitle = function (col) {
                // obtener título desde col.name
                var innerHtml = col.name;
                var cssClass = [];
                var tooltip = [];

                // Agregar descripción si viene
                if (col.description) tooltip.push(col.description);

                // Si es requerido agregar asterisco
                if (col.required) {
                    cssClass.push('fieldRequired');
                    tooltip.push('(* Requerido)')
                }
                // Si es llave primaria agregar llave
                if (col.pk) {
                    cssClass.push('fieldPrimaryKey');
                    innerHtml = '<i class="fa fa-key mr-10"></i>' + innerHtml;
                    tooltip.push('(Llave primaria)')
                }
                // Si es campo desconocido agregar exclamación
                if (!col.found) {
                    cssClass.push('fieldUnknown');
                    innerHtml = '<i class="fa fa-chain-broken mr-10"></i>' + innerHtml;
                    tooltip.push('(Campo desconocido)')
                }
                return `<div title="${tooltip.join(' ')}"  class="${cssClass.join(' ')}">${innerHtml}</div>`;
            }

            var fillColumns = function (T, model, rtablas) {
                // Para cada columna buscar coincidencia en campos entregados (fields) y aplicar características
                T.fields.forEach(function (f) {
                    var matchedColumn = getMatch(f, model);
                    if (!matchedColumn) return;
                    var col = parseModelAsColumn(f, matchedColumn, rtablas);
                    col.title = colHeadTitle(col);
                    if (col.visible) T.columns.push(col);
                    T.columnsSrc.push(col);
                });

                // Si faltan campos requeridos, agregar
                model.forEach(function (m) {
                    var found = false;
                    for (var i = 0; i < T.columnsSrc.length; i++) {
                        if (T.columnsSrc[i].data == m.field) {
                            found = true;
                        }
                    }
                    if (!found && m.required) {
                        console.log("agregando campos:", m);
                        var col = {
                            name: m.name || m.data,
                            data: m.data,
                            required: m.required,
                            readOnly: m.readOnly,
                            width: m.width
                        }
                        if (m.customType) { // agregar datos dependientes de tipo de dato
                            angular.extend(col, customTypes(m));
                            col.customType = m.customType; // por comodidad copio esto acá (se usa en applyFormat)
                        }
                        T.columns.push(col);
                        T.columnsSrc.push(col);
                    }
                });

                return T;
            }


            var applyFormat = function (Tabla, model) {
                Tabla.columns.forEach(function (c) {
                    if (c.customType == 'rut') {
                        Tabla.data.forEach(function (o) {
                            // Sacar leading 0 y puntos
                            o[c.data] = o[c.data].replace(/\./g, '').trim().replace(/^0/, '');
                        });
                    } else if ((c.datatype || '').match(/number|currency/)) {
                        Tabla.data.forEach(function (o) {
                            // Sacar leading 0 y puntos
                            var parse = parseNumber(o[c.data]);
                            if (parse.valid)
                                o[c.data] = parse.value;
                        });
                    } else if ((c.datatype || '').match(/date/)) {
                        Tabla.data.forEach(function (o) {
                            var tmp = preProcess(o[c.data], c.datatype);
                            o[c.data] = tmp.value
                        });
                    }

                });
                return Tabla;
            }
            var fixKeys = function (Tabla, model) {
                // renombra en caso de tablas creadas desde texto, el item de "Nombre concepto":valor --> "KOCO":valor
                Tabla.data = Tabla.data.map(function (o) {
                    var ret = {}
                    Tabla.columns.forEach(function (c) {
                        ret[c.field] = o[c.srcField]
                    })
                    return ret;
                })



                Tabla.data.forEach(function (l) {
                    model.forEach(function (m) {
                        if (typeof l[m.data] == 'undefined') {
                            if (typeof l[m.title] != 'undefined') {
                                l[m.data] = l[m.title];
                                delete l[m.title];
                            }
                        }
                    });
                });
                return Tabla;

            }
            var addIndex = function (Tabla, model) {
                var col = {
                    title: "(idx)",
                    data: 'idx',
                    customType: 'idx'
                }
                Tabla.data.forEach(function (v, k) {
                    v.idx = k;
                });
                return Tabla;
            }
            var stripColumns = function (Tabla, model) {
                var columns = [];
                Tabla.columns.forEach(function (c, i) {
                    if (!c.found) {
                        // Borrar propiedad de los items
                        Tabla.data.forEach(function (o) {
                            delete o[c.data];
                        });
                    } else {
                        // Borrar columna
                        if (!c.hidden)
                            columns.push(Tabla.columns[i]);
                    }
                });
                Tabla.columns = columns;
                return Tabla;
            }

            m.fromObject = function (obj, Model, strip, rtablas) {
                var RndTable = new rndTable(); // inicializar el objeto RndTable 
                var model = Object.values(Model); // Asegurar que el modelo sea array

                RndTable.fields = model.map(o => { return o.field }); // Crear lista de campos desde el modelo
                RndTable.data = obj; // Anexar datos de entrada
                fillColumns(RndTable, model, rtablas);
                if (strip) RndTable = stripColumns(RndTable, model);
                RndTable = applyFormat(RndTable, model);
                return RndTable;
            }

            var text2obj = function (text) {
                // convertir input en output.
                // Regla \t es salto de columna, \n es salto de fila
                var lineas = text.split('\n') || [];
                // Obtener columnas como primera fila
                var columns = lineas[0].split('\t');
                var data = [];
                // Obtener arreglo de datos
                for (var i = 1; i < lineas.length; i++) {
                    var obj = {};
                    var campos = lineas[i].split('\t');
                    for (var j = 0; j < columns.length; j++) {
                        obj[columns[j]] = campos[j];
                    }
                    data.push(obj);
                }
                return { columns: columns, data: data }
            }

            m.fromText = function (text, Model) {

                var RndTable = new rndTable();
                var model = Object.values(Model);

                var tmp = text2obj(text);
                RndTable.fields = tmp.columns;
                RndTable.data = tmp.data;
                RndTable = fillColumns(RndTable, model);
                RndTable = fixKeys(RndTable, model);
                RndTable = addIndex(RndTable, model);
                RndTable = applyFormat(RndTable, model);

                return RndTable;
            }
            m.customRenderer = customRenderer;
            m.merge = function (tabla, addTabla, model) {

                // Obtener columna con fk, o pk para hacer merge
                var PK;
                model.forEach(function (c) {
                    if (c.pk) PK = c.field;
                });
                if (!PK) {
                    console.error("Modelo debe contener una columna llave primaria");
                    toastr.error('Error de software. Modelo debe contener una columna llave primaria', { progressBar: true });
                }

                // Agregar columnas nuevas
                var selectionHasPK;
                addTabla.columns.forEach(function (l) {
                    // Anotar si la selección tiene columna PK
                    if (l.data == PK) {
                        selectionHasPK = true;
                    }
                    var found = false;
                    for (var i = 0; i < tabla.columns.length; i++) {
                        if ((l.data == tabla.columns[i].field) || (l.data == tabla.columns[i].name)) {
                            found = true;
                        }
                    }
                    if (!found) {
                        var tmp = {};
                        angular.extend(tmp, l);
                        tabla.columns.push(l);
                    }
                });

                if (!selectionHasPK) {
                    toastr.warning('La selección debe contener la columna llave: ' + PK, { progressBar: true });
                } else {
                    // Hacer merge donde el valor de PrimaryKey coincida
                    tabla.data.forEach(function (l) {
                        for (var i = 0; i < addTabla.data.length; i++) {
                            if (l[PK] == addTabla.data[i][PK]) {
                                angular.extend(l, addTabla.data[i]);
                                break;
                            }
                        }
                        //console.log(`columna ignorada en merge: ${l[PK]}`);
                    });
                }
                return tabla;
            }

            return m;
        }])


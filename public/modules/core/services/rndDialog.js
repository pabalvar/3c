'use strict';
angular.module("core")
    .service("rndDialog", ['rndORM', function (rndORM) {

        var vm = {
            getLineMatch: getLineMatch,
            getTouched: getTouched,
            getModified: getModified,
            getCreated: getCreated,
            getDeleted: getDeleted,
            getError: getError,
            getData: getData,
            getSumState: getSumState,
            getCellMeta: getCellMeta,

            setErrorMessage: setErrorMessage,
            setFilterString: setFilterString,
            setLinked: setLinked,
            setCellValid: setCellValid,
            setCellDirty: setCellDirty,
            setLineModified: setLineModified,
            setLineOpen: setLineOpen,
            setLineError: setLineError,

            toggleLineOpen: toggleLineOpen,
            toggleLineDelete: toggleLineDelete,

            createLine: createLine,
            initLine: initLine,
            initDataset: initDataset,
            isLineHidden: isLineHidden,
            onChange: onChange,

            validateCell: validateCell,
            validateLine: validateLine,
            validateAll: validateAll,



        };

        function isLineHidden(linea) {
            var $estado = linea.$estado || {};
            return $estado.hidden ? true : false;
        }

        function initDataset(res) {
            res.data.forEach(function (l) {
                initLine(l); // Agrega $estado
            })
        }

        function isLineInvalid(line) {
            var ret = false;
            // Si la línea es modificada, correr validaciones      
            for (var key in line.$estado) {
                if (key[0] != '$') { // omitir los campos que parten con $
                    if (line.$estado[key].$invalid) {
                        ret = true;
                        break; // detenerse en el primer invalid
                    }
                }
            }
            return ret;
        }

        /** retorna true si el objeto coincide con str */
        function getLineMatch(obj, fields, regex) {
            var ret = fields.some(f => (obj[f] || '').match(regex));
            //console.log("getLineMatch:",obj,fields,"-->",ret);
            return ret;
        }

        /** obtener registros modificados, alterados, eliminados */
        function getTouched(data, model) {
            return data.filter(d => ((d.$estado || {}).$action || '').match(/[MNDE]/));
        }
        function getModified(data, model) {
            return getData(data.filter(d => ((d.$estado || {}).$action || '').match(/M/)), model);
        }
        function getCreated(data, model) {
            return getData(data.filter(d => ((d.$estado || {}).$action || '').match(/N/)), model);
        }
        function getDeleted(data, model) {
            return getData(data.filter(d => ((d.$estado || {}).$action || '').match(/D/)), model);
        }
        function getError(data, model) {
            return getData(data.filter(d => ((d.$estado || {}).$action || '').match(/E/)), model);
        }

        /** Función que desacopla modelo de datos y descarta propiedad $estado */
        function getData(data, Model) {
            var model = Model.filter(o => o.field != '$estado'); // sacar el campo $estado

            return data.map(function (d) {
                var ret = {};
                model.forEach(function (m) {
                    ret[m.field] = d[m.field];
                });
                return ret;
            });
        }


        /** Función que debería pertenecer al modelo. Crea una nueva instancia del modelo. Input hace merge */
        function createLine(Data, model, input) {
            var obj = rndORM.createObject(Data, model, input);

            Data.data.unshift(obj); //(line, columns, Data, hot, row) 
            validateLine(Data, model, 0);
            setLineOpen(obj); // Abrir editor de la línea
        }

        /** función que actualiza el estado de un registro dado su UIDXPERSON. Se usa para incorporar retorno de una grabación 
         *  source: {data:[]}
         *  key: string: campo a buscar
         *  hot (optional): instancia handsontable
        */
        function setErrorMessage(source, key, hot) {
            // res = res.data.msgList[];
            return function (res) {
                var ix;
                // lista es res.data.msgList;
                var dropData = res.data.msgList;

                // recorrer res (la respuesta del servidor), encontrar el índice y anotar el mensaje en la línea
                dropData.map(function (d) {
                    ix = source.data.findIndex(s => s[key] == d[key])
                    if (ix >= 0) {
                        var line = source.data[ix];
                        console.log("line", line, source.data)
                        setLineError(line, d.message);
                    }
                });

                if (hot) hot.render();
                return
            }
        }

        /** Administra $estado.$hidden */
        function setFilterString(Data, fields, str, hot) {
            var regex = new RegExp(str, "i");
            Data.data.forEach(function (d) {
                var ret = !getLineMatch(d, fields, regex);
                //console.log("setFilterString: ",d,ret)
                initLine(d);
                d.$estado.$hidden = ret;
            });
            if (hot) hot.render();
            return
        }

        /** Función que revisa si existen lineas $estado[field].$invalid y $estado.$action  */
        function getSumState(Data, Columns) {
            var modified = 0;
            var unmodified = 0;
            var invalid = 0;
            var valid = 0;
            var nuevos = 0;
            var deleted = 0;

            // recorrer datos y llenar si corresponde
            var p = (Data || {}).data || [];
            var pLength = p.length;
            for (var i = 0; i < pLength; i++) {
                // salir si hay de todo
                if (unmodified && (modified + nuevos) && deleted && invalid) break;

                if (!(p[i].$estado || {}).$action) {
                    unmodified++;// si no hay estado, la línea no ha sido modificada.
                } else { // linea es modificada
                    isLineInvalid(p[i]) ? invalid++ : valid++; // ver si es válido

                    // Sumar lo que corresponda
                    switch (p[i].$estado.$action) {
                        case 'M': modified++; break;
                        case 'N': nuevos++; break;
                        case 'D': deleted++; break;
                        default: console.warn("acción desconocida");
                    }
                }// end for
            }

            var ret = {
                canHide: (modified + nuevos + deleted) && unmodified,
                canSave: (modified + nuevos) && !invalid,
                canDelete: deleted
            }
            //console.log(ret);
            return ret
        }

        function validateCell(Data, i, meta) {
            //console.log("rndDialog: validateCell");
            // descartar validación si la columna se llama $estado (o cualquier cosa con $)
            if (meta.field[0] == '$') return true;

            // ejecutar todas las validaciones definidas en el modelo.validations=[fn,fn...]
            var validArr = (meta.validations || []).map(fn => fn(Data, i, meta)) || [];

            // En el caso de hotTable ejecutar la validación interna de la directiva modelo.validator
            if (meta.hotValidator) {
                var x = meta.hotValidator(Data, i, meta);
                validArr.push(x);
            }

            // Si no pasa las validaciones marcar dato como invalido
            var isValid = validArr.every(r => r);

            // Marcar estado validación
            setCellValid(Data, i, meta, isValid); // $estado.APPP.$invalid = true/false

            return isValid;
        }

        function validateLine(Data, Columns, i) {
            var validArr = Columns.map(m => validateCell(Data, i, m))
            var isValid = validArr.every(r => r);
            return isValid;
        }

        function validateAll(Data, Columns, hot) {
            Data.data.forEach(function (d, i) {
                if (!((d.$estado) || {}).$action) return;
                else if (d.$estado.$action == 'N' || d.$estado.$action == 'M') { // Economy: validar sólo líneas modificadas
                    validateLine(Data, Columns, i, hot)
                }
            })
        }

        /** Función a llamar cuando se hace un cambio. Ejecuta hooks en este orden:
         hotChange/rndChange -> meta.onValueChange -> cell.onValueChange
         hotValidation/rndValidation -> meta.validations -> cell.validations */
        function onChange(Data, i, meta, oldval, hot) { //(Data, i, meta, hot)
            //console.log("rndDialog: onChange");

            // Hacer el cambio dado por la directiva
            if (hot) {
                if (meta.hotChange) meta.hotChange(Data, i, meta, oldval, hot);
            }

            if (meta.onValueChange) {
                meta.onValueChange(Data, i, meta, oldval, hot);
            }

        }
        function genId() {
            return 'A_' + parseInt(Math.random() * 10000000000);
        }
        function initLine(line) { line.$estado = line.$estado || { $action: '', $id: genId() }; }

        function setLinked(set) {
            vm.class = set ? 'linked' : '';
            vm.slave = true;
            vm.linked = set;
            vm.disabled = set;
            vm.modified = set;
            //vm.edit = set;
        }

        function setCellValid(Data, i, meta, isValid) {
            var line = Data.data[i];
            var key = meta.field;
            line.$estado = line.$estado || {};
            line.$estado[key] = line.$estado[key] || {};
            line.$estado[key].$invalid = !isValid;
        }

        function setCellDirty(Data, i, meta) {
            var line = Data.data[i];
            var key = meta.field;
            line.$estado = line.$estado || {};
            line.$estado[key] = line.$estado[key] || {};
            line.$estado[key].$dirty = true;
        }

        function setLineModified(line) {
            line.$estado = line.$estado || {}; // init
            if (line.$estado.$action != 'N') line.$estado.$action = 'M';
        }

        function toggleLineOpen(line) {
            line.$estado = line.$estado || {}; // init
            line.$estado.$isOpen = !line.$estado.$isOpen;
        }

        function getCellMeta(line, key) {
            // crear si no existe
            line.$estado = line.$estado || {}; // init Line
            line.$estado[key] = line.$estado[key] || {}; // init Cell
            return line.$estado[key];
        }

        function toggleLineDelete(line) {
            line.$estado = line.$estado || {}; // init
            if (line.$estado.$action == 'D') {
                line.$estado.$action = ''
            } else {
                line.$estado.$action = 'D';
            }
        }

        function setLineOpen(line) {
            line.$estado = line.$estado || {}; // init
            line.$estado.$isOpen = true;
        }

        function setLineError(line, msg) {
            console.log("setLineError")
            line.$estado = line.$estado || {}; // init
            line.$estado.$action = 'E';
            line.$estado.$message = msg;
        }

        return vm

    }])

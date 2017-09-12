angular.module('core')
    .factory('rndDropArea', ['preProcess', 'rndDialog', function (preProcess, rndDialog) {
        // output.setModo, output.modo, MDA.load, MDA.onChange, output.toExcel, setMediaType --> 
        return function (_params) {
            var params = _params || {};

            var vm = {};
            vm.setModo = setModo;
            vm.getModo = getModo;
            vm.getColMap = getColMap;
            vm.getList = getList;
            vm.mergeDropData = mergeDropData;
            vm.modos = [
                { icon: 'pencil', id: 'edit', label: 'Agregar datos a las filas existentes' },
                { icon: 'retweet', id: 'replace', label: 'Reemplazar la selección existente' }
            ];
            vm.modo = vm.modos[0]; // init

            // Cargar parámetros de inicio
            if (params.onChange) vm.onChange = params.onChange;
            if (params.modos) vm.modos = params.modos;
            if (params.modo) setModo(params.modo);

            // Detalles de implementación
            function setModo(id) {
                vm.modo = (vm.modos.filter(o => o.id == id))[0];
            }
            function getModo() {
                return vm.modo;
            }

            /** para cada campo en model buscar el mejor candidato en columns **/
            function getColMap(model, columns) {
                var ret = {};
                model.forEach(function (m) {
                    var safeText = m.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // sanitizar nombre de columna para usar en regex
                    var regex = new RegExp("^(" + safeText + "|" + m.field + ")$", 'i');
                    columns.map(function (c) {
                        // intentar si hay match con m.name o m.field case-insensitive
                        if (c.match(regex)) ret[m.field] = c;
                        return ret;
                    });
                })
                return ret;
            }

            function mergeDropData(Data, dropInput, model, pk) {
                var colMap = getColMap(model, dropInput.columns);
                mergeAddData(Data, dropInput, colMap, model, pk);
                mergeData(Data, dropInput, colMap, model, pk);
            }

            function mergeAddData(Data, dropInput, colMap, model, pk) {
                dropInput.data.map(function (d) {
                    if (Data.data.findIndex(s => pk.every(k => (s[k] == d[colMap[k]]))) < 0) {
                        var obj = pk.reduce(function (t, k) { t[k] = d[colMap[k]]; return t }, {})
                        rndDialog.createLine(Data, model, obj)
                    }
                });
            }

            /** Función que combina datos de dropArea con el modelo */
            function mergeData(Data, dropInput, colMap, model, pk) {
                // cursor sobre Personas.data
                Data.data.forEach(function (s, i) {
                    // tmp es la línea de DropData que coincide con todos los campos pk
                    var tmp = dropInput.data.filter(d => pk.every(k => (s[k] == d[colMap[k]])))[0];

                    if (tmp) {
                        for (var key in colMap) {
                            // modificar si no es igual 
                            if (s[key] != tmp[colMap[key]]) {
                                // si es columna read-only avisar
                                var meta = model.filter(m=>m.field==key)[0];
                                if (meta.readOnly){
                                    console.warn("Se está tratando de cambiar una columna de sólo lectura en este contexto: ", colMap[key]);
                                    continue;
                                }
                                // actualizar valor y marcar color en celda modificada
                                s[key] = applyFormat(tmp[colMap[key]], key, model);
                                rndDialog.setLineModified(s);
                                rndDialog.setCellDirty(Data, i, { field: key });
                                rndDialog.setLineOpen(s);
                            }
                        }
                    }
                });
            }

            function applyFormat(val, field, model) {
                var meta = model.find(o => o.field == field); // encontrar model en field
                var ret = preProcess(val, meta.datatype, null, false).value;
                return ret;
            }

            /** Función usada en manageDrop que dato un objeto {columns:[arr of strings],data:[arr of obj]} entrega una lista de RUT */
            function getList(input, key, model) {
                var ret = [];
                var colMap = getColMap(model, input.columns);
                if (!colMap[key]) return ret; // salir si no viene la columna rut

                // Extraer de dropData los RUT que no son vacíos
                var ruts = input.data.map(l => l[colMap[key]]).filter(k => (k || '').length);
                if (!ruts.length) {
                    console.log({ object: 'appMsg', msg: 'La selección debe contener datos en la columna RUT', type: 'warning' });
                } else {
                    ret = [...new Set(ruts)];// ES6 idiom para retornar un array sin repetidos
                }
                return ret
            }

            return vm;
        }
    }])

    .directive('rndDropArea', ['rndExcel', '$timeout', 'rndDropTable',
        function (rndExcel, $timeout, rndDropTable) {
            return {
                restrict: 'EA',
                templateUrl: 'modules/core/directives/rndDropArea.html',
                scope: {
                    service: '=',
                },
                controller: function ($scope, $timeout) {
                    // Variables visibles en la vista
                    $scope.onChange = onChange;
                    $scope.textInput = '';

                    // alias locales
                    var service = $scope.service; // service.modos, service.modo

                    function onChange() {
                        // llamar el servicio con datos
                        var inputObj = textToObj($scope.textInput);
                        $scope.textInput = ''; // borrar el texto
                        //console.log("inputObj", inputObj);
                        if (($scope.service || {}).onChange) $scope.service.onChange(inputObj, $scope.service.getModo());
                    }

                    function textToObj(input) {
                        // convertir input en output.
                        var lineas = input.split('\n') || [];
                        // Obtener columnas como primera fila
                        var columns = lineas[0].split(/[\t;]/);
                        var data = [];
                        // Obtener arreglo de datos
                        for (var i = 1; i < lineas.length; i++) {
                            var obj = {};
                            var campos = lineas[i].split(/[\t;]/);
                            for (var j = 0; j < columns.length; j++) {
                                obj[columns[j]] = campos[j];
                            }
                            data.push(obj);
                        }
                        return { columns: columns, data: data }
                    }
                }
            }
        }
    ]
    )
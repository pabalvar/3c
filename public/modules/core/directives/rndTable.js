angular.module('core')
    .directive('rndTable', ['rndDropTable', 'rndExcel', 'hotRegisterer', '$timeout',
        function (rndDropTable, rndExcel, hotRegisterer, $timeout) {
            return {
                restrict: 'EA',
                templateUrl: 'modules/core/directives/rndTable.html',
                scope: {
                    // output--
                    model: '=',
                    instance: '=',
                    rndtable: '=',
                    data: '=',
                    // input---
                    load: '=',
                    rtablas: '=',
                    buttonsadd: '=',
                    buttonsdel: '=',

                    hideDropArea: '@',
                    defaultModo: '@modo'
                },
                controller: function ($scope, $element, $attrs, $transclude, $uibModal) {
                    // Variables que se usan en TemplateUrl: $scope.tabla, $scope.DA
                    $scope.isValid = false;

                    $scope.tabla = {};
                    $scope.idx = $scope.idx || 'hot_' + String(Math.round(Math.random() * 100000));

                    // Table options
                    $scope.tabla.settings = {
                        contextMenu: {
                            callback: function (key, options) {
                                if (key == 'removeLine') {
                                    removeRow($scope.tabla, options.start.row, options.end.row);
                                    $scope.$apply();
                                    return false;
                                } else if (key == 'removeColumn') {
                                    removeCol($scope.tabla, options.start.col, options.end.col);
                                    $scope.$apply();
                                    return false;
                                }
                            },
                            items: {
                                "removeLine": {
                                    name: 'elimina línea'
                                },
                                "removeColumn": {
                                    name: 'elimina columna'
                                }
                            }
                        },
                        afterCreateRow: function (index, numberOfRows) {
                            // elimina la nueva línea para evitar que se creen más
                            $scope.data.splice(index, numberOfRows);
                        },
                        manualColumnMove: false,
                        manualColumnResize: true
                    }

                    var loadTable = function (newVal) {

                        if (newVal) {
                            //console.log("load change triggered");
                            var arr = [];
                            var tmpTabla = {};

                            if (angular.isArray(newVal)) {
                                // Desacoplar
                                angular.copy(newVal, arr);
                                $scope.setMode('replace');
                                tmpTabla = rndDropTable.fromObject(arr, $scope.model, true, $scope.rtablas);
                                updateTable(tmpTabla);
                            } else {
                                // Es objeto. viene en forma {fn:[function],data_:[]}                         
                                if (newVal.fn == 'addColumns') {
                                    angular.copy(newVal.data, arr);
                                    $scope.setMode('edit');
                                    tmpTabla = rndDropTable.fromObject(arr, $scope.model, true, $scope.rtablas);
                                    updateTable(tmpTabla);
                                } else if (newVal.fn == 'delColumns') {
                                    angular.copy(newVal.data, arr);
                                    //$scope.setMode('edit');
                                    tmpTabla = rndDropTable.fromObject(arr, $scope.model, true, $scope.rtablas);
                                    removeCol($scope.tabla, null, null, tmpTabla.fields);
                                } else if (newVal.fn == 'broadcastValue') {
                                    angular.copy($scope.tabla.data, arr);
                                    broadcastValue(newVal.data[0], arr);
                                    tmpTabla = rndDropTable.fromObject(arr, $scope.model, true, $scope.rtablas);
                                    updateTable(tmpTabla);
                                }

                            }
                        } else {
                            //console.log("load change ignored");
                        }
                    }

                    var removeRow = function (table, row_start, row_end) {
                        // Obtener id de visible
                        var idx_s = table.visible[row_start].idx;
                        var idx_e = table.visible[row_end].idx;
                        // Eliminar del modelo visible
                        table.visible.splice(row_start, row_end - row_start + 1);
                        // Eliminar del modelo (en el caso que sea el mismo, no hace nada)
                        for (var i = 0; i < table.data.length; i++) {
                            if (table.data[i].idx >= idx_s && table.data[i].idx <= idx_e) {
                                table.data.splice(i, 1);
                            }
                        }
                    }

                    var removeCol = function (table, col_start, col_end, delColNames) {
                        // Obtener id de columnas a borrar
                        if (!delColNames) {
                            delColNames = [];
                            for (var i = 0; i < table.columns.length; i++) {
                                if (i >= col_start && i <= col_end) {
                                    delColNames.push(table.columns[i].data);
                                }
                            }
                        }
                        // Borrar columnas
                        for (var i = table.columns.length - 1; i >= 0; i--) {
                            if (delColNames.indexOf(table.columns[i].data) >= 0) {
                                table.columns.splice(i, 1);
                            }
                        }
                        // Borrar datos del visible
                        table.visible.forEach(function (o) {
                            delColNames.forEach(function (n) {
                                delete (o[n]);
                            });
                        });
                        // Borrar datos del modelo
                        table.data.forEach(function (o) {
                            delColNames.forEach(function (n) {
                                delete (o[n]);
                            });
                        });
                    }

                    $scope.modos = {
                        'edit': { label: 'Modifica sin agregar nuevas líneas.', id: 'edit' },
                        'replace': { label: 'Reemplazar la selección.', id: 'replace' }
                    }

                    // Modo de edición edit|replace
                    $scope.modo = $scope.modos[$scope.defaultModo || 'replace'];
                    $scope.setMode = function (modo) {
                        if (modo == 'edit')
                            $scope.modo = $scope.modos.edit;
                        else
                            $scope.modo = $scope.modos.replace;
                    }

                    $scope.setColumns = function () {
                        var ret = {};
                        $scope.model.forEach(function (i) {
                            ret[i.field] = i.name;
                        });
                        var tmpTabla = rndDropTable.fromObject([ret], $scope.model);
                        $scope.tabla = rndDropTable.merge($scope.tabla, tmpTabla, $scope.model);
                    }

                    $scope.deleteTable = function () {
                        $scope.tabla.visible.length = 0;
                        $scope.tabla.columns.length = 0;
                        $scope.tabla.data.length = 0;
                        $scope.data.length = 0;
                        $scope.setMode('replace');
                        $scope.load.length = 0;
                    }

                    $scope.toExcel = function () {
                        rndExcel.tableToExcel($scope.tabla, { fileName: 'RandomERP_reporte.xls' });
                    }

                    var validator = function (passed) {
                        var updateIsValid = function (p) {
                            return function () {
                                if ($scope.instance) {
                                    $scope.instance.isValid = p ? true : false;
                                    //console.log("updating valid:", p, $scope.instance.isValid);
                                }
                            }
                        }
                        $timeout(updateIsValid(passed));
                    }
                    var runValidations = function () {
                        var hot = hotRegisterer.getInstance($scope.idx);
                        hot.render();
                        hot.validateCells(validator);
                    }
                    /** Revisa todas las filas y aplica función de campo onChange */
                    var applyFormatChanges = function (changes, source) {
                        // changes = [0,field,oldVal,newVal]
                        for (var i = changes.length - 1; i >= 0; i--) {
                            $scope.tabla.columns.forEach(function (col) {
                                if (col.data == (changes[i] || [])[1]) {
                                    if (col.onValueChange) {
                                        if (!col.onValueChange(changes[i])) {
                                            //changes.splice(i, 1);
                                        }
                                    }
                                }
                            })
                        }
                    }


                    var init = false;

                    var updateTable = function (tmpTabla) {
                        if ($scope.modo.id == 'replace') {
                            $scope.tabla = tmpTabla; // Bind con Tabla
                            $scope.tabla.visible = $scope.tabla.data; // link table.items a table.items
                            $scope.data = $scope.tabla.data; // exportar datos
                            if (typeof ($scope.rndtable) != 'undefined') $scope.rndtable = tmpTabla; // exportar instancia de rndTable
                        } else if ($scope.modo.id == 'edit') {
                            $scope.tabla = rndDropTable.merge($scope.tabla, tmpTabla, $scope.model);
                        }
                        else {
                            console.error("modo de edición desconocido: ", $scope.modo);
                        }
                        if ($scope.instance) $scope.instance = $scope.tabla; // grip to table instance

                        // Agregar opciones de menu (por un problema que no entiendo hay que agregarlo en diferido y sólo la primera vez)
                        var hotInstance = hotRegisterer.getInstance($scope.idx);
                        if ($scope.instance) $scope.instance = hotInstance//$scope.tabla; // grip to table instance
                        if (!init) {
                            hotInstance.updateSettings({
                                beforeChange: applyFormatChanges,
                                afterChange: runValidations
                            });
                            $timeout(runValidations, 200);
                            init = true;

                        }
                    }

                    // Drop Area (intern)
                    //<textarea ng-model="DA.input" ng-change="DA.onChange">
                    $scope.DA = {
                        input: '',
                        onChange: function () {
                            // Init

                            var tmpTabla = {};
                            // Revisar si la entrada sirve
                            tmpTabla = rndDropTable.fromText(this.input, $scope.model);
                            updateTable(tmpTabla);

                            // Borrar entrada
                            this.input = '';

                        },
                        search: '',
                        onSearch: function () {
                            this.search = this.search.substring(0, 100); // truncar input
                            this.search = this.search.replace(/[^\w\s]/gi, ''); //remove crap 
                            if (!this.search.length)
                                $scope.tabla.visible = $scope.tabla.data;
                            else {
                                if ($scope.tabla.data) {
                                    $scope.tabla.visible = [];
                                    var re = new RegExp(this.search, "ig");
                                    $scope.tabla.data.forEach(function (o) {
                                        // Concatenate all items
                                        var line = '';
                                        $scope.tabla.columns.forEach(function (v, k) {
                                            if (!v.hidden) // eventualmente más condiciones, como v.type=='text'
                                                line += o[v.data];
                                        });
                                        if (line.match(re))
                                            $scope.tabla.visible.push(o);
                                    });
                                }
                            }
                        }
                    }

                    // Watchers
                    $scope.$watch('load', loadTable, true);
                }
            }
        }]);
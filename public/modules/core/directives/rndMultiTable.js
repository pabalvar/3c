angular.module('core')
    .directive('rndMultiTable', ['rndExcel', '$timeout',
        function (rndExcel, $timeout) {
            return {
                restrict: 'EA',
                templateUrl: 'modules/core/directives/rndMultiTable.html',
                scope: {
                    load: '=',
                    addModel: '=',
                    grouping: '=', // {CLASE:{field:'CLASE',name:'Clase',width:'10%'},...
                    output: '=', // data:[{columns:{},data:[]}]
                    hideDropArea : '='
                },
                controller: function ($scope, $timeout) {

                    $scope.toExcel = function () {
                        rndExcel.multiTableToExcel($scope.TableArray, { fileName: 'RandomERP_reporte.xls' });
                    }

                    var reload = function (newVal) {
                        if (typeof ( (newVal||{}).data)=='undefined') return false;

                        // Desacoplar
                        var Idx = {};
                        angular.copy($scope.load, Idx);
                        var datakey = Idx.datakey;
                        // Anexar data en Idx.column[KOCO]
                        Idx.data.forEach(function (l) {
                            Idx.modelo[l[datakey]].load = Idx.modelo[l[datakey]].load || [];
                            Idx.modelo[l[datakey]].load.push(l);
                            Idx.modelo[l[datakey]].instance = Idx.modelo[l[datakey]].instance || {};
                            Idx.modelo[l[datakey]].rndtable = Idx.modelo[l[datakey]].rndtable || {};
                        });

                        var TableArray = [];
                        // Recorrer definiciones de columnas, agregar campos opcionales
                        for (var key in Idx.modelo) {
                            if (Idx.modelo[key].load) { // Si hay datos en esta tabla agregar
                                if ($scope.addModel) {
                                    angular.merge(Idx.modelo[key].column, $scope.addModel); // Agregar columnas fijas
                                }
                                Idx.modelo[key].columns = Object.values(Idx.modelo[key].column);
                                var tmp = {};
                                for (var k in $scope.grouping) {
                                    tmp[k] = Idx.modelo[key].prop[k];
                                };
                                TableArray.push(tmp);
                            }
                        }

                        $scope.TableArray = TableArray;
                        $scope.rtablas = Idx.rtablas;

                        /** Redibuja tabla Handsometable ( se debe hacer en diferido debido a ng-if...*/
                        var assign = function () {
                            $scope.TableArray.forEach(function (o) {
                                o.tabla = Idx.modelo[o[datakey]];
                            })
                            // Exportar resultados
                            if ($scope.output) {
                                $scope.output.isValid = function(){
                                  return $scope.output.instance.map(i => i.tabla.instance.isValid).every(o=>o);                
                                }            
                                $scope.output.instance = $scope.TableArray;

                            }
                        };
                        $timeout(assign);
                    }
                    $scope.$watch('load', reload, true);
                }
            }
        }])
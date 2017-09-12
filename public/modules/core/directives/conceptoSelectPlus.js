'use strict';
angular.module("core")
    .directive("rndConceptoSelectPlus", function () {
        return {
            restrict: 'E',
            scope: {
                output: "=" // entrega output.obj a controller que use directiva
            },
            templateUrl: 'modules/core/directives/conceptoSelectPlus.html',
            controller: 'rndConceptoSelectPlusCtlr'
        }
    })
    /** Concepto.list/selected,  */
    .controller("rndConceptoSelectPlusCtlr", ['rndDialog', '$timeout', 'WS', 'rndAlerts', 'conceptoDef', '$scope', 'conceptoAssign', '$filter',
        function (rndDialog, $timeout, WS, rndAlerts, conceptoDef, $scope, conceptoAssign, $filter) {

            // visibles en vista
            $scope.conceptos; // (Array of obj) Lista de conceptos
            $scope.concepto; // (obj)
            $scope.operadores = initOperadores();
            $scope.vm = {}; // vm.concepto (obj) concepto seleccionado, $busy
            var $dialog = rndDialog;

            $scope.onSubmit = onSubmit;
            $scope.onSelectConcepto = onSelectConcepto;
            $scope.refreshDialog = refreshDialog;

            // Bind Services to scope 
            var ws = new WS($scope);
            var alert = new rndAlerts($scope, 'AlertService');
            var vm = $scope.vm; // alias a viewModel
            //var linea = $scope.linea; // alias al valor

            // Init
            vm.operador = 'eq'; // por defecto pre-selecciona operador 'igual'
            vm.linea = initLinea();
            getConceptos(); // llama WS para obtener lista de conceptos
            vm.Data = {data:[vm.linea]}


            // Detalles de implementación

            /** Deja lista de conceptos en $scope.conceptos; */
            function getConceptos() {
                var params = {
                    tipoclase: 'E',
                    fields: ['CLASE', 'KOCO', 'NOKOCO']
                }
                ws(conceptoDef.get, params, 'conceptos', createTypeaheadString, alert.parse);
            }

            /* Crea campo 'clave' como concatenación de otros campos */
            function createTypeaheadString(res) {
                res.data.forEach(function (i) {
                    i.clave = i.KOCO + i.NOKOCO + i.CLASE; // typeahead
                });
            }

            /** Se inicia la linea de valor, con dates por defecto **/
            function initLinea() {
                var ret = {
                    FECHAINI: new Date(),
                    FECHAFIN: new Date(),
                };
                $dialog.setLineOpen(ret);
                return ret;
            }

            /* función que prende y apaga la variable $ready para resetear dialogs */
            function refreshDialog() {
                vm.$busy = true;
                $timeout(function () { vm.$busy = false; })
            }

            /* Asigna a $scope.Concepto.columns las propiedades visibles en el modelo */
            function getVisibleColumns(res) {
                res.columns = Object.values(res.modelo[vm.concepto.KOCO].column).filter(o => o.visible);
            }

            function onSelectConcepto($item, $model, $label) {
                // Obtener modelo del concepto
                var params = {
                    empresa: $scope.currentCompany,
                    contratos: 'NEWID()', // ToDo: peligroso. Buscar función GUID en cliente mejor
                    unassigned: true,
                    concepto: $item.KOCO
                };
                ws(conceptoAssign.get, params, 'concepto', getVisibleColumns, alert.parse);
            }

            /** entrga lista de operadores */
            function initOperadores() {
                return [
                    { id: 'eq', name: 'igual a', short: '=' },
                    { id: 'gt', name: 'mayor que', short: '>=' },
                    { id: 'lt', name: 'menor que', short: '<=' }
                ]
            }

            /** concetenar nombre como concepto [propiedad operador valor] */
            function getName(obj, model, rtablas) {
                var ret = obj.concepto;
                ret += obj.propiedad ? (':' + model.name) : '';
                ret += obj.propiedad ? ($scope.operadores.filter(o => o.id == obj.operador)[0].short) : '';
                ret += (typeof (obj.valor) != 'undefined') ? $filter('monitor')(obj.valor, model, rtablas) : '';
                return ret;
            }

            /** Función que exporta el filtro creado al controlador que esté usando directiva */
            function onSubmit() {
                var ret = {
                    concepto: vm.concepto.KOCO,
                    propiedad: vm.propiedad,
                    operador: vm.propiedad ? vm.operador : undefined,
                    valor: vm.propiedad ? vm.linea[vm.propiedad] : undefined
                }
                // Truco: hacer cast a número si valor es numérico
                var valor = parseInt(ret.valor);
                if (!isNaN(valor)) ret.valor = valor;
                // Calcular nombre
                ret.name = getName(ret, $scope.concepto.modelo[vm.concepto.KOCO].column[vm.propiedad], $scope.concepto.rtablas)
                // Exportar resultado a $scope externo
                $scope.output.obj = ret;
            }
        }
    ])
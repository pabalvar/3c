'use strict';

/**
 * @ngdoc controller
 * @name gestion.controller:gestionPagosClientesController
 * @description
 * Controlador de pagos. Usa el servicio {@link liberp.pagos pagos}, {@link liberp.documentos documentos}, {@link liberp.entidades entidades}
 */
angular.module('gestion').controller('gestionPagosClientesController',
    ['$scope', 'entidades', 'pagos', 'documentos', 'rndEmpresa', 'ws', 'rndDialog', 'metaEntidad', 'metaPago', 'metaDeuda','$timeout',
        function ($scope, entidades, pagos, documentos, rndEmpresa, ws, rndDialog, metaEntidad, metaPago, metaDeuda,$timeout) {

            /** Trae ENTIDAD **/
            $scope.metaEntidad = metaEntidad;
            $scope.pasoEntidad = { data: [] };
            $scope.traeEntidad = function (query) {
                return ws(entidades.get, {
                    fields: $scope.metaEntidad.data.map(m => m.field),
                    search: query.search,
                    size: 10,
                    order: 'NOKOEN'
                });
            }

            /** Trae PAGO */
            $scope.metaPago = metaPago;
            $scope.apiPago = {}
            $scope.pasoPago = { data: [] };
            function traePago() {
                return ws(pagos.get, {
                    fields: $scope.metaPago.data.map(m => m.field),
                    koen: $scope.pasoEntidad.data.map(e => e.KOEN),
                    empresa: rndEmpresa.get(),
                    variante: 'simple',
                    size: 10,
                    order: 'FEEMDP'
                }, $scope.pasoPago, clickRow($scope.apiPago, 0));
            };


            /** Trae DEUDA */
            $scope.metaDeuda = metaDeuda;
            $scope.apiDeuda = {}
            $scope.pasoDeuda = { data: [] };
            function traeDeuda() {
                return ws(documentos.traeDeuda.get, {
                    fields: $scope.metaDeuda.data.map(m => m.field),
                    koen: $scope.pasoEntidad.data.map(e => e.KOEN),
                    empresa: rndEmpresa.get(),
                    size: 10,
                    order: 'FEULVEDO'
                }, $scope.pasoDeuda, clickRow($scope.apiDeuda, 0));
            }

            /* Cruce Pagos-Deuda */
            $scope.apiCruce = {}
            $scope.pasoCruce = { data: [] }
            $scope.metaCruce = {
                data: rndDialog.initMeta([
                    { field: "SALDODP", name: "Saldo pago.", datatype: 'number', length: '10', readOnly: true, visible: true },
                    { field: "SALDOEDO", name: "Saldo doc.", datatype: 'number', readOnly: true, visible: true, length: '10' },
                    { field: "MAXASIG", name: "Máximo asignable", datatype: 'currency', readOnly: true, visible: true, length: '10', onClick: asignaMaximo },
                    { field: "ASIGNADO", name: "Asignado", visible: true, datatype: 'number', length: '10', validations: [validaCruce] },
                ])
            }


            /** Lógica **/

            // Si se agregan o borran pagos recrear cruce 
            $scope.$watchCollection('pasoPago.data', onCambioLineas);
            $scope.$watchCollection('pasoDeuda.data', onCambioLineas);

            // Si cambia un valor volver a calcular y validar
            $scope.onChangeValue = calcula;

            // Función llamada por directiva cuando cambia entidad (causa recarga de pago y deuda)
            $scope.onChangeEntidad = onChangeEntidad;

            // Si se crea una línea de pago hacer foco en ella (toDo: esto debería ser parte de la directiva)
            $scope.onAddRowPago = onAddRowPago;

            // Variables de resumen
            $scope.resumen = {
                saldoDeuda: 0,
                asignadoCruce: 0
            }

            // Si se crea un nuevo pago, proponer el total por pagar
            $scope.metaPago.data.VADP.onInit=()=>$scope.resumen.saldoDeuda;
            $scope.metaPago.data.$estado.visible=true;//onInit=()=>$scope.resumen.saldoDeuda;


            /** Funciones auxiliares */
            function onCambioLineas() {
                creaPasoCruce();
                calcula();
            }

            function onChangeEntidad(n, o) {
                cleanData();
                traePago();
                traeDeuda();
            }

            function cleanData() {
                console.log("Clean Data")
                $scope.pasoPago.data.length = 0;
                $scope.pasoDeuda.data.length = 0;
                $scope.pasoCruce.data.length = 0;
            }

            // Función llamada desde la directiva al crear nuevo pago
            function onAddRowPago(linea, source, rowIx) {
                $scope.apiPago.goToRow(rowIx);
            }

            /** Función que dada una api (de rndSmtable) y un número de línea, ejecuta un click usando la api*/
            function clickRow(api, row) {
                return (res) => { $timeout(()=>{ if (res.data[row]) api.clickRow(row); })}
            }

            function goToRow(api) { return (res) => { api.goToRow(); } }

            /** Esta función guarda en pasoCruce una matriz que es el cruce de 
             * pasoPagos y pasoDeuda y guarda el dato de abono */
            function creaPasoCruce(res) {
                // Inicializar variables
                var cruce = [];
                var pasoCruce = $scope.pasoCruce.data || [];

                // recorrer pasoPago y pasoDeuda
                $scope.pasoPago.data.forEach(function (p) {
                    $scope.pasoDeuda.data.forEach(function (d) {
                        var obj = {};

                        // buscar si existe en pasoCruce un objeto que referencie al pago y deuda iterando
                        var ix = pasoCruce.findIndex(o => (o.$pago === p && o.$deuda === d));
                        if (ix >= 0) {
                            // Si el cruce existe insertar al array
                            obj = pasoCruce[ix];
                        } else {
                            // Si el cruce no existe, crear uno nuevo
                            obj = rndDialog.createObject($scope.metaCruce.data);

                            // agregar referencias a objetos pago y deuda originales
                            obj.$pago = p;
                            obj.$deuda = d;

                            // marcar línea como editable
                            rndDialog.setLineOpen(obj);
                        }
                        // Si existe el cruce insertar el anterior, si no, el nuevo
                        cruce.push(obj);
                    })
                });
                // actualizar el paso cruce
                $scope.pasoCruce.data = cruce
            }

            /** Validaciones custom */

            /** Función que se pasa a la directiva que valida datos en cruce */
            function validaCruce(Data, rowIx, meta) {
                console.log("validaCruce")
                var l = Data.data[rowIx]; // alias para la línea
                var err = []; // estructura de errores

                // Validaciones
                if (l.ASIGNADO > l.MAXASIG) err.push('Se está asignando más que el saldo.');
                if (l.ASIGNADO < 0) err.push('La asignación debe ser mayor que cero.');
                var ret = err.length ? err.join(' ') : true;
                return ret;
            }

            /** Función que actualiza los saldos en pasoDeuda, pasoPago y pasoCruce */
            function calcula() {
                // Calcula
                calculaDeuda();
                calculaPagos();
                calculaCruce();
                calculaTotales();
                // Valida
                if ($scope.apiPago.validate) $scope.apiPago.validate();
                if ($scope.apiCruce.validate) $scope.apiCruce.validate();
            }

            /** Calcular la suma de asignaciones para cada pago */
            function calculaPagos() {
                //console.log("calculaPagos. Costo:", $scope.pasoPago.data.length);
                $scope.pasoPago.data.forEach(function (p) {
                    p.ASIGDP = $scope.pasoCruce.data
                        .filter(c => c.$pago === p)
                        .reduce(function (total, cruce) {
                            return total += (cruce.ASIGNADO || 0);
                        }, 0);

                    // Actualizar VAASDPN (Abono actual) = Abono anterior (VAASDP) + Abono nuevo (ASIGDP)    
                    p.VAASDPN = p.VAASDP + p.ASIGDP;
                    // Actualizar SALDODP (Saldo actual) = Valor documento + Abono actual    
                    p.SALDODP = p.VADP - p.VAASDPN
                })
            }

            /** Calcular la suma de asignaciones para cada documento */
            function calculaDeuda() {
                //console.log("calculaDeuda. Costo:", $scope.pasoDeuda.data.length);
                $scope.pasoDeuda.data.forEach(function (d) {
                    d.ASIGEDO = $scope.pasoCruce.data
                        .filter(c => c.$deuda === d)
                        .reduce(function (total, cruce) {
                            return total += (cruce.ASIGNADO || 0);
                        }, 0);
                    // Saldo es igual al ValorDP - AsignadoAnterior - AsignadoNuevo
                    d.SALDOEDO = d.VABRDO - d.VAABDO - d.ASIGEDO;
                })
            }

            function calculaTotales() {
                var saldoDeuda = 0;
                $scope.pasoDeuda.data.forEach(f => { saldoDeuda += f.SALDOEDO })
                $scope.resumen.saldoDeuda = saldoDeuda;
                var asignadoCruce = 0;
                $scope.pasoCruce.data.forEach(f => { asignadoCruce += f.ASIGNADO })
                $scope.resumen.asignadoCruce = asignadoCruce;
            }

            /* Calcular máximo asignable en cada cruce como el mínimo entre 
             * el disponible del pago ($pago.SALDODP) y el saldo de la deuda ($deuda.SALDOEDO) */
            function calculaCruce() {
                //console.log("calculaCruce. Costo:", $scope.pasoCruce.data.length);
                $scope.pasoCruce.data.forEach(function (o) {
                    o.SALDODP = o.$pago.SALDODP;
                    o.SALDOEDO = o.$deuda.SALDOEDO; //+o.$pago.ASIGNADO
                    o.MAXASIG = Math.min(o.SALDODP + o.ASIGNADO, o.SALDOEDO + o.ASIGNADO);
                })
            }

            function asignaMaximo(line) {
                line.ASIGNADO = line.MAXASIG;
                calcula();
                $scope.apiCruce.redraw();// XXX Truco para que redibuje la tabla (falla rnd-input)
            }


            /** Función que oculta las líneas en pasoCruce que no están seleccionadas en 
             * la grilla de Pago y Documento
             */
            $scope.selectRow = filtraLineas;
            function filtraLineas() {

                // Obtener el seleccionado de pago
                var pagoSeleccionados = $scope.pasoPago.data.filter(l => l.isSelected);
                var deudaSeleccionada = $scope.pasoDeuda.data.filter(l => l.isSelected);
                var showAllPago = !pagoSeleccionados.length;
                var showAllDeuda = !deudaSeleccionada.length;

                // Dejar todos los otros hidden
                $scope.pasoCruce.data.forEach(function (l) {
                    var muestraLinea = (l.$pago.isSelected || showAllPago) && (l.$deuda.isSelected || showAllDeuda);
                    l.$estado.hidden = !muestraLinea;
                });

            }

        }
    ])

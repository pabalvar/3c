'use strict';

/**
 * @ngdoc controller
 * @name gestion.controller:gestionPagosClientesController
 * @description
 * Controlador de pagos. Usa el servicio {@link liberp.pagos pagos}, {@link liberp.documentos documentos}, {@link liberp.entidades entidades}
 */
angular.module('gestion').controller('gestionPagosClientesController',
    ['$scope', 'entidades', 'pagos', 'documentos', 'rndEmpresa', 'ws', 'rndDialog', 'metaEntidad', 'metaPago', 'metaDeuda',
        function ($scope, entidades, pagos, documentos, rndEmpresa, ws, rndDialog, metaEntidad, metaPago, metaDeuda) {

            /* Rtablas */
            $scope.rtablas = angular.extend({},
                metaPago.rtablas,
                metaDeuda.rtablas,
                metaEntidad.rtablas);

            /** Trae ENTIDAD **/
            $scope.metaEntidad = metaEntidad.data;
            $scope.pasoEntidad = [];
            $scope.traeEntidad = function (query) {
                return ws(entidades.get, {
                    fields: $scope.metaEntidad.map(m => m.field),
                    search: query.search,
                    size: 10,
                    order: 'NOKOEN'
                });
            }

            /** Trae PAGO */
            $scope.metaPago = rndDialog.initMeta(metaPago.data);
            $scope.apiPago = {}
            $scope.pasoPago = { data: [] };
            $scope.traePago = function (query) {
                return ws(pagos.get, {
                    fields: $scope.metaPago.map(m => m.field),
                    koen: $scope.pasoEntidad.map(e => e.KOEN),
                    empresa: rndEmpresa.get(),
                    variante: 'simple',
                    size: 10,
                    order: 'FEEMDP'
                }, $scope.pasoPago, [onReload, clickRow($scope.apiPago, 0)]);
            };

            /** Trae DEUDA */
            $scope.metaDeuda = rndDialog.initMeta(metaDeuda.data)
            $scope.apiDeuda = {}
            $scope.pasoDeuda = { data: [] };
            $scope.traeDeuda = function (query) {
                return ws(documentos.traeDeuda.get, {
                    fields: $scope.metaDeuda.map(m => m.field),
                    koen: $scope.pasoEntidad.map(e => e.KOEN),
                    empresa: rndEmpresa.get(),
                    size: 10,
                    order: 'FEULVEDO'
                }, $scope.pasoDeuda, [onReload, clickRow($scope.apiDeuda, 0)]);
            }

            /* Cruce Pagos-Deuda */
            $scope.metaCruce = rndDialog.initMeta([
                { field: "SALDODP", name: "Saldo pago.", datatype: 'number', length: '10', readOnly: true, visible: true },
                { field: "SALDOEDO", name: "Saldo doc.", datatype: 'number', readOnly: true, visible: true, length: '10' },
                { field: "MAXASIG", name: "Máximo asignable", datatype: 'currency', readOnly: true, visible: true, length: '10', onClick: asignaMaximo },
                { field: "ASIGNADO", name: "Asignado", visible: true, datatype: 'number', length: '10', validations: [valida] },
            ])
            $scope.apiCruce = {}
            $scope.pasoCruce = { data: [] }




            /** Lógica **/
            
            /* 1. Si cambia entidad traer pagos y deuda */
            $scope.$watch('pasoEntidad', onCambioDeEntidad, true);
            /* 2. Si se agregan o borran pagos recrear cruce */


            /* 3. Si cambian valores de cruce, recalcular */

            // Si cambia entidad volver a cargar deuda y pagos
            

            function onCambioDeEntidad(n, o) {
                if (!n.length) return;
                $scope.traePago();
                $scope.traeDeuda();
            }

            // Si cambian pagos o deuda recalcular todo:
            $scope.$watch('pasoPago.data', function (n, o) {
                if (!n.length) return;
                console.log("detecta cambio pago")
                creaPasoCruce();
                calcula();
            }, true);
            $scope.$watch('pasoDeuda.data', function (n, o) {
                if (!n.length) return;
                console.log("detecta cambio deuda")
                creaPasoCruce();
                calcula();
            }, true);
            $scope.$watch('pasoCruce.data', function (n, o) {
                if (!n.length) return;
                console.log("detecta cambio cruce")
                creaPasoCruce();
                calcula();
            }, true);

            function onReload() {
                //creaPasoCruce();
                //calcula();
            }

            $scope.onAddRowPago = function (linea, source, rowIx) {
                //console.log("al controler llegó esta línea", linea, rowIx);
                //onReload();
                clickRow($scope.apiPago, rowIx)($scope.pasoPago);
                goToPage($scope.apiPago, rowIx)($scope.pasoPago);

            }

            $scope.cambiaPago = function (x) {
                //console.log("cambio pago en controller", arguments);
                //calcula();
                //onReload();
                //var fn=clickRow($scope.apiPago, 0);//($scope.pasoPago);
                // if (!$scope.pasoPago.data[$scope.pasoPago.data.length-1].isSelected){
                //  fn($scope.pasoPago);
                //}
            }
            function goToPage(api) {
                return function (res) {
                    api.goToPage();
                }
            }
            /** Función que dada una api (de rndSmtable) y un número de línea, ejecuta un click usando la api*/
            function clickRow(api, row) {
                return function (res) {
                    if (res.data[row]) api.clickRow(row);
                }
            }

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

                        // buscar entre los existentes
                        var ix = pasoCruce.findIndex(o => (o.$pago === p && o.$deuda === d));
                        if (ix >= 0) {
                            // Si el cruce existe insertar al array
                            obj = pasoCruce[ix];
                        } else {
                            // Si el cruce no existe, crear uno nuevo
                            obj = rndDialog.createObject($scope.metaCruce);

                            // agregar referencias a objetos pago y deuda originales
                            obj.$pago = p;
                            obj.$deuda = d;

                            // agregar propiedades de diálogo, 
                            rndDialog.setLineOpen(obj);

                        }
                        // Si existe el cruce insertar el anterior, si no, el nuevo
                        cruce.push(obj);
                    })
                });
                // actualizar el paso cruce
                $scope.pasoCruce.data = cruce
            }

            /** Función que retorna errores */
            function valida(Data, rowIx, meta) {
                console.log("valida")
                var l = Data.data[rowIx]; // alias para la línea
                var err = []; // estructura de errores

                // Validaciones
                if (l.ASIGNADO > l.MAXASIG) err.push('Se está asignando más que el saldo.');
                if (l.ASIGNADO < 0) err.push('La asignación debe ser mayor que cero.');
                var ret = err.length ? err.join(' ') : true;
                return ret;
            }

            /** Función que actualiza los saldos en pasoDeuda, pasoPago y pasoCruce */
            function calcula(newVal, oldVal, linea, Data, rowIx, key, column) {
                calculaDeuda();
                calculaPagos();
                calculaCruce();
            }
            // $scope.onChange = calcula;

            /** Calcular la suma de asignaciones para cada pago */
            function calculaPagos() {
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

            /* Calcular máximo asignable en cada cruce como el mínimo entre 
             * el disponible del pago ($pago.SALDODP) y el saldo de la deuda ($deuda.SALDOEDO) */
            function calculaCruce() {
                $scope.pasoCruce.data.forEach(function (o) {
                    o.SALDODP = o.$pago.SALDODP;
                    o.SALDOEDO = o.$deuda.SALDOEDO; //+o.$pago.ASIGNADO
                    o.MAXASIG = Math.min(o.SALDODP + o.ASIGNADO, o.SALDOEDO + o.ASIGNADO);
                })
            }

            function asignaMaximo(line) {
                line.ASIGNADO = line.MAXASIG;
                calcula();
                valida({ data: [line] }, 0);
                $scope.apiCruce.redraw();// XXX Truco para que redibuje la tabla (falla rnd-input)
            }


            /** Función que oculta las líneas en pasoCruce que no están seleccionadas en 
             * la grilla de Pago y Documento
             */
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

            // Conectar a la vista
            $scope.selectRow = filtraLineas;

        }
    ])

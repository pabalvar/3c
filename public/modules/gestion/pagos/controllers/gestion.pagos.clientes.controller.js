'use strict';

/**
 * @ngdoc controller
 * @name gestion.controller:gestionPagosClientesController
 * @description
 * Controlador de pagos. Usa el servicio {@link liberp.pagos pagos}, {@link liberp.documentos documentos}, {@link liberp.entidades entidades}
 */
angular.module('gestion').controller('gestionPagosClientesController',
    ['$scope', 'entidades', 'pagos', 'documentos', 'rndEmpresa', 'ws', 'rndDialog', 'metaEntidad', 'metaPago', 'metaPagod', 'metaDeuda', '$timeout', 'rndAlerts', '$uibModal', 'gestionCuentasEntidadModal', 'focus','$interval',
        function ($scope, entidades, pagos, documentos, rndEmpresa, ws, rndDialog, metaEntidad, metaPago, metaPagod, metaDeuda, $timeout, rndAlerts, $uibModal, gestionCuentasEntidadModal, focus, $interval) {

            /** Modelo de datos */
            $scope.apiEntidad = {}
            //$interval(()=>{ console.log("foco",document.activeElement)},5000)
            // Trae ENTIDAD 
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

            $scope.cacha = function(e){
                console.log("keydown gestion")
            }


            // Trae PAGO
            $scope.metaPago = metaPago;
            $scope.metaPago.data.ENDP.onInit = () => $scope.pasoEntidad.data[0].KOEN; // Agregar código entidad al nuevo pago
            $scope.metaPago.data.TIDP.onBlur = selectCuenta; // Abrir modal select cuenta cuando pierde foco CHV
            $scope.metaPago.data.TIDP.onInit = () => 'EFV' // Por defecto efectivo
            $scope.metaPago.data.push({ field: "SALDODP", name: "Saldo", visible: true, length: '10', readOnly: true, datatype: "currency" })
            $scope.metaPago.data.$estado.visible = true;
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
                }, $scope.pasoPago, [/*clickRow($scope.apiPago, 0), *//*focusOnTable*/ ]);
            };


            // Trae DEUDA
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
                }, $scope.pasoDeuda);
            }

            // CRUCE Pagos-Deuda
            $scope.apiCruce = {}
            $scope.pasoCruce = { data: [] }
            $scope.metaCruce = metaPagod;
            $scope.metaCruce.data.VAASDP.validations = [validaCruce];
            $scope.metaCruce.data.push({ field: "MAXASIG", name: "Máximo", datatype: 'currency', readOnly: true, visible: true, length: '10', onClick: asignaMaximo, icon: 'left' })
            $scope.metaCruce.data.push({ field: "NUDO", name: "Número", visible: true, length: '10', readOnly: true })
            $scope.metaCruce.data.push({ field: "UIDMAEDPCE" })
            $scope.metaCruce.data.$estado.visible = true;

            // Variables de RESUMEN
            $scope.resumen = {
                saldoDeuda: 0,
                asignadoCruce: 0,
                canSave: false
            }

            /** Lógica **/

            // Si se agregan o borran pagos recrear cruce 
            $scope.$watchCollection('pasoPago.data', onCambioLineas);
            $scope.$watchCollection('pasoDeuda.data', onCambioLineas);

            // Función llamada por directiva cuando cambia entidad (causa recarga de pago y deuda)
            $scope.onChangeEntidad = onChangeEntidad;
            // Si cambia un valor volver a calcular y validar
            $scope.onChangeValue = calcula;
            // Si se crea una línea de pago hacer foco en ella (toDo: esto debería ser parte de la directiva)
            $scope.onAddRowPago = onAddRowPago;
            // Si se crea un nuevo pago, proponer el total por pagar
            $scope.metaPago.data.VADP.onInit = () => $scope.resumen.saldoDeuda;
            // Valores por defecto para un nuevo pago
            $scope.metaPago.data.EMPRESA.onInit = () => rndEmpresa.get();
            $scope.metaPago.data.MODP.onInit = () => '$';
            // Al hacer click en líneas, mostrar cruce que tienen que ver
            $scope.selectRow = filtraLineas;
            // Botón grabar
            $scope.save = save;
            // Resultados de grabación
            $scope.alert = new rndAlerts();


            function guardaPago() {
                return ws(pagos.post, {
                    pagosd: rndDialog.getModified($scope.pasoCruce.data, $scope.metaCruce.data),
                    pagos: rndDialog.getCreated($scope.pasoPago.data, $scope.metaPago.data)
                }, $scope.saveWS, [$scope.alert.parse, cleanAll], $scope.alert.parse);
            }

            /*function focusOnTable() {
                console.log("vamos a cliquear en:", $scope.apiPago.id);
                focus($scope.apiPago.id);
            }*/
            /** Funciones auxiliares */
            function save() {
                guardaPago();
            }
            function onCambioLineas() {
                creaPasoCruce();
                calcula();
                pivotTable();
            }

            function cleanAll() {
                $scope.pasoEntidad = { data: [] }
                onChangeEntidad();
            }

            function onChangeEntidad(n, o) {
                cleanData();
                traePago();
                traeDeuda();
            }

            function cleanData() {
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
                return (res) => {
                    $timeout(() => { if (res.data[row] && api.clickRow) api.clickRow(row); })
                }
            }

            /* Asigna el campo $cruce un array con cruces */
            function pivotTable() {
                $scope.pasoPago.data.forEach(function (p) {
                    // Borrar
                    p.$cruce = [];
                    $scope.pasoCruce.data.forEach(function (c) {
                        if (c.$pago === p) p.$cruce.push(c);
                    })
                })
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

                        // buscar si existe en pasoCruce un objeto que referencie al pago y deuda iterando
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

                            // Agregar campos padre
                            obj.UIDMAEDPCE = obj.$pago.UIDMAEDPCE;
                            obj.TIDOPA = obj.$deuda.TIDO;
                            obj.NUDO = obj.$deuda.NUDO;
                            obj.IDRST = obj.$deuda.IDMAEEDO;
                            //obj.NUDP = o.$deuda.NUDP;

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

            // Función que se pasa a la directiva que valida datos en cruce
            function validaCruce(Data, rowIx, meta) {
                var l = Data.data[rowIx]; // alias para la línea
                var err = []; // estructura de errores

                // Validaciones
                if (l.VAASDP > l.MAXASIG) err.push('Se está asignando más que el saldo.');
                if (l.VAASDP < 0) err.push('La asignación debe ser mayor que cero.');
                var ret = err.length ? err.join(' ') : true;
                return ret;
            }

            // Función que actualiza los saldos en pasoDeuda, pasoPago y pasoCruce
            function calcula() {
                // Calcula
                calculaDeuda();
                calculaPagos();
                calculaCruce();
                calculaTotales();
                // Forzar validación de todo el dataset
                if ($scope.apiPago.validate) $scope.apiPago.validate();
                if ($scope.apiCruce.validate) $scope.apiCruce.validate();
                // Ejecutar validación en diferido (después que se calcule validación del rndInput)
                $timeout(() => { validaGrabacion() });
            }

            // Calcula si es posible grabar en base a que hayan cambios y todas las validaciones estén superadas
            function validaGrabacion() {
                $scope.resumen.canSave =
                    rndDialog.getSumState($scope.pasoPago, $scope.metaPago).canSave ||
                    rndDialog.getSumState($scope.pasoCruce, $scope.metaCruce).canSave;
                //console.log("get sumState cruce ", rndDialog.getSumState($scope.pasoCruce, $scope.metaCruce).canSave)
            }

            // Calcular la suma de asignaciones para cada pago
            function calculaPagos() {
                //console.log("calculaPagos. Costo:", $scope.pasoPago.data.length);
                $scope.pasoPago.data.forEach(function (p) {
                    p.ASIGDP = $scope.pasoCruce.data
                        .filter(c => c.$pago === p)
                        .reduce(function (total, cruce) {
                            return total += (cruce.VAASDP || 0);
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
                            return total += (cruce.VAASDP || 0);
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
                $scope.pasoCruce.data.forEach(f => { asignadoCruce += f.VAASDP })
                $scope.resumen.asignadoCruce = asignadoCruce;
            }

            /* Calcular máximo asignable en cada cruce como el mínimo entre 
             * el disponible del pago ($pago.SALDODP) y el saldo de la deuda ($deuda.SALDOEDO) */
            function calculaCruce() {
                //console.log("calculaCruce. Costo:", $scope.pasoCruce.data.length);
                $scope.pasoCruce.data.forEach(function (o) {
                    o.MAXASIG = Math.min(o.$pago.SALDODP + o.VAASDP, o.$deuda.SALDOEDO + o.VAASDP);

                })
            }

            function asignaMaximo(line) {
                rndDialog.change(line, $scope.metaCruce.data.VAASDP, line.MAXASIG);
                calcula();
                $scope.apiCruce.redraw();// XXX Truco para que redibuje la tabla (falla rnd-input)
            }

            /** Función que abre un modal para seleccionar las cuentas */
            function selectCuenta(line, column, source) {
                if (line.TIDP && line.TIDP != 'EFV')
                    $uibModal.open(gestionCuentasEntidadModal({ koen: line.ENDP, tidp: line.TIDP, empresa: line.EMPRESA, tidp: line.TIDP })).result.then(function (res) {
                        //console.log("selected:", res)
                    }, function () {
                        //console.info('Modal dismissed at: ' + new Date());
                    });
            };


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
            $scope.dump = dump;
            function dump() {
                console.log(rndDialog.getCreated($scope.pasoPago.data, $scope.metaPago.data));
                //console.log(rndDialog.getModified($scope.pasoCruce.data, $scope.metaCruce.data));
            }

        }
    ])

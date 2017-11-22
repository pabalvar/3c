'use strict';

/**
 * @ngdoc controller
 * @name gestion.controller:gestionPagosClientesController
 * @description
 * Controlador de pagos. Usa el servicio {@link liberp.pagos pagos}, {@link liberp.documentos documentos}, {@link liberp.entidades entidades}
 */
angular.module('gestion').controller('gestionPagosClientesController', ['$scope', 'entidades', 'pagos', 'documentos', 'rndEmpresa', 'ws',
    function ($scope, entidades, pagos, documentos, rndEmpresa, ws) {

        /** Trae ENTIDAD **/
        $scope.metaEntidad = [
            { field: "NOKOEN", name: "Nombre", visible: true, datatype: 'string:capitalize' },
            { field: "KOEN", name: "Código", visible: true, pk: true },
            { field: "TIEN", name: "Tipo", visible: true, datatype: 'rtabla', tabla: 'TipoEntidad', options: { returnSrv: "id", returnClient: "name" } },
            { field: "SUEN", name: "Suc.", visible: true, pk: true }
        ];
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
        $scope.metaPago = [
            { field: "IDMAEDPCE", name: "IDMAEDPCE", visible: false, pk: true },
            { field: "EMPRESA", readOnly: true, name: "Empresa", visible: false },
            { field: "TIDP", name: "TD", description: "Tipo documento", visible: true, length: "5", datatype: 'rtabla', tabla: 'FormasDePago', options: { returnSrv: "codigo", returnClient: "codigo" } },
            { field: "NUDP", name: "Número", description: "Número documento de pago", visible: false },
            { field: "ENDP", name: "Entidad", description: "Entidad documento de pago", visible: false },
            { field: "EMDP", name: "Emisor", description: "Emisor documento de pago (banco)", visible: false },
            { field: "SUEMDP", name: "Sucursal", description: "Plaza", visible: false },
            { field: "CUDP", name: "Cuenta", description: "Cuenta de banco", visible: false },
            { field: "NUCUDP", name: "Número", description: "Número de cheque o transferencia", visible: true, length: "10" },
            { field: "FEEMDP", name: "F. Emisión", visible: true, datatype: 'date', length: "8" },
            { field: "FEVEDP", name: "F. Vencim.", visible: true, datatype: 'date', length: "8" },
            { field: "MODP", name: "M", description: "Moneda", visible: true, length: "1", onInit: () => '$' },
            { field: "TIMODP", name: "Tipo moneda", description: "Nacional (N) o extranjera (E)", visible: false },
            { field: "TAMODP", name: "Tasa de cambio", visible: false },
            { field: "VADP", name: "Monto", visible: true, datatype: 'number', length: "10" },
            //{ field: "VAABDP", name: "Abono", description: "Abono anterior asignado", visible: false, datatype: 'number' },
            { field: "VAASDP", name: "Asignado (anterior)", description: "Asignado (anterior)", visible: false, datatype: 'number' },
            { field: "VAASDPN", name: "Asignado", description: "Asignado (nuevo)", visible: false, datatype: 'number' },
            { field: "SALDODP", name: "Saldo", description: "Disponible", readOnly: true, visible: true, datatype: 'number', length: "10" },
            { field: "VAVUDP", name: "Vuelto", description: "Vuelto", visible: false, datatype: 'number' },
            { field: "ESPGDP", name: "Estado", description: "Estado de pago del documento de pago (Pendiente,Cancelado,Nulo)", visible: false },
            { field: "REFANTI", name: "Referencia", visible: false },
            { field: "ARCHIRSD", name: "ARCHIRSD", visible: false },
            { field: "IDRSD", name: "IDRSD", visible: false }
        ]
        $scope.apiPago = {}
        $scope.pasoPago = { data: [] };
        $scope.traePago = function (query) {
            return ws(
                // Servicio consulta servidor
                pagos.get, 
                // Parámetros de consulta
                {
                    fields: $scope.metaPago.map(m => m.field),
                    koen: $scope.pasoEntidad.map(e => e.KOEN),
                    empresa: rndEmpresa.get(),
                    variante: 'simple',
                    size: 10,
                    order: 'FEEMDP'
                },
                // Variable donde quedan los resultados
                $scope.pasoPago,
                // Funciones a ejecutar cuando se reciban los datos
                [
                    onReload, // Tandem de función (calcula, crea cruce)
                    clickRow($scope.apiPago, 0) // Simula seleccionar primera línea con el mouse
                ]);
        };

        /** Trae DEUDA */
        $scope.metaDeuda = [
            { field: "IDMAEEDO", name: "IDMAEEDO", visible: false, pk: true },
            { field: "EMPRESA", name: "Emp.", description: "Empresa", visible: false },
            { field: "TIDO", name: "DP", description: "Tipo documento", visible: true, length: '3' },
            { field: "NUDO", name: "Número", visible: true, length: '10' },
            { field: "SUENDO", name: "Suc.", visible: false },
            { field: "TIMODO", name: "Timodo", visible: false },
            { field: "TAMODO", name: "Tamodo", visible: false },
            { field: "ESPGDO", name: "Estado doc.", visible: false, length: '1', datatype: 'rtabla', tabla: 'EstadoPago', options: { returnSrv: "id", returnClient: "name" } },
            { field: "FEULVEDO", name: "Fecha venc.", visible: true, length: '8', datatype: 'date' },
            { field: "MODO", name: "M", description: "Moneda", length: '1', visible: true },
            { field: "VABRDO", name: "Valor doc.", visible: true, length: '10', datatype: 'number' },
            { field: "VAABDO", name: "Saldo ant.", visible: true, length: '10', datatype: 'number' },
            { field: "VAIVARET", name: "Valor IVA ret.", visible: false, datatype: 'number' },
            { field: "VAIVDO", name: "Valor IVA doc.", visible: false, datatype: 'number' },
            { field: "VANEDO", name: "Valor neto doc.", visible: false, datatype: 'number' },
            { field: "BLOQUEAPAG", name: "Bloquea pago", visible: false },
            { field: "ASIGEDO", name: "Abono", visible: true, length: '10', datatype: 'number' },
            { field: "SALDOEDO", name: "Saldo", visible: true, length: '10', datatype: 'number' }
        ]
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
        $scope.metaCruce = [
            { field: "IDMAEDPCE", name: "IDMAEDPCE", visible: false, readOnly: true, pk: true },
            { field: "TIDP", name: "TD", description: "Tipo documento", readOnly: true, length: '1', visible: true },
            { field: "NUDP", name: "Número", description: "Número documento de pago", length: '10', readOnly: true, visible: true },
            { field: "SALDODP", name: "Saldo pago.", datatype: 'number', length: '10', readOnly: true, visible: true },
            { field: "IDMAEEDO", name: "IDMAEEDO", visible: false, readOnly: true, pk: true },
            { field: "TIDO", name: "DP", description: "Tipo documento", length: '3', readOnly: true, visible: true },
            { field: "NUDO", name: "Número", readOnly: true, visible: true, length: '10' },
            { field: "SALDOEDO", name: "Saldo doc.", datatype: 'number', readOnly: true, visible: true, length: '10' },
            { field: "MAXASIG", name: "Máximo asignable", datatype: 'currency', readOnly: true, visible: true, length: '10', onClick: asignaMaximo },
            { field: "ASIGNADO", name: "Asignado", visible: true, datatype: 'number', length: '10', validations: [valida] },
        ]
        $scope.apiCruce = {}
        $scope.pasoCruce = { data: [] }


        /* Constantes */
        $scope.rtablas = {
            TipoEntidad: { data: [{ id: "A", name: "Ambos" }, { id: "P", name: "Proveedor" }, { id: "C", name: "Cliente" }] },
            EstadoPago: { data: [{ id: "P", name: "Pendiente" }] },
            FormasDePago: {
                data: [
                    { 'TIDPEN': 'EF', 'codigo': 'EFV', 'nombre': 'EFECTIVO' },
                    { 'TIDPEN': 'CH', 'codigo': 'CHV', 'nombre': 'CHEQUE BANCARIO' },
                    { 'TIDPEN': 'TJ', 'codigo': 'TJV', 'nombre': 'TARJETA DE CREDITO' },
                    { 'TIDPEN': 'LT', 'codigo': 'LTV', 'nombre': 'LETRA DE CAMBIO' },
                    { 'TIDPEN': 'PA', 'codigo': 'PAV', 'nombre': 'PAGARE DE CREDITO' },
                    { 'TIDPEN': 'DE', 'codigo': 'DEP', 'nombre': 'PAGO POR DEPOSITO' },
                    { 'TIDPEN': 'AT', 'codigo': 'ATB', 'nombre': 'TRANSFERENCIA BANCARIA' }
                ]
            }
        };


        /* Lógica */

        // Si cambia entidad volver a cargar deuda y pagos
        $scope.$watch('pasoEntidad', function (n, o) {
            if (!n.length) return;
            $scope.traePago();
            $scope.traeDeuda();
        }, true);

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
            //console.log("cambio pago", x);
            //calcula();
            //onReload();
            //var fn=clickRow($scope.apiPago, 0);//($scope.pasoPago);
            // if (!$scope.pasoPago.data[$scope.pasoPago.data.length-1].isSelected){
            //  fn($scope.pasoPago);
            //}
        }
        function goToPage(api){
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
                    var obj = {}

                    // buscar entre los existentes
                    var ix = pasoCruce.findIndex(o => (o.$pago === p && o.$deuda === d));
                    if (ix >= 0) {
                        // Si el cruce existe insertar al array
                        obj = pasoCruce[ix];
                    } else {
                        // Si el cruce no existe, crear uno nuevo

                        angular.extend(obj, p, d);

                        // agregar referencias a objetos pago y deuda originales
                        obj.$pago = p;
                        obj.$deuda = d;

                        // agregar propiedades de diálogo, 
                        obj.$estado = { $isOpen: true }
                        obj.ASIGNADO = 0; // inicializar en 0 la asignación
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

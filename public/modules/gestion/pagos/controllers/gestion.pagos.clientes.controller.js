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
        ]
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
            { field: "TIDP", name: "TD", description: "Tipo documento", visible: true },
            { field: "NUDP", name: "Número", description: "Número documento de pago", visible: false },
            { field: "ENDP", name: "Entidad", description: "Entidad documento de pago", visible: false },
            { field: "EMDP", name: "Emisor", description: "Emisor documento de pago (banco)", visible: false },
            { field: "SUEMDP", name: "Sucursal", description: "Plaza", visible: false },
            { field: "CUDP", name: "Cuenta", description: "Cuenta de banco", visible: false },
            { field: "NUCUDP", name: "Número", description: "Número de cheque o transferencia", visible: true },
            { field: "FEEMDP", name: "F. Emisión", visible: true, datatype: 'date' },
            { field: "FEVEDP", name: "F. Vencim.", visible: true, datatype: 'date' },
            { field: "MODP", name: "M", description: "Moneda", visible: true },
            { field: "TIMODP", name: "Tipo moneda", description: "Nacional (N) o extranjera (E)", visible: false },
            { field: "TAMODP", name: "Tasa de cambio", visible: false },
            { field: "VADP", name: "Monto", visible: true, datatype: 'number' },
            { field: "VAABDP", name: "Abono", description: "Valor abonado al documento de pago", visible: false, datatype: 'number' },
            { field: "VAASDP", name: "Asignado", description: "Valor asignado a otros documentos", visible: true, datatype: 'number' },
            { field: "SALDO", name: "Disponible", description: "Disponible sin asignar", visible: true, datatype: 'number' },
            { field: "ASIG", name: "Asignado nuevo", description: "Valor asignado nuevo", visible: true, datatype: 'number' },
            { field: "VAVUDP", name: "Vuelto", description: "Vuelto", visible: false, datatype: 'number' },
            { field: "ESPGDP", name: "Estado", description: "Estado de pago del documento de pago (Pendiente,Cancelado,Nulo)", visible: false },
            { field: "REFANTI", name: "Referencia", visible: false },
            { field: "ARCHIRSD", name: "ARCHIRSD", visible: false },
            { field: "IDRSD", name: "IDRSD", visible: false }
        ]
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
        $scope.metaDeuda = [
            { field: "IDMAEEDO", name: "IDMAEEDO", visible: false, pk: true },
            { field: "EMPRESA", name: "Emp.", description: "Empresa", visible: false },
            { field: "TIDO", name: "DP", description: "Tipo documento", visible: true },
            { field: "NUDO", name: "Número", visible: true },
            { field: "SUENDO", name: "Suc.", visible: false },
            { field: "TIMODO", name: "Timodo", visible: false },
            { field: "TAMODO", name: "Tamodo", visible: false },
            { field: "ESPGDO", name: "Estado doc.", visible: true, datatype: 'rtabla', tabla: 'EstadoPago', options: { returnSrv: "id", returnClient: "name" } },
            { field: "FEULVEDO", name: "Fecha venc.", visible: true, datatype: 'date' },
            { field: "MODO", name: "M", description: "Moneda", visible: true },
            { field: "VABRDO", name: "Valor doc.", visible: true, datatype: 'number' },
            { field: "VAABDO", name: "Saldo ant.", visible: true, datatype: 'number' },
            { field: "VAIVARET", name: "Valor IVA ret.", visible: false, datatype: 'number' },
            { field: "VAIVDO", name: "Valor IVA doc.", visible: false, datatype: 'number' },
            { field: "VANEDO", name: "Valor neto doc.", visible: false, datatype: 'number' },
            { field: "BLOQUEAPAG", name: "Bloquea pago", visible: false },
            { field: "ASIG", name: "Pagandose", visible: true, datatype: 'number' }
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
            { field: "TIDP", name: "TD", description: "Tipo documento", readOnly: true, visible: true },
            { field: "NUDP", name: "Número", description: "Número documento de pago", readOnly: true, visible: true },
            { field: "IDMAEEDO", name: "IDMAEEDO", visible: false, readOnly: true, pk: true },
            { field: "TIDO", name: "DP", description: "Tipo documento", readOnly: true, visible: true },
            { field: "NUDO", name: "Número", readOnly: true, visible: true },
            { field: "ASIGNADO", name: "Asignado", visible: true, datatype: 'number' },
        ]
        $scope.pasoCruce = { data: [] }


        /* Constantes */
        $scope.rtablas = {
            TipoEntidad: { data: [{ id: "A", name: "Ambos" }, { id: "P", name: "Proveedor" }, { id: "C", name: "Cliente" }] },
            EstadoPago: { data: [{ id: "P", name: "Pendiente" }] }
        }

        /* Lógica */

        /** Función a llamar cuando se traen nuevos datos del servidor. Tareas:
         * crear pasoCruce, calculaSaldos, selecciona primera fila
         */
        function onReload() {
            creaPasoCruce();
            calculaSaldos();
        }
        
        /** Función que dada una api (de rndSmtable) y un número de línea, ejecuta un click usando la api*/
        function clickRow(api, row) {
            return function (res) {
                if (res.data[0]) api.clickRow(row);
            }
        }

        /** Esta función guarda en pasoCruce una matriz que es el cruce de 
         * pasoPagos y pasoDeuda y guarda el dato de abono */
        function creaPasoCruce(res) {

            // Inicializar variables
            var cruce = [];

            // recorrer pasoPago y pasoDeuda
            $scope.pasoPago.data.forEach(function (p) {
                $scope.pasoDeuda.data.forEach(function (d) {
                    var obj = {}

                    // Combinar pago y deuda en un objeto
                    angular.extend(obj, p, d);

                    // agregar referencias a objetos pago y deuda originales
                    obj.$pago = p;
                    obj.$deuda = d;

                    // agregar propiedades de diálogo, 
                    obj.$estado = { $isOpen: true }
                    obj.ASIGNADO = 0; // inicializar en 0 la asignación

                    // insertar al array
                    cruce.push(obj);
                })
            });

            // actualizar el paso cruce
            $scope.pasoCruce.data = cruce
        }

        /** Función que actualiza los saldos en pasoDeuda, pasoPago y pasoCruce */
        function calculaSaldos(newVal, oldVal, linea, Data, rowIx, key, column) {
            calculaDeuda();
            calculaPagos();
        }
        $scope.onChange = calculaSaldos;

        /** Calcular la suma de asignaciones para cada pago */
        function calculaPagos() {
            $scope.pasoPago.data.forEach(function (d) {
                d.ASIG = $scope.pasoCruce.data
                    .filter(c => c.$pago === d)
                    .reduce(function (total, cruce) {
                        return total += (cruce.ASIGNADO || 0);
                    }, 0);
                d.SALDO = d.VADP - d.VAASDP - d.ASIG;
            })
        }

        /** Calcular la suma de asignaciones para cada documento */
        function calculaDeuda() {
            $scope.pasoDeuda.data.forEach(function (d) {
                d.ASIG = $scope.pasoCruce.data
                    .filter(c => c.$deuda === d)
                    .reduce(function (total, cruce) {
                        return total += (cruce.ASIGNADO || 0);
                    }, 0);
            })
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

        // Si cambia entidad volver a cargar deuda y pagos
        $scope.$watch('pasoEntidad', function (n, o) {
            if (!n.length) return;
            $scope.traePago();
            $scope.traeDeuda();
        }, true);

    }
])

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
            { field: "NUDP", name: "Número", description: "Número documento de pago", visible: true },
            { field: "ENDP", name: "Entidad", description: "Entidad documento de pago", visible: false },
            { field: "EMDP", name: "Emisor", description: "Emisor documento de pago (banco)", visible: false },
            { field: "SUEMDP", name: "Sucursal", description: "Plaza", visible: false },
            { field: "CUDP", name: "Cuenta", description: "Cuenta de banco", visible: false },
            { field: "NUCUDP", name: "Número documento", description: "Número del cheque", visible: false },
            { field: "FEEMDP", name: "Emisión", visible: true, datatype: 'date' },
            { field: "FEVEDP", name: "Vencimiento", visible: true, datatype: 'date' },
            { field: "MODP", name: "M", description: "Moneda", visible: true },
            { field: "TIMODP", name: "Tipo moneda", description: "Nacional (N) o extranjera (E)", visible: false },
            { field: "TAMODP", name: "Tasa de cambio", visible: false },
            { field: "VADP", name: "Monto", visible: true, datatype: 'number' },
            { field: "VAABDP", name: "Abono", description: "Valor abonado al documento de pago", visible: false, datatype: 'number' },
            { field: "VAASDP", name: "Asignado", description: "Valor asignado a otros documentos", visible: true, datatype: 'number' },
            { field: "VAVUDP", name: "Vuelto", description: "Vuelto", visible: true, datatype: 'number' },
            { field: "ESPGDP", name: "Estado", description: "Estado de pago del documento de pago (Pendiente,Cancelado,Nulo)", visible: false },
            { field: "REFANTI", name: "Referencia", visible: true },
            { field: "ARCHIRSD", name: "ARCHIRSD", visible: false },
            { field: "IDRSD", name: "IDRSD", visible: false }
        ]
        $scope.apiPago = {}
        $scope.pasoPago = {};
        $scope.traePago = function (query) {
            return ws(pagos.get, {
                fields: $scope.metaPago.map(m => m.field),
                koen: $scope.pasoEntidad.map(e => e.KOEN),
                empresa: rndEmpresa.get(),
                variante: 'simple',
                size: 10,
                order: 'FEEMDP'
            }, $scope.pasoPago);
        };


        /** Trae DEUDA */
        $scope.metaDeuda = [
            { field: "IDMAEEDO", name: "IDMAEEDO", visible: false, pk: true },
            { field: "EMPRESA", name: "Emp.", description: "Empresa", visible: true },
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
            { field: "BLOQUEAPAG", name: "Bloquea pago", visible: false }
        ]
        $scope.apiDeuda = {}
        $scope.pasoDeuda = {};
        $scope.traeDeuda = function (query) {
            return documentos.traeDeuda.get({
                fields: $scope.metaDeuda.map(m => m.field),
                koen: $scope.pasoEntidad.map(e => e.KOEN),
                empresa: rndEmpresa.get(),
                size: 10,
                order: 'FEULVEDO'
            }, $scope.pasoDeuda);
        }

        /* Constantes */
        $scope.rtablas = {
            TipoEntidad: { data: [{ id: "A", name: "Ambos" }, { id: "P", name: "Proveedor" }, { id: "C", name: "Cliente" }] },
            EstadoPago: { data: [{ id: "P", name: "Pendiente" }] }
        }

        /* Cruce pagos */



        /** Lógica */
        // Si cambia entidad volver a cargar deuda y pagos
        $scope.$watch('pasoEntidad', function (n, o) {
            $scope.apiPago.reload ? $scope.apiPago.reload() : '';
            $scope.apiDeuda.reload ? $scope.apiDeuda.reload() : '';
        }, true);


    }
])

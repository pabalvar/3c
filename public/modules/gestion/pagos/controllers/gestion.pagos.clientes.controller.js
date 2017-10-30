'use strict';
angular.module('gestion').controller('gestionPagosClientesController', ['$scope', 'entidades', 'pagos', 'documentos', 'rndEmpresa',
    function ($scope, entidades, pagos, documentos, rndEmpresa) {

        /** Trae ENTIDAD **/
        $scope.metaEntidad = [
            { field: "NOKOEN", name: "Nombre", visible: true, datatype: 'string:capitalize' },
            { field: "KOEN", name: "Código", visible: true, pk: true },
            { field: "TIEN", name: "Tipo", visible: true, datatype: 'rtabla', tabla: 'TipoEntidad', options: { returnSrv: "id", returnClient: "name" } },
            { field: "SUEN", name: "Suc.", visible: true, pk: true }
        ]
        $scope.rtablas = {
            TipoEntidad: { data: [{ id: "A", name: "Ambos" }, { id: "P", name: "Proveedor" }, { id: "C", name: "Cliente" }] },
            EstadoPago: { data: [{ id: "P", name: "Pendiente" }] }

        }
        $scope.pasoEntidad = [];
        $scope.traeEntidad = (query) => entidades.get({ fields: $scope.metaEntidad.map(m => m.field), search: query.search, size: 10, order: 'NOKOEN' });

        /** Trae PAGO */
        $scope.metaPago = [
            { field: "IDMAEDPCE", name: "IDMAEDPCE", visible: false, pk: true },
            { field: "EMPRESA", name: "Empresa", visible: false },
            { field: "TIDP", name: "TD", description: "Tipo documento", visible: true },
            { field: "NUDP", name: "Número", visible: true },
            { field: "ENDP", name: "Emisor", visible: false },
            { field: "EMDP", name: "Modo", visible: false },
            { field: "SUEMDP", name: "Sucursal", visible: false },
            { field: "CUDP", name: "Cudp", visible: false },
            { field: "NUCUDP", name: "NUCUDP", visible: false },
            { field: "FEEMDP", name: "Emisión", visible: true, datatype: 'date' },
            { field: "FEVEDP", name: "Vence", visible: true, datatype: 'date' },
            { field: "MODP", name: "M", description: "Moneda", visible: true },
            { field: "TIMODP", name: "Tipo moneda", visible: false },
            { field: "TAMODP", name: "Tamodp", visible: false },
            { field: "VADP", name: "Monto", visible: true, datatype: 'number' },
            { field: "VAABDP", name: "Abono", visible: false, datatype: 'number' },
            { field: "VAASDP", name: "Asignado", visible: true, datatype: 'number' },
            { field: "VAVUDP", name: "Saldo", visible: true, datatype: 'number' },
            { field: "ESPGDP", name: "ESPGDP", visible: false },
            { field: "REFANTI", name: "Referencia", visible: true },
            { field: "ARCHIRSD", name: "ARCHIRSD", visible: false },
            { field: "IDRSD", name: "IDRSD", visible: false }
        ]
        $scope.pasoPago = [];
        $scope.traePago = (query) => pagos.get({ fields: $scope.metaPago.map(m => m.field), koen: $scope.pasoEntidad.map(e => e.KOEN),  empresa: rndEmpresa.get(), variante: 'simple', size: 10, order: 'FEEMDP' });
        $scope.apiPago = {} // Se llena con una funcion dummy

        /** Trae DEUDA */
        $scope.metaDeuda = [
            { field: "IDMAEEDO", name: "IDMAEEDO", visible: false, pk: true },
            { field: "EMPRESA", name: "Emp.", description:"Empresa", visible: true },
            { field: "TIDO", name: "DP", description:"Tipo documento", visible: true },
            { field: "NUDO", name: "Número", visible: true },
            { field: "SUENDO", name: "Suc.", visible: false },
            { field: "TIMODO", name: "Timodo", visible: false },
            { field: "TAMODO", name: "Tamodo", visible: false },
            { field: "ESPGDO", name: "Estado doc.", visible: true, datatype: 'rtabla', tabla: 'EstadoPago', options: { returnSrv: "id", returnClient: "name" } },
            { field: "FEULVEDO", name: "Fecha venc.", visible: true, datatype: 'date' },
            { field: "MODO", name: "M", description:"Moneda", visible: true },
            { field: "VABRDO", name: "Valor doc.", visible: true, datatype: 'number' },
            { field: "VAABDO", name: "Saldo ant.", visible: true, datatype: 'number' },
            { field: "VAIVARET", name: "Valor IVA ret.", visible: false, datatype: 'number' },
            { field: "VAIVDO", name: "Valor IVA doc.", visible: false, datatype: 'number' },
            { field: "VANEDO", name: "Valor neto doc.", visible: false, datatype: 'number' },
            { field: "BLOQUEAPAG", name: "Bloquea pago", visible: false }
        ]
        $scope.pasoDeuda = [];
        $scope.traeDeuda = (query) => documentos.traeDeuda.get({ fields: $scope.metaDeuda.map(m => m.field), koen: $scope.pasoEntidad.map(e => e.KOEN), empresa: rndEmpresa.get(), size: 10, order: 'FEULVEDO' });
        $scope.apiDeuda = {} // Se llena con una funcion dummy

        /** Lógica */
        //$scope.$watch('pasoEntidad', () => $scope.apiPago.reload ? $scope.apiPago.reload() : '', true);
        $scope.$watch('pasoEntidad', function(n,o){ 
            console.log("cambio", n,o);
            $scope.apiPago.reload ? $scope.apiPago.reload():console.log("no hice na Pagos");
            $scope.apiDeuda.reload ? $scope.apiDeuda.reload():console.log("no hice na Deuda");
        }, true)
    }
])

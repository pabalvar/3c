'use strict';
angular.module('gestion').controller('gestionPagosClientesController', ['$scope', 'entidades', 'buscar', 'documentos',
    function ($scope, entidades, buscar, documentos) {

        /** Selección de Entidad **/
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

        /** Selección de Deuda */
        $scope.metaDeuda = [
            { field: "IDMAEEDO", name: "IDMAEEDO", visible: false, pk: true },
            { field: "EMPRESA", name: "Empresa", visible: true },
            { field: "TIDO", name: "Tipo Doc.", visible: true },
            { field: "NUDO", name: "Número", visible: true },
            { field: "SUENDO", name: "Suc.", visible: false },
            { field: "MODO", name: "Modo", visible: false },
            { field: "TIMODO", name: "Moneda", visible: true },
            { field: "TAMODO", name: "Tamodo", visible: false },
            { field: "ESPGDO", name: "Estado doc.", visible: true , datatype: 'rtabla', tabla: 'EstadoPago', options: { returnSrv: "id", returnClient: "name" } },
            { field: "FEULVEDO", name: "Fecha venc.", visible: true, datatype: 'date' },
            { field: "VABRDO", name: "Valor doc.", visible: true, datatype: 'number' },
            { field: "VAABDO", name: "Saldo ant.", visible: true, datatype: 'number' },
            { field: "VAIVARET", name: "Valor IVA ret.", visible: false, datatype: 'number' },
            { field: "VAIVDO", name: "Valor IVA doc.", visible: false, datatype: 'number' },
            { field: "VANEDO", name: "Valor neto doc.", visible: false, datatype: 'number' },
            { field: "BLOQUEAPAG", name: "Bloquea pago", visible: false }
        ]
        $scope.pasoDeuda = [];
        $scope.traeDeuda = (query) => documentos.traeDeuda.get({ fields: $scope.metaDeuda.map(m => m.field), koen: $scope.pasoEntidad.map(e => e.KOEN), size: 10, order: 'FEULVEDO' });
        $scope.apiDeuda = {} // Se llena con una funcion dummy

        /** Si cambia la entidad seleccionada llamar a traedeuda */
        $scope.$watch('pasoEntidad', () => $scope.apiDeuda.reload ? $scope.apiDeuda.reload() : '', true);
    }
])

        /*
        // { field: '$estado', visible: true, name: '*', datatype: 'dialog', readOnly: true, onInit: rndORM.createEstado },
        var modeloDeuda = [
            { field: "IDMAEEDO", name: "IDMAEEDO", pk: true, visible: true, readOnly: true },
            { field: "EMPRESA", name: "Empresa", visible: true, readOnly: true },
            { field: "TIDO", name: "DP", visible: true, readOnly: true },
            { field: "NUDO", name: "Número", visible: true, readOnly: true, },
            { field: "VABRDO", name: "Valor documento", visible: true, readOnly: true, datatype: 'currency:CLP' },
            { field: "VAABDO", name: "Saldo", visible: true, readOnly: true, datatype: 'currency:CLP' },
        ]

        var modeloPago = [
            { field: "IDPAGO", name: "IDPAGO", pk: true, visible: true, readOnly: true, onInit: rndORM.newRandomString },
            { field: "TPAGO", name: "Tipo", visible: true },
            { field: "MONTO", name: "Monto", visible: true },
        ]

        }*/
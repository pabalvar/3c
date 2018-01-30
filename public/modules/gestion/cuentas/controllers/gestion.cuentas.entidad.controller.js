angular.module('gestion')

    .controller('gestionCuentasEntidadController', ['$scope', '$uibModalInstance', 'params', 'ws', 'cuentas', 'rndDialog','focus', 
    function ($scope, $uibModalInstance, params, ws, cuentas, rndDialog, focus) {
        // Agregar la lista de bancos
        params.embed = 'entidadesPago'

        // Trae Cuentas 
        $scope.metaCuentas = metaCuentas();
        $scope.metaCuentas.data.$estado.visible = true;
        $scope.apiCuentas = {}
        $scope.pasoCuentas = { data: [] };
        $scope.traeCuentas = traeCuentas;
        function traeCuentas() {
            return ws(cuentas.get, params, $scope.pasoCuentas, [bindMeta, focusOnTable]);
        };

        /** Lógica **/
        function focusOnTable(){
            console.log("haciendo focus en cuentas", $scope.apiCuentas.id)
            focus($scope.apiCuentas)
        }
        // Si viene params, llamar al servicio
        if (params) traeCuentas();

        function metaCuentas() {
            return {
                //entidadesPago: function(){return $scope.pasoCuentas.entidadesPago},
                data: rndDialog.initMeta([
                    { field: "KOEN", name: "Código entidad", visible: false, fk: "MAEEN.KOEN" },
                    { field: "TIPOPAGO", name: "Tipo pago", visible: false, fk: "TABENDP.TIDPEN", readOnly:true, onInit:()=>params.tidp },
                    { field: "EMISOR", name: "Emisor", visible: true, fk: "TABENDP.KOENDP", length: "20", datatype: 'lookup', tabla: 'entidadesPago', options: { returnSrv: "KOENDP", returnClient: "NOKOENDP" } },
                    { field: "SUCURSAL", name: "Sucursal", visible: false, fk: "TABENDP.SUENDP" },
                    { field: "CUENTA", name: "Número de cuenta", visible: true, length: "10" },
                    { field: "RUT", name: "RUT titular", visible: true, length: "10" },
                    { field: "NORUT", name: "Nombre titular", visible: true, length: "20" },
                    { field: "BLOQUEADA", name: "Bloqueada", visible: true, datatype: 'boolean', length: "3" },
                ])
            }
        }
        // Función que anida metadatas porque viene en los datos
        function bindMeta() {
            $scope.metaCuentas.entidadesPago = $scope.pasoCuentas.entidadesPago;
        }


        // Funciones de scope
        this.ok = close;

        // Detalles de implementación
        function close() {
            $uibModalInstance.close(params);
        }


    }])

    .service('gestionCuentasEntidadModal', [
        function () {
            return function (params) {
                return {
                    templateUrl: 'modules/gestion/cuentas/views/gestion.cuentas.entidad.html',//'myModalContent.html',
                    controller: 'gestionCuentasEntidadController',
                    controllerAs: '$ctrl',
                    resolve: { params: () => params }
                }
            }

        }])
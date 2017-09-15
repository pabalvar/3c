'use strict';
angular.module('gestion').controller('gestionPagosClientesController', ['$scope','entidades',
    function ($scope,entidades) {   

        $scope.$watch('search_input', reload); //Usado para forzar reload

        function getEntidadesCallback(res){
            console.log("llegó", res);
            $scope.pasoEntidades = res.data;
        }
        function onError(err){
            console.error("error:", err);
        }

        function reload(v){
           // if (!v) return;
            var params = {search:v, size:3, order:'NOKOEN'}
            entidades.get(params,getEntidadesCallback,onError);
        }

        
    }
])

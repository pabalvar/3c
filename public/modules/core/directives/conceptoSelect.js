'use strict';
angular.module("core")

.directive("rndConceptoSelect", function() {
    return {
        restrict: 'E',
        scope: {
            output: "=",
            load: "="
        },
        templateUrl: 'modules/core/directives/conceptoSelect.html',
        controller: 'rndConceptoSelectCtlr'
    }
})
.controller("rndConceptoSelectCtlr",['$timeout', '$window', 'WS', 'rndAlerts', 'conceptoDef', '$scope', 
function($timeout, $window, WS,rndAlerts,conceptoDef, $scope){
// Bind Services to scope 
    var ws = new WS($scope);
    var alert = new rndAlerts($scope,'AlertService');
    /** ITEMS Lista conceptos **/
    $scope.ITEMS = {
        onSelect : function ($item, $model, $label) {
            //console.log("selected", $item)
            
            // Insertar si no existe
            var idx= $scope.output.selected.findIndex(o => o.KOCO == $item.KOCO)
            if (idx<0) $scope.output.selected.push($item);
          
            var selectInputText = function()
            {
                $window.document.getElementById("inputy").select();
                var x = $window.document.getElementById("inputy");
                x.value = '';
            }
            $timeout(selectInputText)
        },
        onRemove : function(ix){
            $scope.output.selected.splice(ix, 1);
        },
        input:'',
        get: function(){
            ws(conceptoDef.get,{tipoclase:'E',fields:['CLASE','KOCO','NOKOCO']},'ConceptosListWS', function(request) {
                    // Parsear respuesta, generar alarma de error si corresponde
                    alert.parse(request);
                    
                    // Concatenar todas las clases para filtro combo
                    var clases = {};
                    
                    // Concatenar campos para hacer filtro typeahead
                    request.data.forEach(function(i){
                        i.clave = i.KOCO+i.NOKOCO+i.CLASE; // typeahead
                        if (!clases[i.CLASE]) {
                            clases[i.CLASE]=true;
                        }
                        $scope.ITEMS.clases = [''];
                        for (var key in clases){
                           $scope.ITEMS.clases.push(key);  
                        }  
                    });
                    $scope.ITEMS.selectedClase = '';
                    $scope.ITEMS.list = request.data;
                    $scope.output.list = request.data; // exportar datos 
                }, alert.parse);
        }
    }
    var selectConceptos = function(conceptos, oldValue){
        //console.log("change selecConcepto",conceptos);
        if (! (((conceptos||{}).list)||[]).length) return
        //imponer selección con los conceptos que se tienen
        $scope.output.selected.length = 0;
        $scope.output.selected = $scope.ITEMS.list.filter(i => conceptos.list.indexOf(i.KOCO)>=0)
        if ($scope.output.selected[0]) $scope.output.selected[0].ssrc = Math.random();
    }
    $scope.$watch('load',selectConceptos, true);

    $scope.ITEMS.get();
}])
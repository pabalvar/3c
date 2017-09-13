'use strict';
angular.module("core")

    .directive("rrhhContratosFilter", function () {
        return {
            restrict: 'E',
            scope: {
                servicio: '='
            },
            templateUrl: 'modules/RRHH/contratos/directives/rrhh.directive.contratos.filter.html',
            controller: function ($scope, $timeout) {
               
                // Servicios
                var servicio = $scope.servicio;

                //Visible en la vista
                $scope.showSearchBar = false;
                $scope.concepto = {}  
                $scope.onTagAdding = onTagAdding; //Accion: Input del ngTags
                $scope.onTagRemoving = onTagRemoving; // Accion: click en X del tag    
                $scope.onItemClick = onItemClick; //Accion: Click en opción de la lista
                $scope.fFilters = servicio.factoryFilters; // Factory filters
                $scope.tags = servicio.getTags()||[]; // inicializar con un modelo estático o con servicio global servicio

                // Watcher
                $scope.$watch('concepto', onAddConcepto, true);
                $scope.$watch('servicio', redraw, true);

                // Detalles de implementación
                var genID = (f => Math.floor((Math.random() * 1000000) + 1));

                /* Convierte una entrada de texto en formato Tag */
                function group_object(tag) {
                    var ret = {};
                    var param, value, match;

                    // Si el tag es del tipo xx:yy, crear grupo xx
                    if (match = tag.name.match(/^(\w+):(.+)/)) {
                        param = match[1];
                        value = match[2];

                        // Reglas especiales
                        if (param.match(/contrato|kocon/i)) param = 'kocon';// si param es "contrato" o "kocon" pasar a contrato
                        else if (param.match(/rut/i)) param = 'rut';// si param es "contrato" o "kocon" pasar a contrato
                    } else if (match = tag.name.match(/^(rut|contrato|kocon)\s(.+)/i)) {
                        param = match[1];
                        value = match[2];

                        // Reglas especiales
                        if (param.match(/contrato|kocon/i)) param = 'kocon';// si param es "contrato" o "kocon" pasar a contrato
                        else if (param.match(/rut/i)) param = 'rut';// si param es "contrato" o "kocon" pasar a contrato

                        // Si el primer tag es uuid
                    } else if (tag.name.match(/^([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}(?:\,|\s)*)+$/i)) {
                        param = 'uuid';// si param es un uuid (i.e. identificador único global xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx)
                        // Si el primer tag es un rut
                    } else if (tag.name.match(/([0-9]{6,8}-[kK0-9]{1}(?:\,|\s)*)+$/i)) {
                        param = 'rut';
                    }

                    // Asignar valores a la salida
                    ret.type = 'free_text';
                    ret.data = typeof (value) != 'undefined' ? value : tag.name;
                    ret.param = typeof (param) != 'undefined' ? param : 'any';

                    return ret;
                };


                // Acción: nuevo filtro avanzado concepto
                function onAddConcepto(val) {
                    if (val.obj) $scope.tags = servicio.manageTags({ type: 'clase', param: val.obj.concepto + '_' + genID(), data: val.obj, icon: 'fa fa-cube', name: val.obj.name }, true);
                }
                
                function onTagRemoving(tag) {
                    // Desticar elementos del filtro predeterminado
                    $scope.fFilters.forEach(function (o) {
                        if (o.param == tag.param)
                            o.showCheck = false;
                    });
                    $scope.tags = servicio.manageTags(tag, false, true);
                };
                
                function onTagAdding(input, scope) {
                    $scope.tags = servicio.manageTags(group_object(input), true);

                    //Borro el texto actual escrito
                    scope.customText = '';
                    return false;
                };
                
                function onItemClick(input) {
                    // Toggle elemento del filtro predeterminado
                    input.showCheck = !input.showCheck;
                    $scope.tags = servicio.manageTags(input, input.showCheck);
                };

                function redraw(){
                    //console.log("redrawing contratos.filter")
                    $scope.tags = servicio.manageTags({},false);
                }

            }
        }
    })


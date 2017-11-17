
'use strict';
angular.module("core")
    .service('rndORM', ['rndUuid', function (rndUuid) {

        var vm = {
            createObject: createObject,
            createEstado: createEstado,
            newUuid: newUuid,
            newString: newString,
            newRandomString: newRandomString,
            newDate, newDate
        };

        function initByType(meta, rtablas) {
            var ret;
            switch (meta.datatype) {
                case 'rtabla':
                    var tabla = rtablas[meta.tabla].data;
                    // Inicializar como la primera opción
                    ret = tabla[0][meta.options.returnSrv];
                    break;
                case 'number':
                    ret = 0;
                    break;
                case 'date':
                    ret = newDate()();
                    break;
                default:
                    ret = '';
                    break;
            }
            return ret;

        }
        function createObject(model, input, rtablas) {

            // Crear objeto a partir de rutina de inicialización de metadato
            var obj = model.reduce(function (t, m) {
                // si tiene función onInit llamarla
                if (m.onInit) {
                    t[m.field] = m.onInit();
                } else {
                    // Si no, inicializar el constructor por defecto del tipo
                    t[m.field] = initByType(m, rtablas);

                }
                return t
            }, {});

            // Agregar datos adicionales si vienen
            if (input) {
                angular.extend(obj, input);
            }
            return obj;
        }

        function createEstado() {
            return {
                $action: 'N',
                $isOpen: true
            }
        }

        function newUuid() {
            return rndUuid();
        }
        function newString(input) {
            return function () {
                var ret = '';
                if (typeof (input) != 'undefined') ret = input;
                return ret;
            }
        }
        function newRandomString(input) {
            return function () {
                var ret = '';
                var prefix = 'ITEM';
                if (typeof (input) != 'undefined') prefix = input;
                ret = prefix + '_' + Math.floor(Math.random() * 1000);
                return ret;
            }
        }
        function newDate(input) {
            return function () {
                var ret = input;
                if (!input) ret = (new Date()).toISOString().substr(0, 10);
                return ret;
            }
        }
        return vm

    }]);



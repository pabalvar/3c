'use strict';
angular.module("core")

    .service("rndValidation", [function () {
        return compileValidations;

        function compileValidations(meta) {
            var validations = meta.validations || [];
            var ret = [];

            validations.forEach(function (v) {
                if (typeof (v) == 'function') {
                    ret.push(v);
                } else {
                    // Se asume objeto
                    for (var key in v) {
                        switch (key) {
                            case 'min':
                                ret.push(min(v[key]));
                        }
                        console.log("got this:", key);
                    }

                }
            });
            return ret;
        }

        function min(param) {
            return function (Data, rowIx, meta) {
                console.log("rndValidation#min")
                var l = Data.data[rowIx]; // alias para la línea
                var err = []; // estructura de errores

                // Validaciones
                if (l[meta.field] < param) err.push(`El valor ${meta.name} no puede ser menor que ${param}.`);
                var ret = err.length ? err.join(' ') : true;
                return ret;
            }
        }


    }])

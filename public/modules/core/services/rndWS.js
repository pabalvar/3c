angular.module('core')
    .factory('rndWS', function () {
        return function (resource) {
            var resource = resource;

            var m = {
                ajax: ajax,
                busy: false,
                $ready: false,
                $readylatch: false,
                res: undefined,
                getRtablas: getRtablas,
            }

            function ajax(method, params, thenFn, errorFn) {
                // Ignorar si está ocupado el servicio
                if (m.busy) {
                    console.warn("servicio ocupado. Ignora");
                    return
                }

                // Inicializar semáforos
                m.error = false;
                m.$ready = false;
                m.busy = true;

                // Ejecutar resource
                resource[method](params,
                    function (response, headers) {
                        // Asignar respuesta
                        m.res = response;

                        // Actualizar semáforos
                        m.busy = false;
                        m.$ready = (new Date()).valueOf();
                        m.$readylatch = m.$ready;

                        // Llamar a función OK
                        if (thenFn) {
                            if (typeof (thenFn) == 'function')
                                thenFn(response);
                            else // asume array
                                thenFn.forEach(function (f) { f(response) })
                        }
                    },
                    function (err) {
                        // Actualizar semáforos
                        m.busy = false;
                        m.$readylatch = 0;
                        m.error = err;

                        // Llamar a función NOK
                        if (errorFn) {
                            if (typeof (thenFn) == 'function')
                                errorFn(err);
                            else // asume array
                                errorFn.forEach(function (f) { f(err) })
                            // Si no hay función función NOK intentar función OK
                        } else if (thenFn) {
                            if (typeof (thenFn) == 'function')
                                thenFn(err);
                            else // asume array
                                thenFn.forEach(function (f) { f(err) })
                        }
                    }
                ); // resource
            }

            function getRtablas() {
                return m.res.rtablas;
            }

            return m;
        }
    })

    /* Version portable del semaforo. Debe existir objeto store */
    .service('ws', function () {
        return function (fn, params, store, thenFn, errorFn) {
            store = store || {};
            /* PAD: se comenta porque funciona con promesas
            if (store.busy) {
                console.warn("service is busy. Request ignored");
                return;
            }*/

            // semáforos: reiniciar error, y dejar busy
            if (store) {
                store.error = false;
                store.$ready = false;
                store.busy = true;
            }

            // Ejecutar petición
            return fn(params,

                // Callback (si éxito)
                function (res, headers) {
                    // Referenciar respuesta en store
                    angular.extend(store, res);

                    // semáforos: borrar busy y dejar ready en verdadero
                    store.busy = false;
                    store.$ready = (new Date()).valueOf();
                    store.$readylatch = store.$ready;

                    // Llamar función calback de usuario
                    if (thenFn) {
                        if (typeof (thenFn) == 'function')
                            thenFn(res);
                        else // asume array
                            thenFn.forEach(function (f) { f(res) })
                    }
                },

                // Callback (si error)
                function (err) {

                    // semáforos: borrar busy y dejar readylatch en falso
                    store.$readylatch = 0;
                    store.busy = false;
                    store.error = err;

                    // Llamar función calback de usuario
                    if (errorFn) {
                        if (typeof (errorFn) == 'function')
                            errorFn(err);
                        else // asume array
                            errorFn.forEach(function (f) { f(err) })
                        // Si no hay fn error, se llama la de success incluso en error
                    } else {
                        if (thenFn) {
                            if (typeof (thenFn) == 'function')
                                thenFn(err);
                            else // asume array
                                thenFn.forEach(function (f) { f(err) })
                        }
                    }
                }
            )
        }

    })


    /** administra semáforos para AJAX
     * error : última respuesta es error, no está busy
     * $ready : no hay error, no está busy, ultima respuesta es ok
     * $readylatch: ultima respuesta es ok (durante busy sigue igual)
     */
    .factory('WS', function () {
        return function (s) {
            return function (fn, params, store, thenFn, errorFn) {

                // Semaforos en s.storeWS
                s[store] = s[store] || {};
                s[store].error = false;
                s[store].$ready = false;

                if (s[store].busy) {
                    console.warn("service ", store, "is busy. Request ignored");
                    return;
                } else {
                    //console.log("service ", store, "triggered..."); 
                }
                s[store].busy = true;
                fn(params,
                    function (res, headers) {
                        s[store] = res;
                        s[store].busy = false;
                        s[store].$ready = (new Date()).valueOf();
                        s[store].$readylatch = s[store].$ready;
                        if (thenFn) {
                            if (typeof (thenFn) == 'function')
                                thenFn(res);
                            else // asume array
                                thenFn.forEach(function (f) { f(res) })
                        }
                    },
                    function (err) {
                        s[store].$readylatch = 0;
                        s[store].busy = false;
                        s[store].error = err;
                        if (errorFn) {
                            if (typeof (errorFn) == 'function')
                                errorFn(err);
                            else // asume array
                                errorFn.forEach(function (f) { f(err) })
                            // Si no hay fn error, se llama la de success incluso en error
                        } else {
                            if (thenFn) {
                                if (typeof (thenFn) == 'function')
                                    thenFn(err);
                                else // asume array
                                    thenFn.forEach(function (f) { f(err) })
                            }
                        }
                    }
                )
            }
        }
    });

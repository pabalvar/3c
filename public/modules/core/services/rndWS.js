'use strict'
/**
* @ngdoc service 
* @name core.service:ws 
* @scope
* @param {$resource} resource Objeto $resource para consulta AJAX a servidor
* @param {Object} params Objeto de parámetros a pasar a resource al hacer la consulta 
* @param {$rndResource} rndRes Objeto que guarda datos AJAX y semáforos
* @param {Array} rndRes.data Array con los datos retornados
* @param {Boolean} rndRes.busy (retorno) indica AJAX fue ejecutado y no ha resuelto 
* @param {Boolean} rndRes.$ready (retorno) Indica si ya ha resuelto sin errores y no está busy. Contiene Timestamp de la última resolución, se hace 0 cuando busy o error
* @param {Boolean} rndRes.$readylatch (retorno) True si ya ha resuelto, se mantiene true mientras es busy.
* @param {Object} rndRes.$offline (retorno) True si la última resoulción entregó error de servidor (http-50x) o no hay conexión
* @param {Object} rndRes.error (retorno) Contiene el error (si hay), si no, 0.
* @param {function|function[]=} callbackThen Función (o arreglo de funciones) a ejecutar cuando llegan los datos. El parámetro de ejecución son los datos recibidos. 
    Si no hay callbackCatch también se ejecuta esta función.
* @param {function|function[]=} callbackCatch Función (o arreglo de funciones) a ejecutar cuando llegan error. El parámetro de ejecución es el objeto error
* @description
* Servicio que administra semáforos en las consultas al servidor. Es un wrapper de $resouce
* @example
* <pre>   
  
// Objeto para guardar datos y semáforos
$scope.pasoPago = {data:[]};

// Función ejemplo para trabajar los datos
function onReload(res){
    // trabajar con datos res.data[]
} 

// Ejemplo de uso en una función que entrega un $resource pagos.get
$scope.traePago = function (query) {
    return ws(
        pagos.get, 
        {
            fields: $scope.metaPago.map(m => m.field),
            koen: $scope.pasoEntidad.map(e => e.KOEN),
            empresa: rndEmpresa.get(),
            variante: 'simple',
            size: 10,
            order: 'FEEMDP'
        }, 
        $scope.pasoPago, 
        [onReload, sumData],
        errorHandler
    );
};
</pre>
**/
angular.module('core')
    .service('ws', ['rndDialog', function (rndDialog) {
        return function (fn, params, store, thenFn, errorFn) {
            store = store || {};

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
                    store.$offline = false;

                    // Si viene el campo data, inicializar dialog
                    if (angular.isArray(store.data)){
                        rndDialog.initDataset(store);
                    }
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
                    store.$offline = (err.status == -1) ? true : false;// poner acá todos los errores tipo HTTP-500 (no los 40x)

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

    }])
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

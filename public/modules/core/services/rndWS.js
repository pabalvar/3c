angular.module('core')

/** administra semáforos para AJAX
 * error : última respuesta es error, no está busy
 * $ready : no hay error, no está busy, ultima respuesta es ok
 * $readylatch: ultima respuesta es ok (durante busy sigue igual)
 */
    .factory('WS', function () {
        return function (s) {
            var $scope = s;
            return function (fn, params, scope, thenFn, errorFn) {
                $scope[scope] = $scope[scope] || {};
                $scope[scope].error = false;
                $scope[scope].$ready = false;
                if ($scope[scope].busy){
                    console.warn("service ", scope, "is busy. Request ignored");
                    return;
                }else{
                   //console.log("service ", scope, "triggered..."); 
                }
                $scope[scope].busy = true;
                fn(params,
                    function (res, headers) {
                        $scope[scope] = res;
                        $scope[scope].busy = false;
                        $scope[scope].$ready = (new Date()).valueOf();
                        $scope[scope].$readylatch =  $scope[scope].$ready;
                        if (thenFn) {
                            if (typeof (thenFn) == 'function')
                                thenFn(res);
                            else // asume array
                                thenFn.forEach(function (f) { f(res) })
                        }
                    },
                    function (err) {
                        $scope[scope].$readylatch = 0;
                        $scope[scope].busy = false;
                        $scope[scope].error = err;
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

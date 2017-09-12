'use strict';

angular.module('core')

    .factory('rndAlerts', ['$timeout',
        function ($timeout) {
            return function (s, store) {
                function inPlaceReplace(str, obj) {
                    var ret = str;
                    var tokens = str.match(/{{\w+[^}]*}}/g);
                    tokens.forEach(function (t) {
                        //console.log("OBJE",obj)
                        var key = t.replace(/[{}]/g, '');
                        ret = ret.replace(t, obj[key]);
                    })
                    return ret;
                }
                var m = {};
                m.alerts = [];
                m.timers = [];
                var close = function (index, id) {
                    // Si no viene segundo parámetro, borrar todos
                    var cleanAll = true; //(typeof index == 'undefined' && typeof id == 'undefined') ? true : false;

                    // Cerrar las alertas
                    var i = m.alerts.length;
                    while (i--) {
                        if (id === m.alerts[i].id || cleanAll || i === index) {
                            m.alerts.splice(i, 1);
                        }
                    }

                }
                m.close = close;
                m.parse = function (r) {
                    var ret, out;
                    var outArr = [];

                    if (r.status) { // Error HTTP != 20x
                        if (r.data) { // error controlado (por ejemplo validación insert SQL)
                            if (r.data.type) { // error controlado
                                // Error en JSON desde servidor con la lista de registros con error
                                if ((r.data || {}).type == 'JSON_LIST') {
                                    // Parsear mensaje
                                    if (r.data.message) {
                                        // crear varios outs
                                        r.data.msgList = JSON.parse(r.data.message); // ToDo Try/catch
                                        r.data.msgList.forEach(function (m) { m.message = inPlaceReplace(m.message, m) });// reemplazar {{}} por variable
                                        outArr = r.data.msgList.map(o => ({ type: 'danger', msg: o.message, closeable: true }));
                                    } else {
                                        out = { type: 'danger', msg: r.data.message || r.statusText, closeable: true };
                                    }
                                } else {
                                    out = { type: 'danger', msg: r.data.message || r.statusText || 'error HTTP-' + r.status, closeable: true }
                                }
                            } else {
                                out = { type: 'danger', msg: r.data.message || r.statusText || 'error HTTP-' + r.status, closeable: true }
                            }
                        } else {
                            out = { type: 'danger', msg: (r.statusText || 'error conexión') + ' HTTP-' + (r.status || '???'), closeable: true };
                        }
                    } else { // error de aplicación 
                        if (r.object) {
                            if (r.object == 'status_insert') {
                                //  @err AS status,generic
                                out = { type: 'success', msg: 'Grabación exitosa. ' + 'Modificados: ' + r.updated + ', nuevos.' + r.created + '.', closeable: true };
                            } else if (r.object == 'status_create') {
                                //  @err AS status,@created as created
                                out = { type: 'success', msg: 'Creación exitosa. ' + 'Nuevos:' + r.created, closeable: true };
                            } else if (r.object == 'status_update') {
                                //  @err AS status,@updated as updated
                                out = { type: 'success', msg: 'Modificación exitosa. ' + 'Modificados: ' + r.updated + '.', closeable: true };
                            } else if (r.object == 'status_upsert') {
                                //  @err AS status,@created, @updated
                                out = { type: 'success', msg: 'Grabación exitosa. ' + 'Modificados: ' + r.updated + ', nuevos.' + r.created + '.', closeable: true };
                            } else if (r.object == 'status_delete') {
                                //  @err AS status,@deleted as deleted
                                out = { type: 'success', msg: 'Eliminación exitosa. ' + 'Eliminados: ' + r.deleted + '.', closeable: true };
                            } else if (r.object == 'list') {
                                // es un get
                            } else if (r.object == 'concepto_assign') {
                                // toDO evaluar cuando está mal
                            } else if (r.object == 'appMsg') {
                                // mensaje de aplicación
                                out = { type: r.type || 'danger', msg: r.msg || 'error de aplicación', closeable: true };

                            } else {
                                //console.log("unsupported object type:", r.object);
                            }
                        } else if (r.data) {
                            if (r.data[0]) {
                                if (r.data[0].STATUS) { // error de aplicación RRHH  
                                    if (r.data[0].STATUS == 'OK') {
                                        out = { type: 'success', msg: 'consulta exitosa', closeable: false };
                                    } else { // error de aplicación RRHH  
                                        var txt = '';
                                        r.data[0].STATUS.split(';').forEach(function (s) { // error viene en STATUS separado por ;
                                            if (s == 'ERROR_TRASLAPE')
                                                txt = 'Error al insertar nuevo valor. El concepto ingresado se traslapa en el tiempo con otro. Revise las fechas de inicio y término';
                                            else if (s == 'ERROR_EMIT')
                                                txt = 'No es posible modificar el concepto porque afecta liquidaciones emitidas';
                                        });
                                        out = { type: 'warning', msg: txt || r.data[0].STATUS || 'error aplicación', closeable: true };
                                    }
                                } else if (angular.isArray(r.data)) {
                                    // Do nothing should be successful get
                                } else {
                                    out = { type: 'warning', msg: r.data[0].STATUS || 'error aplicación', closeable: true };
                                }
                            } else if (r.data.items) {                    // eg. rtabla.getDetalle
                            }
                            else {
                                //console.log('consulta no entregó resultados');
                                out = { type: 'info', msg: 'consulta no entregó resultados', closeable: true };
                            }
                        } else if (r.concepto) {// caso concepto/funcionarios/new
                        } else if (r) {
                            //out = {type:'success',msg:r.STATUS||'error aplicación',closeable:true}; 
                            //console.log('consulta obj:',r);
                        }
                        else {            // Dato vacío
                            out = { type: 'warning', msg: 'respuesta vacía del servidor', closeable: true };
                        }
                    }

                    if (out) outArr.push(out);

                    if (outArr.length) {
                        outArr.forEach(function (out) {
                            out.timestamp = new Date();
                            out.id = Math.random();
                            m.alerts.push(out);
                        });

                    }
                    return ret;
                }

                return m;
            }
        }]);
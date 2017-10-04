'use strict';

var sql = require('mssql'),
    console = process.console,
    async = require('async'),
    _ = require('lodash'),
    uidGen = require('node-uuid');

exports.namedQuery = function (req, res, queryObj, store, callback) {
    var err;
    var verbose = (req.app.locals.config.debugLevel > 2)
    // Generar ID de transacción
    var id = uidGen.v4();

    // Registrar transacción a req.mssql
    req.mssql = req.mssql || {};
    req.mssql[id] = {
        "query": queryObj,
        "err": {},
        "res": {}
    };
    var job = req.mssql[id];

    // Obtener la query
    var query, queryName;
    var i = 0;
    for (var key in queryObj) {
        //console.log(" loading queryDB: "+key+" i:"+i); 
        query = queryObj[key];
        queryName = key;

        if (i > 0) {
            console.tag("SQL").Warning("Objeto query contiene más de una consulta: " + key);
        }
        i++;
    }

    if (!req.app.locals.connectionPool) {
        var err = 'No está bien configurada la conexion a la base de datos. Ir al panel de configuracion. @' + queryName;
        console.tag("SQL", "POOL", queryName).Error(err);
        res.status(400).send({
            type: 'ERR_DB_NO_POOL',
            message: err,
            query: verbose ? query : undefined
        });
        return
    }
    var request = new sql.Request(req.app.locals.connectionPool);

    //Ejecuto la query
    console.tag("SQL", "QUERY", queryName).Info(query);
    request.batch(query, function (err, recordset) {
        if (err) {
            console.tag("SQL", queryName).Error("Error en transacción: " + id + ", error: ", err);
            job.err = err;
            // Si se incluyó callback, llamarlo, si no, devolver http-500
            if (callback) {
                callback(recordset, err, req, res)
            } else {
                var type, message;
                var str = err.message || '';
                // si el error parte con "@" es un error controlado. Se muestra al usuario
                if (str[0] == '@') {
                    type = str.substr(1, str.indexOf(':') - 1);
                    message = str.substr(str.indexOf(':') + 1);
                }

                // Si el type es JSON_LIST convertir payload en JSON
                if (type == 'JSON_LIST') {
                    //console.log(message)
                }

                // responder 400 y objeto error
                res.status(400).send({
                    type: type || 'ERR_SQL_SPO', // error no controlado
                    message: message || 'Error en transacción: ' + queryName,
                    error: verbose ? err : undefined,
                    query: verbose ? query : undefined
                });
            };
            return 0;
        }
        //console.log("Sin Error en :"+id);

        // Resultado está en recordset     
        if (typeof (store) != "undefined" || store == null) {
            store = recordset;
        } else {
            req.filas = recordset;
        }
        if (callback) {
            callback(recordset, err, req, res);
        }
    });

};

exports.executeQuery = function (app) {

    return function (req, res, next) {
        var debug = (app.locals.config.debugLevel > 2);

        // Revisar si viene consulta en req.consultaBD
        var query = req.consultaBD;
        var queryName = req.consultaBDN || 'consultaBD';

        // Si no se encuentra nada, revisar en req.consultas
        if (!query){
            for (var key in req.consultas){
                if (query) console.tag("SQL", "executeQuery").Error("Viene más de una consulta en executeQuery. Usa executeListQuery ");
              query = req.consultas[key];
              queryName = key
            }
        }

        console.tag("SQL", "QUERY", "RUN", queryName).Info(query);

        if (!app.locals.connectionPool) {
            var errtxt = 'No está bien configurada la conexion. Ir al panel de configuracion.';
            console.tag("SQL").Error(errtxt);
            res.status(500).json(errtxt);
        } else {
            //Establezco un request utilizando la conexion
            var request = new sql.Request(app.locals.connectionPool);

            //Ejecuto la query
            request.batch(query, function (err, recordset) {
                if (err) {
                    console.tag("SQL", queryName).Error(err);

                    var type, message, debug;
                    var str = err.message || '';
                    // si el error parte con "@" es un error controlado. Se muestra al usuario
                    if (str[0] == '@') {
                        type = str.substr(1, str.indexOf(':') - 1);
                        message = str.substr(str.indexOf(':') + 1);
                    }

                    // Si el type es JSON_LIST convertir payload en JSON
                    if (type == 'JSON_LIST') {
                        //console.log(message)
                    }

                    // responder 400 y objeto error
                    res.status(400).send({
                        type: type || 'ERR_SQL_SPO', // error no controlado
                        message: message || 'Error en transacción: ' + queryName,
                        error: debug ? err : undefined,
                        query: debug ? query : undefined
                    });
                    return

                } else {
                    req.filas = recordset;
                    console.tag('SQL', 'RECORDSET').Info(recordset);
                }
                next();
            });
        }
    }
};

exports.transaction = function (app) {
    var debug = (app.locals.config.debugLevel > 2);

    return function (req, res, queries, store, callback) {
        // queries es un objeto {"model_name1":"select * from","model_name2":"select * from ..."}

        // Generar ID de transacción
        var id = uidGen.v4();

        // Registrar transacción a req
        req.mssql = req.mssql || {};
        req.mssql[id] = {
            "query": queries,
            "err": {},
            "res": {}
        };
        var job = req.mssql[id];

        // Inicializar conection pool
        var transaction = new sql.Transaction(app.locals.connectionPool);

        // Begin transaction
        transaction.begin(function (err) {

            if (err) {
                res.status(500).json({
                    error: err
                });
                console.tag("SQL").Error('Error in transaction begin', err);
                return 0
            }

            console.tag("SQL", "QUERY").Info(id, queries);

            // Handler al driver
            var request = new sql.Request(transaction);

            var listQuery = setUpTransaction(job.query, request);

            async.series(listQuery, function (err, results) {
                // results is now equal to: {one: [{a: 1}], two: [{b: 2}]}
                if (err) {
                    console.tag("SQL").Error(err);

                    var type, message;
                    var str = err.message || '';

                    // si el error parte con "@" es un error controlado. Se muestra al usuario
                    if (str[0] == '@') {
                        type = str.substr(1, str.indexOf(':') - 1);
                        message = str.substr(str.indexOf(':') + 1);
                    }

                    // Si el type es JSON_LIST convertir payload en JSON
                    if (type == 'JSON_LIST') {
                        //console.log(message)
                    }

                    // responder 400 y objeto error
                    res.status(400).send({
                        type: type || 'ERR_SQL_SPO', // error no controlado
                        message: message || 'Error en transacción: listQuery',
                        error: debug ? err : undefined,
                        query: debug ? job.query : undefined
                    });
                    return transaction.rollback();
                }
                transaction.commit(function (err) {
                    if (err) {
                        console.tag("SQL").Error(err);

                        var type, message;
                        var str = err.message || '';

                        // si el error parte con "@" es un error controlado. Se muestra al usuario
                        if (str[0] == '@') {
                            type = str.substr(1, str.indexOf(':') - 1);
                            message = str.substr(str.indexOf(':') + 1);
                        }

                        // Si el type es JSON_LIST convertir payload en JSON
                        if (type == 'JSON_LIST') {
                            //console.log(message)
                        }

                        // responder 400 y objeto error
                        res.status(400).send({
                            type: type || 'ERR_SQL_SPO', // error no controlado
                            message: message || 'Error en transacción: listQuery-commit',
                            error: debug ? err : undefined,
                            query: debug ? job.query : undefined
                        });
                        return 0
                    }
                    if (store == null) {
                        for (var key in results) {
                            job.res[key] = results[key];
                        }
                        callback(id);
                    } else {
                        store = store || {};
                        for (var key in results) {
                            store[key] = results[key];
                        }
                        callback(store);
                    }

                });
            });
        }); //transaction.begin(function(err) {
    }
};

function setUpTransaction(queries, request) {
    var requestObject = {};
    _.forOwn(queries, function (value, key) {
        //console.log("Modelo:",key,"query:",value);
        requestObject[key] = function (callback) {
            request.batch(value, callback);
        }
    });

    return requestObject;
};

exports.executeListQuery = function (app) {

    return function (req, res, next) {

        // Inicializo historial de consultas. Cada vez que se ejecuta una consulta se anota acá. 
        req.consultasEjecutadas = req.consultasEjecutadas || [];

        // Detectar si hay consultas
        var job = false;
        for (var key in req.consultas) {
            job |= (req.consultasEjecutadas.indexOf(key) < 0);
        }

        // Salir si no hay consultas
        if (!job) {
            console.tag("SQL").Log("executeListQuery: Nada que hacer, next()");
            next();
            return 0;
        }

        // Iniciar transacción. ToDO: Corregir que todas se están ejecutando en la misma transacción
        req.resultados = req.resultados || {};
        var transaction = new sql.Transaction(app.locals.connectionPool);

        transaction.begin(function (err) {
            // Salir con error si no resulta iniciar la transacción
            if (err) {
                res.status(500).json({ error: err });
                console.tag("SQL").Error('Error in transaction begin', err);
                return 0
            }

            // instanciar objeto request
            var request = new sql.Request(transaction);

            // Crear objeto de objetos sql.Request
            var requestObject = setUpMultipleQueries(req, request);

            console.tag('SQL', 'QUERY').Info(req.consultas);

            async.series(requestObject,

                function (err, results) {
                    // results is now equal to: {one: [{a: 1}], two: [{b: 2}]}
                    if (err) {
                        var ret = {
                            msg: 'Error al ejecutar consulta SQL',
                            error: err,
                            queries: req.consultas
                        };
                        console.tag("SQL").Error(ret);
                        res.status(500).json(ret);
                        return transaction.rollback();
                    }
                    transaction.commit(function (err) {
                        if (err) {
                            res.status(500).json({
                                error: err
                            });
                            console.tag("SQL").Error('Error in commit', err);
                            return 0
                        }
                        //console.log("Transaction commited.");
                        //console.log(results);
                        for (var key in results) {
                            req.resultados[key] = results[key];
                        }
                        next();
                    });
                }
            );
        }); //transaction.begin(function(err) {

    }
};

function setUpMultipleQueries(req, request) {
    var consultas = req.consultas;
    var consultasEjecutadas = req.consultasEjecutadas;
    var requestObject = {};

    _.forOwn(consultas, function (value, key) {
        if (consultasEjecutadas.indexOf(key) < 0) {
            if (typeof (value) == 'string') {
                // Si value es array se considera [0] es consulta, [1] es count
                consultasEjecutadas.push(key); // Se registra consulta como ejecutada
                requestObject[key] = function (callback) {
                    request.batch(value, callback);
                }
            } else {
                if (value.query) {
                    consultasEjecutadas.push(key); // Se registra consulta como ejecutada
                    requestObject[key] = function (callback) { request.batch(value.query, callback) }
                }
                if (value.datatable) {
                    consultasEjecutadas.push(key + '_datatable'); // Se registra consulta como ejecutada
                    requestObject[key + '_datatable'] = function (callback) { request.batch(value.datatable, callback) }
                }
            }
        } else {
            //console.log("consulta ignorada",key);
        }
    })

    return requestObject;
};
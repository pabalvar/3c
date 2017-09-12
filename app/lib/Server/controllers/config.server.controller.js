'use strict';
/*
 * Module dependencies.
 */
var errorHandler = require('./errors.server.controller'),
    console = process.console,
    fs = require('fs'),
    path = require('path'),
    sql = require('mssql'),
    _ = require('lodash');
/*
 * Crear un config
 */
exports.create = function(app) {
    return function(req, res) {
        fs.writeFile(path.resolve(app.locals.sqlConnection), JSON.stringify(req.newConfig), function(err) {
            if (err) {
                console.Error(err);
                return res.status(500).send({
                    message: 'Error no se pudo guardar la configuracion'
                });
            }
        });
        return res.status(200).send({
            message: 'Se guardo la conexion con exito',
            config: req.newConfig
        });
    }
};
/**
 * Show the current config
 */
exports.read = function(req, res) {
    res.json(req.config);
    res.status(200).json('Metodo aun no implementado');
};
/**
 * Update a config
 */
exports.update = function(req, res) {
    var config = req.config;
    config = _.extend(config, req.body);
    res.status(200).json('Metodo aun no implementado');
};
/**
 * Borrar un config
 */
exports.delete = function(req, res) {
    var config = req.config;
    res.status(200).json('Metodo aun no implementado');
};
/**
 * List de Config
 */
exports.list = function(app) {
    return function(req, res) {
        var config = {};
        fs.readFile(path.resolve(app.locals.sqlConnection), 'utf8', function(err, data) {
            if (err) {
                if (err.code === 'ENOENT')
                    res.status(500).json({
                        message: 'No existe archivo de conexion a base de datos',
                        error: err
                    });
                else
                    res.status(500).json({
                        message: 'Ha habido algun error',
                        error: err
                    });
            }
            //El contenido del archivo se carga en 'config'
            config = JSON.parse(data);
            //Consulto si el archivo de conexion esta vacio o no
            if (_.isEmpty(config))
                res.status(501).json({
                    message: 'Archivo de conexion vacío, establecer una conexion y guardar',
                    config: {}
                });
            else
                res.status(200).json({
                    message: 'Archivo de conexion ha sido cargado',
                    config: config
                });
        });
    }
};
/**
 * Config middleware
 */
exports.dbById = function(req, res, next, configid) {
    console.tag('dbById').Log(configid);
    if (configid == 'default')
        next();
    else
        res.status(200).json('Metodo aun no implementado para mas de una configuracion de db');
};
exports.resetConnection = function(app) {
    return function(req, res) {
        var configDB = {
            'user': app.locals.connectionPool.user,
            'password': app.locals.connectionPool.password,
            'server': app.locals.connectionPool.server,
            'database': app.locals.connectionPool.database,
            'port': app.locals.connectionPool.port,
            'options': Object.create(app.locals.paramsSQL.options)
        }
        var connectionPool = new sql.Connection(configDB, function(err) {
            if (err && configDB.port == 1433)
                return res.status(500)
                    .send({
                        message: 'No se ha podido establecer conexion',
                        error: err.message
                    });
            else if (err && configDB.port != 1433)
                return res.status(500)
                    .send({
                        message: 'No se ha podido establecer conexion. Compruebe que el servidor permite utilizar este puerto',
                        error: err.message
                    });
            app.locals.connectionPool.close();
            app.locals.connectionPool = connectionPool;
            res.status(200).send({
                message: 'Se ha reconectado con servidor'
            });
        });
    }
};
exports.startNewConnection = function(app) {
    return function(req, res, next) {
        console.tag('startNewConnection').Log(req.body);
        var configDB = req.body;
        var optionsDB = Object.create(app.locals.paramsSQL.options);
        configDB.options = optionsDB;
        //Si no se especifica el puerto, se usa por defecto 1433
        if (typeof configDB.port === 'undefined')
            configDB.port = 1433;
        var connectionPool = new sql.Connection(configDB, function(err) {
            if (err && configDB.port == 1433)
                return res.status(500)
                    .send({
                        message: 'No se ha podido establecer conexion, no se guardara.',
                        error: err.message
                    });
            else if (err && configDB.port != 1433)
                return res.status(500)
                    .send({
                        message: 'No se ha podido establecer conexion. Compruebe que el servidor permite utilizar este puerto',
                        error: err.message
                    });
            app.locals.connectionPool.close();
            app.locals.connectionPool = connectionPool;
            req.newConfig = configDB;
            return next();
        });
    }
};
/*
 * Config authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.config.user.id !== req.user.id) {
        return res.status(403).send({
            message: 'Usuario no esta autorizado'
        });
    }
    next();
};
/*
 * Set DEBUG level
 */
exports.setDebugLevel = function(app) {
    return function(req, res, next) {
        //app.locals.debugLevel = req.query.debugLevel;
        // Check if debugLevel is plausible
        var debugLevel = parseInt(req.params.debugLevel);
        if (debugLevel >= 0) {
            app.locals.debugLevel = debugLevel;
            return res.status(200).send({
                debugLevel: app.locals.debugLevel
            });
        } else {
            return res.status(500).send({
                message: "valor inválido para debug level: 1-3"
            });

        }
        next();
    };
};
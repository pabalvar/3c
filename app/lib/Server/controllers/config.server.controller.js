'use strict';

var Console = process.console,
    path = require('path'),
    fse = require('fs-extra'),
    sql = require('mssql'),
    _ = require('lodash');

exports.save = saveConnection;
exports.read = readConnection;
exports.list = getConnection;
exports.reset = createConnection;

exports.setDebugLevel = setDebugLevel;

// Detalles de implementación
function saveConnection(app) {
    return function (req, res) {
        var connectionFile = path.resolve(app.locals.config.sql.connectionFile);
        fse.writeJsonSync(connectionFile, app.locals.config.sql.connection);
        res.status(200).send({
            message: 'Se guardo la conexion con exito',
            config: req.newConfig
        });
        return;
    }
};

/** Lee archivo json, si no existe lo crea y salva.  */
function readConnection(config) {
    // Crear directorio si no existe
    fse.mkdirpSync(path.resolve(config.localPath));
    var connectionFile = path.resolve(config.sql.connectionFile);

    // Abrir archivo configuración usuario
    var customParams;
    try {
        customParams = fse.readJsonSync(connectionFile);
    } catch (err) {
        console.log("No existe archivo conexión: ", connectionFile, err);
    }

    // Hacer merge con datos default
    var connection = {};
    _.merge(connection, config.sql.defaultParams, customParams || {});

    // Si no habían datos custom, guardar lo que hay
    if (!customParams) {
        try {
            fse.writeJsonSync(connectionFile, connection);
            console.log("Creando archivo conexión: ", connectionFile);
        } catch (err) {
            console.log("No se pudo crear archivo conexión: ", connectionFile, err);
        }
    }

    // Actualizar config local
    config.sql.connection = connection;

    return connection;
}

/** GET */
function getConnection(app) {
    return function (req, res) {
        var config = readConnection(app.locals.config);
        res.status(200).json({
            message: 'Archivo de conexion ha sido cargado',
            config: config
        });
    }
};

function createConnection(app) {
    return function (req, res, next) {

        // Hacer merge con datos default
        var connection = {};
        _.merge(
            connection,
            app.locals.config.sql.defaultParams,
            app.locals.config.sql.connection || {},
            (req || {}).body || {});

        // Puerto por defecto 1433
        connection.port = connection.port || 1433; // Puerto por defecto 1433

        // Instanciar conección;
        var connectionPool = new sql.Connection(connection, function (err) {
            if (err) {
                if (res) {
                    res.status(500)
                        .send({
                            message: 'No se ha podido establecer conexion, no se guardara.',
                            error: err.message
                        });
                }
                console.log("error al crear conexión", err)
            } else {
                // Actualizar app.locals
                //app.locals.connectionPool.close();
                app.locals.connectionPool = connectionPool;
                console.log("se crea conexión sql")
                if (req) req.newConfig = connection;
                if (next){ next();}
            }
            return;
        });
    }
};

/** Set DEBUG level */
function setDebugLevel(app) {
    return function (req, res, next) {
        // Check if debugLevel is plausible
        var debugLevel = parseInt(req.params.debugLevel);
        if (debugLevel >= 0) {
            app.locals.config.debugLevel = debugLevel;
            return res.status(200).send({
                debugLevel: app.locals.config.debugLevel
            });
        } else {
            return res.status(500).send({
                message: "valor inválido para debug level: 1-3"
            });
        }
        next();
    };
};
'use strict';

// Dependencias
var config = require('./config/config'),
	fs = require('fs'),
	path = require('path'),
	sql = require('mssql'),
	Q = require('q'),
	_ = require('lodash');

// Se crea directorio caché si no existe
//if (!fs.existsSync(config.localPath)) fs.mkdirSync(config.localPath);
/*
// Leer archivo configuración SQL, connectionFile
Q.nfcall(fs.readFile, path.resolve(config.sql.connectionFile), "utf-8")
	.then(function (_connectionData) {

		// Obtener datos conexión de archivo, y anexar a config.sql
		config.sql.connectionParams = {};
		_.merge(config.sql.connectionParams, config.sql.defaultParams, JSON.parse(_connectionData));

		// Instanciar conexión SQL
		var connectionPool = new sql.Connection(config.sql.connectionParams);

		// Iniciar conexión SQL
		return connectionPool.connect().then(
			function () {
				console.log('Conexión servidor:' + config.sql.connectionParams.server + ' base de datos: ' + config.sql.connectionParams.database);
				initServer(connectionPool, config);
			},
			function (error) {
				console.log(error)
				console.error('[FATAL] No se puede conectar a servidor SQL: ', config.sql.connectionFile);
				initServer(connectionPool, config);
			}
		);
	})
	.fail(function (error) {
		console.log(error)
		console.error("[FATAL] No existe archivo configuración SQL: ", config.sql.connectionFile);
	})
	.done();

*/
initServer({},config);
/** función que inicia el servidor */
function initServer(connectionPool, _config) {
	//Se crea la app express
	var app = require('./config/express')(connectionPool, _config);

	//Se inicia el app para escuche en el puerto en <port>
	app.listen(_config.port);
	console.log(_config.app.title + ' version ' + _config.app.version + ' iniciado en puerto ' + _config.port);

	// Expose app
	exports = module.exports = app;

	//Por si se recibe alguna exception no considerada
	process.on('uncaughtException', function (err) {
		console.log(err);
		console.error("Error de proceso no considerado. Servidor seguira funcionando");
	});

	// Error de conexión
	/*
	connectionPool.on('error', function (err) {
		console.log(err);
		console.error('[error SQL] ', err);
	});*/
}

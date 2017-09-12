'use strict';

// Dependencias
var config = require('./config/config'),
	fs = require('fs'),
	path = require('path'),
	sql = require('mssql'),
	Q = require('q'),
	_ = require('lodash');

// Se crea directorio caché si no existe
if (!fs.existsSync(config.localPath)) fs.mkdirSync(config.localPath);

// Leer archivo configuración SQL, connectionFile
Q.nfcall(fs.readFile, path.resolve(config.sql.connectionFile), "utf-8")
	.then(function (_connectionData) {

		// Obtener datos conexión
		var connectionParams = {};
		_.merge(connectionParams, config.sql.defaultParams, JSON.parse(_connectionData));

		// Instanciar conexión SQL
		var connectionPool = new sql.Connection(connectionParams);

		// Iniciar conexión SQL
		return connectionPool.connect().then(
			function () {
				console.log('Conexión servidor:' + connectionParams.server + ' base de datos: ' + connectionParams.database);
				initServer(connectionPool);
			},
			function (error) {
				console.log(error)
				console.error('[FATAL] No se puede conectar a servidor SQL: ', config.sql.connectionFile);
				initServer(connectionPool);
			}
		);
	})
	.fail(function (error) {
		console.log(error)
		console.error("[FATAL] No existe archivo configuración SQL: ", config.sql.connectionFile);
	})
	.done();

/** función que inicia el servidor */
function initServer(connectionPool) {
	//Se crea la app express
	var app = require('./config/express')(connectionPool);

	//Se inicia el app para escuche en el puerto en <port>
	app.listen(config.port);
	console.log(config.app.title + ' version ' + config.app.version + ' iniciado en puerto ' + config.port);

	// Expose app
	exports = module.exports = app;

	//Por si se recibe alguna exception no considerada
	process.on('uncaughtException', function (err) {
		console.log(err);
		console.error("Error de proceso no considerado. Servidor seguira funcionando");
	});

	// Error de conexión
	connectionPool.on('error', function (err) {
		console.log(err);
		console.error('[error SQL] ', err);
	});
}

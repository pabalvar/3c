'use strict';

// Dependencias
var config = require('./config/config');

initServer({},config);
/** función que inicia el servidor */
function initServer(_config) {
	//Se crea la app express
	var app = require('./config/express')(_config);

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

}

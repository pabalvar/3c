'use strict';

// Dependencias
var configParams = require('./config/config.js');
var configExpress = require('./config/express.js');

initServer(configParams, configExpress);

/** función que inicia el servidor */
function initServer(_params, _express) {
	//Se crea la app express
	var app = _express(_params);

	//Se inicia el app para escuche en el puerto en <port>
	app.listen(_params.port);
	console.log(_params.app.title + ' version ' + _params.app.version + ' iniciado en puerto ' + _params.port);

	// Expose app
	exports = module.exports = app;

	//Por si se recibe alguna exception no considerada
	process.on('uncaughtException', function (err) {
		console.log(err);
		console.error("Error de proceso no considerado. Servidor seguira funcionando");
	});

}

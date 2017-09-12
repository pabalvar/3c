'use strict';

/*
 * Dependencias de modulos.
 */
var config = require('../../../../app/lib/Server/controllers/config.server.controller');



module.exports = function(app) {

    app.route('/config/db')
        .get(config.list(app))
        .post(config.startNewConnection(app),
            config.create(app)
        );
    app.route('/config/db:dbId')
        .get(config.read)
        .put(config.update);

    app.route('/config/db/reset/:dbId')
        .get(config.resetConnection(app));

    app.route('/config/debug/:debugLevel')
        .get(config.setDebugLevel(app));

    /*-------------Middleware para binding de algunas rutas-------------*/
    app.param('dbId', config.dbById);

};
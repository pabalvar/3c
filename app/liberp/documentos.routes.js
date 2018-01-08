'use strict';

var driver = require('../lib/Server/drivers/mssql.server.driver');
var documentos = require('./documentos.js');
var globals = require('../lib/globals/controllers/globals.js');

module.exports = function (app) {

    app.route('/documentos/deuda')
        .get(
        documentos.getDeuda,
        driver.runsql,
        globals.out
        );

    app.route('/documentos/:id*?') // id=IDMAEEDO
        .get(
        documentos.getDocumentos,
        driver.runsql,
        globals.out
        );

    app.route('/meta/documentos.deuda')
        .get(
        documentos.getMetaDeuda,
        globals.out
        );

}
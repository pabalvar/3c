'use strict';

var driver = require('../lib/Server/drivers/mssql.server.driver');
var documentos = require('./documentos.js');
var globals = require('../lib/globals/controllers/globals.js');

module.exports = function (app) {

    app.route('/documentos/traeDeuda')
        .get(
        documentos.traeDeuda,
        driver.executeListQuery(app),
        globals.queryOut
        );

    app.route('/documentos/:id*?') // id=IDMAEEDO
        .get(
        documentos.getDocumentos,
        driver.executeListQuery(app),
        globals.queryOut
        );

    app.route('/meta/documentos.deuda')
        .get(
        documentos.getMetaDeuda,
        driver.executeListQuery(app),
        globals.queryOut
        );

}
'use strict';

var driver = require('../lib/Server/drivers/mssql.server.driver');
var documentos = require('./documentos.js');
var globals = require('../lib/globals/controllers/globals.js');

module.exports = function (app) {

app.route('/documentos/traeDeuda')
.get(
    documentos.getDocumentosPendientesDePago,
    driver.executeListQuery(app),
    globals.queryOut
);
/** CRUD **/
app.route('/documentos/:id*?')
    .get(
        documentos.getDocumentos,
        driver.executeListQuery(app),
        globals.queryOut
    );
}
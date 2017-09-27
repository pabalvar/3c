'use strict';

var driver = require('../lib/Server/drivers/mssql.server.driver');
var documentos = require('./documentos.js');
var globals = require('../lib/globals/controllers/globals.js');

module.exports = function (app) {
/** CRUD **/
app.route('/documentos/:id*?')
    .get(
        documentos.getDocumentos,
        driver.executeListQuery(app),
        globals.queryOut
    )
}
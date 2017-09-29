'use strict';

var driver = require('../lib/Server/drivers/mssql.server.driver');
var values = require('./values.js');
var globals = require('../lib/globals/controllers/globals.js');

module.exports = function (app) {

app.route('/values/monedas')
.get(
    values.getMonedas,
    driver.executeListQuery(app),
    globals.queryOut
);
/** CRUD **/
/*
app.route('/documentos/:id*?')
    .get(
        documentos.getDocumentos,
        driver.executeListQuery(app),
        globals.queryOut
    );
    */
}
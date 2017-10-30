'use strict';

var trazadocu = require('./trazadocu.js');
var driver = require('../lib/Server/drivers/mssql.server.driver');
var globals = require('../lib/globals/controllers/globals.js');

module.exports = function (app) {
/** CRUD **/
app.route('/trazadocu')
    .get(
    trazadocu.getTrazaDocu,
    driver.executeListQuery(app),
    globals.queryOut
    )
}
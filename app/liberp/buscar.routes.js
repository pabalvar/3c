'use strict';

var driver = require('../lib/Server/drivers/mssql.server.driver');
var buscar = require('./buscar.js');
var globals = require('../lib/globals/controllers/globals.js');

module.exports = function (app) {

app.route('/buscar/')
.get(
    buscar.buscar,
    driver.executeListQuery(app),
    globals.queryOut
)
}
'use strict';

var driver = require('../lib/Server/drivers/mssql.server.driver');
var entidades = require('./entidades.js');
var globals = require('../lib/globals/controllers/globals.js');

module.exports = function (app) {
    app.route('/entidades/:id*?') // id=KOEN
        .get(
        entidades.getEntidades,
        driver.executeListQuery(app),
        globals.queryOut
        )
}
'use strict';

var driver = require('../lib/Server/drivers/mssql.server.driver');
var pagos = require('./pagos.js');
var globals = require('../lib/globals/controllers/globals.js');

module.exports = function (app) {
    app.route('/pagos/:id*?')
        .get(
        pagos.getPagos,
        driver.runsql,
        globals.out
        )
        .post(
        pagos.createPagos,
        driver.executeQuery(app),
        globals.returnStatusCreate
        )

    app.route('/meta/pagos') // metadatos
        .get(
        pagos.getMetaPagos,
        driver.runsql,
        globals.out
        )
    app.route('/meta/pagosd') // metadatos detalle = pagosd
        .get(
        pagos.getMetaPagosd,
        globals.out
        )
}
'use strict';

var driver = require('../lib/Server/drivers/mssql.server.driver');
var moneda = require('./monedas.js');
var globals = require('../lib/globals/controllers/globals.js');
/**
 * @api {get} /moneda/ Obtiene Moneda
 * @apiName getMoneda
 * @apiGroup liberp
 * @apiSampleRequest http://localhost:3000/moneda
 *
 * @apiDescription Trae monedas
 * @apiParam {String[]} [komo] ID de moneda <code>TABMO.KOMO</code>
 * @apiParam {String[]} [timo] Tipo de moneda <code>TABMO.TIMO</code>
 * @apiParam {String[]} [nokomo] Nombre de moneda <code>TABMO.NOKOMO</code>
 *
 * @apiExample Ejemplo de uso (copy paste en browser):
 * http://localhost:3000/moneda?timo=E
 *
 * @apiSuccess {String}   object  ="list" indica que el objeto es una lista
 * @apiSuccess {Array}    data    Array en que cada línea de resultado es un objecto
 */


module.exports = function (app) {
    /** CRUD **/
    app.route('/moneda/:id*?')
        .get(
        moneda.getMonedas,
        driver.executeListQuery(app),
        globals.queryOut
        )

    app.route('/meta/moneda') // metadatos
        .get(
        moneda.getMetaMonedas,
        driver.executeListQuery(app),
        globals.queryOut
        )
}
'use strict';

var driver = require('../lib/Server/drivers/mssql.server.driver');
var cuentas = require('./cuentas.js');
var globals = require('../lib/globals/controllers/globals.js');

/**
 * @api {get} /cuentas/ Cuentas bancarias de la entidad
 * @apiName cuentas
 * @apiGroup liberp
 * @apiSampleRequest http://localhost:3000/cuentas
 *
 * @apiDescription Trae cuentas corrientes de la entidad
 *
 * @apiParam {String[]} [koen] Código de la entidad
 * @apiParam {String[]} [tidp] Tipo de pago (CHV|EFV|...)
 * 
 * @apiExample Ejemplo de uso (copy paste en browser):
 * http://localhost:3000/cuentas/13454?tidp=CHV
 *
 * @apiSuccess {String}   object  ="list" indica que el objeto es una lista
 * @apiSuccess {Array}    data    Array en que cada línea de resultado es un objecto
 */

module.exports = function (app) {

    app.route('/cuentas/:id*?') // id=KOEN
        .get(
        cuentas.getCuentas,
        driver.runsql,
        globals.out
        );

    app.route('/meta/cuentas')
        .get(
        cuentas.getMetaCuentas,
        globals.out
        );

}
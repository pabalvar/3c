'use strict';

var driver = require('../lib/Server/drivers/mssql.server.driver');
var entidades = require('./entidades.js');
var globals = require('../lib/globals/controllers/globals.js');

/**
 * @api {get} /entidades/ Entidades
 * @apiName entidades
 * @apiGroup liberp
 * @apiSampleRequest http://localhost:3000/entidades
 *
 * @apiDescription Equivalente a Trae cliente
 *
 * @apiParam {String[]} [koen] Código de la entidad
 * @apiParam {String[]} [tien] Tipo de entidad (C)liente|(P)roveedor|(A)mbos
 * @apiParam {String[]} [tiposuc] Tipo de sucursal (P)???
 * @apiParam {String} [search] <i>search</i>: Condición por defecto, texto contenido en la concatenación de todos los campos <code>"WHERE CONCAT(<i>f</i>) like '%search%'</code>
 *
 * @apiExample Ejemplo de uso (copy paste en browser):
 * http://localhost:3000/entidades?tien=A
 *
 * @apiSuccess {String}   object  ="list" indica que el objeto es una lista
 * @apiSuccess {Array}    data    Array en que cada línea de resultado es un objecto
 */
module.exports = function (app) {

    app.route('/entidades/:id*?') // id=KOEN
        .get(
        entidades.getEntidades,
        driver.runsql,
        globals.out
        )

    app.route('/meta/entidades') // metadatos
        .get(
        entidades.getMetaEntidades,
        driver.runsql,
        globals.out
        )
}





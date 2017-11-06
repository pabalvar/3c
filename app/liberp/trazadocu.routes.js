'use strict';

var trazadocu = require('./trazadocu.js');
var driver = require('../lib/Server/drivers/mssql.server.driver');
var globals = require('../lib/globals/controllers/globals.js');

module.exports = function (app) {
    /**
     * @api {get} /trazadocu/ Trazabilidad de documentos
     * @apiName trazadocu
     * @apiGroup liberp
     * @apiSampleRequest http://localhost:3000/trazadocu
     *
     * @apiDescription Equivalente TrazaDocumento??
     *
     * @apiParam {String} [idmaeedo] ID del documento
     * @apiParam {String} [idmaeddo] ID de una línea del documento
     * @apiParam {String} [tido] Tipo de documento (FCV|NVV, etc)
     * @apiParam {String} [nudo] Número (folio) del documento
     *
     * @apiExample Ejemplo de uso (copy paste en browser):
     * <a href="http://localhost:3000/entidades?tien=A"></a>
     *
     * @apiSuccess {String}   object  ="list" indica que el objeto es una lista
     * @apiSuccess {Array}    data    Array en que cada línea de resultado es un objecto
     */
    app.route('/trazadocu')
        .get(
        trazadocu.getTrazaDocu,
        driver.executeListQuery(app),
        globals.queryOut
        )
}
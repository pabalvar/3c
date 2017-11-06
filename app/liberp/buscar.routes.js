'use strict';

var driver = require('../lib/Server/drivers/mssql.server.driver');
var buscar = require('./buscar.js');
var globals = require('../lib/globals/controllers/globals.js');

module.exports = function (app) {
    /**
     * @api {get} /buscar/ Ejecuta SQL SELECT remotamente
     * @apiName buscar
     * @apiGroup liberp
     * @apiSampleRequest http://localhost:3000/buscar
     *
     * @apiDescription Equivalente a EjecutaSQL
     *
     * @apiParam {String} f <i>fields</i>: Lista de campos a considerar. <code>SELECT <i>f</i></code>
     * @apiParam {String} t <i>tables</i>: Lista de tablas a usar en consulta <code>FROM <i>t</i></code>
     * @apiParam {String} o <i>order</i>: Campo a usar en el ordenamiento de resultados <code>ORDER BY <i>o</i></code>
     * @apiParam {String} c <i>condition</i>: Condiciones a usar en query. (múltiples se unen con AND) <code>WHERE <i>c</i></code>
     * @apiParam {String} search <i>search</i>: Condición por defecto, texto contenido en la concatenación de todos los campos <code>"WHERE CONCAT(<i>f</i>) like '%search%'</code>
     *
     * @apiExample Ejemplo de uso (copy paste en browser):
     * <a href="http://localhost:3000/buscar?t=MAEEN&search=PRODUCTOS&f=NOKOEN&f=KOEN&o=KOEN"></a>
     *
     * @apiSuccess {String}   object  ="list" indica que el objeto es una lista
     * @apiSuccess {Array}    data    Array en que cada línea de resultado es un objecto
     */
    app.route('/buscar/')
        .get(
        buscar.buscar,
        driver.executeListQuery(app),
        globals.queryOut
        )
}
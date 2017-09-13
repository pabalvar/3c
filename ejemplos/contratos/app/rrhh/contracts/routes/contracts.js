'use strict';

var driver = require('../../../../app/lib/Server/drivers/mssql.server.driver'),
    contracts = require('../../../../app/rrhh/contracts/controllers/contracts.js'),
    rtablasModel = require('../../rtablas/controllers/rtablas.model.controller.js'),
    rtablasParser = require('../../rtablas/controllers/rtablas.parser.controller.js'),
    globals = require('../../../../app/lib/globals/controllers/globals.js');

module.exports = function (app) {

    // Middleware para searchParams. Convierte searchParams en una Query bajo req.query.contratos
    app.use(contracts.searchParams);

    /** CRUD **/
    app.route('/contracts/:uidxcontrat*?')
        .get(
        app.locals.auth,
        contracts.getContracts,
        rtablasModel.getRtablas,
        driver.executeListQuery(app),
        rtablasParser.parseTablas,
        globals.contrato_dialog
        )
        .post(
        app.locals.auth,
        contracts.createContracts,
        driver.executeQuery(app),
        globals.returnStatusCreate
        )
        .put(
        app.locals.auth,
        contracts.updateContracts,
        driver.executeQuery(app),
        globals.returnStatusUpdate
        )
        .patch(
        app.locals.auth,
        contracts.upsertContracts,
        driver.executeQuery(app),
        globals.returnStatusUpsert
        )
        .delete(
        app.locals.auth,
        contracts.deleteContracts,
        driver.executeQuery(app),
        globals.returnStatusDelete
        );

    /** Reportes **/
    app.route('/contract-types') // ToDo: Mover a tablas PAD
        .get(
        app.locals.auth,
        function (req, res, next) {
            req.rtablas = ['T_TIPO_CON'];
            req.consultas = {};
            next();
        },
        rtablasModel.getRtablas,
        driver.executeListQuery(app),
        rtablasParser.parseTablas,
        function (req, res) {
            var mask = {
                client: 'VALTABDES',
                server: 'VALTAB1'
            };
            res.status(200).json(req.resultados.parseRtablas.T_TIPO_CON.data.map(function (r) {
                return { id: r[mask.server], name: r[mask.client] };
            }).sort(function (a, b) { return a.name > b.name; }));
        }
        );
    app.route('/contracts-reports/dotacion')
        .get(
        app.locals.auth,
        contracts.getDotacion,
        driver.executeQuery(app),
        globals.queryOut
        );

    /** URL Params **/
    app.param('uidxcontrat', function (req, res, next, value) {
        req.query.contratos = value;
        req.singleResource = true;
        next();
    });

};
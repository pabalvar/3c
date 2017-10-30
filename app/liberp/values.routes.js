'use strict';

var driver = require('../lib/Server/drivers/mssql.server.driver');
var values = require('./values.js');
var globals = require('../lib/globals/controllers/globals.js');

module.exports = function (app) {

    app.route('/values/emisoresDocumento')
        .get(
            values.getEmisoresDocumento,
            driver.executeListQuery(app),
            globals.queryOut
    );

    app.route('/values/parametrosModalidad')
        .get(
            values.getParamsFuncionario,
            driver.executeListQuery(app),
            globals.queryOut
    );

    app.route('/values/monedas')
        .get(
            values.getMonedas,
            driver.executeListQuery(app),
            globals.queryOut
    );

    app.route('/values/formasDePago*?')
        .get(
            values.getFormasDePago,
            //driver.executeListQuery(app),
            globals.returnConstante
    );
    
}
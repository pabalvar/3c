'use strict';

var driver = require('../../../../app/lib/Server/drivers/mssql.server.driver.js'),
  empresas = require('../controllers/empresas.controller.js'),
  globals = require('../../../../app/lib/globals/controllers/globals.js');

module.exports = function (app) {
  app.route('/empresas')
    .get(
    app.locals.auth,
    empresas.getEmpresas,
    driver.executeListQuery(app),
    globals.queryOut
    );
};

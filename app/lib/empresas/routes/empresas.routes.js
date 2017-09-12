'use strict';


/*
 * Dependencias de modulos.
 */
var driver= require('../../../../app/lib/Server/drivers/mssql.server.driver.js'),
    EmpresasCtlr = require('../controllers/empresas.controller');


module.exports = function(app) {

  /*-----------------------Routes-------------------------*/
  app.route('/empresas')
    .get(EmpresasCtlr.list,
         driver.executeQuery(app),
         EmpresasCtlr.out
  );

  /*--------------------Middleware-----------------------*/
  app.param('empresaId', EmpresasCtlr.empresaId);
};

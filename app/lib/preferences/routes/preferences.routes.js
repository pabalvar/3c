'use strict';


/*
 * Dependencias de modulos.
 */
var driver= require('../../../../app/lib/Server/drivers/mssql.server.driver.js'),
    PreferencesCtlr = require('../controllers/preferences.controller');


module.exports = function(app) {

  /*-----------------------Routes-------------------------*/
  app.route('/preferences')
    .get(PreferencesCtlr.list,
         driver.executeQuery(app),
         PreferencesCtlr.out
  );

  /*--------------------Middleware-----------------------*/
  app.param('preferenceId', PreferencesCtlr.preferenceId);
};

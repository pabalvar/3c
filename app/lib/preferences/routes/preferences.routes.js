'use strict';


/*
 * Dependencias de modulos.
 */
var driver = require('../../../../app/lib/Server/drivers/mssql.server.driver.js'),
  Preferences = require('../controllers/preferences.controller.js'),
  globals = require('../../../../app/lib/globals/controllers/globals.js');


module.exports = function (app) {
  app.route('/preferences/')
    .get(
    Preferences.getPreference,
    driver.executeQuery(app),
    globals.queryOut
    );

};

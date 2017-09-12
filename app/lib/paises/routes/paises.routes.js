'use strict';

var driver= require('../../../../app/lib/Server/drivers/mssql.server.driver.js'),
    globals = require('../../../../app/lib/globals/controllers/globals.js'),
    Paises = require('../controllers/paises.controller');

module.exports = function(app) {
  app.route('/comunas/')
    .get(Paises.comunas.query,
         driver.executeListQuery(app),
         globals.queryOut
  );
  app.route('/regiones/')
    .get(Paises.regiones.query,
         driver.executeListQuery(app),
         globals.queryOut
  );
  app.route('/paises/')
    .get(Paises.paises.query,
         driver.executeListQuery(app),
         globals.queryOut
  );
 

  /*-------------Middleware para binding de algunas rutas-------------*/
  app.param('paisId', Paises.paisId);
  app.param('regionId', Paises.regionId);
  app.param('comunaId', Paises.comunaId);
};

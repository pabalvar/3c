'use strict';

var empresasDB = require('../queries/empresas.queries.js');
var preferencesDB = require('../../preferences/controllers/preferences.controller.js');//D:\dev\random.html\app\random.3c\app\lib\

exports.getEmpresas = getEmpresas;

function getEmpresas(req, res, next) {
  
  req.query.empresa = preferencesDB.getEmpresas({idxlogin:req.user}) // Restringir a empresas visibles por usuario

  req.consultas.getEmpresas = empresasDB.getEmpresasQuery(req.query, req.pagination);
  next();
};
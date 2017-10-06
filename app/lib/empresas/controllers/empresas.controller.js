'use strict';

var empresasDB = require('../queries/empresas.queries.js');

exports.getEmpresas = getEmpresas;

function getEmpresas(req, res, next) {
  req.consultas.getEmpresas = empresasDB.getEmpresasQuery(req.query, req.pagination);
  next();
};
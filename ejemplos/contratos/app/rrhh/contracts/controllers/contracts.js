'use strict';
/**
 * @fileOverview Controlador de Contrato
 * @author PAAD
 * @version 0.9
 */
var ContractsDB = require('../queries/contracts.js');
var Model = require('../controllers/contracts.model.js');
var globals = require('../../../../app/lib/globals/controllers/globals.js');
var _ = require("lodash");

/** CRUD contracts **/

/** GET **/
exports.getContracts = function(req, res, next) {
    req.consultas.contracts = ContractsDB.getContractsQuery(req.query, req.pagination); // Genera consulta en consultas.contracts
  
  // Para el paginado de datatable se agrega una segunda consulta que sólo cuenta
    if(req.query.type == 'datatable'){
        req.consultas.contracts_datatable = ContractsDB.getContractsQuery(req.query, {count: true});
    }
    
    // Si la consulta requiere modelo dialogo embebido, incorporar las tablas siguientes
    if((req.embed||{}).dialog) {
        req.rtablas = ['T_TIPO_CON','T_CAUSAL', 'T_EMPRESA'];
    }
    next();
};
/** POST **/
exports.createContracts = function(req, res, next) {
    var data = globals.validateFields(_.castArray(req.body), Model.XCONTRAT, req.msg);
    req.consultaBD = ContractsDB.createContractsQuery(data, {allow_create: true});
    req.consultaBDN = 'createContractsDB';
    next();
};
/** PUT **/
exports.updateContracts = function(req, res, next) {
    var data = globals.validateFields(_.castArray(req.body), Model.XCONTRAT, req.msg);
    req.consultaBD = ContractsDB.createContractsQuery(data, {allow_update: true});
    req.consultaBDN = 'createContractsDB';
    next();
};
/** PATCH **/
exports.upsertContracts = function(req, res, next) {
    var data = globals.validateFields(_.castArray(req.body), Model.XCONTRAT, req.msg);
    req.consultaBD = ContractsDB.createContractsQuery(data, {allow_update: true,allow_create: true});
    req.consultaBDN = 'createContractsDB';
    next();
};
/** DELETE **/
exports.deleteContracts = function(req, res, next) {
    var data = _.castArray(req.query.contratos); // asegurar array
    req.consultaBD = ContractsDB.deleteContractsQuery(data, {});
    req.consultaBDN = 'deleteContractsDB';
    next();
};

/** middleware que convierte searchParams en una consulta a contratos y personas, retorna req.personas, req.query.contratos **/
exports.searchParams = function(req, res, next) {
    if( (req.query || {}).searchParams || (req.query || {}).contratos ) {
        req.query.contracts = req.query.contracts || filterContractsQuery(req, res); // PAD: contracts es uso en SRV, contratos en CLIENT
        req.query.persons = req.query.personas || filterContractsQuery(req, res, 'persona');
    }
    next();
}
function filterContractsQuery(req, res, model) {
    var output = {
        subselect: true
    };
    output.setFields = (model == 'persona') ? ['XP.UIDXPERSON'] : ['XC.UIDXCONTRAT'];
    return ContractsDB.getContractsQuery(req.query, output);
};

'use strict';

/*
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../../../../app/lib/Server/controllers/errors.server.controller'),
  Users= require('../queries/users.queries.js'),
  Preferences= require('../../../../app/lib/preferences/queries/preferences.queries');


/**
 * Send User
 */
exports.loadConfig = function(req, res) {
	res.json(req.user || null);
};


exports.configByModulo= function(req, res, next){

  next();
};


exports.getEmpresasAccess= function(req, res, next){
	var input_params= {};
	input_params.userid= req.query.userid;
	input_params.variable= 'canAccess';

	req.consultaBD= Preferences.get(input_params);
	next();
}



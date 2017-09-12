'use strict';
 
var Users = require('../queries/users.queries.js');
			
			
exports.getAll = function(req, res, next) {
	req.consultaBD = Users.getAll();
	next();
};

exports.create = function(req, res, next) {
	req.consultaBD = Users.create(req.body.data);
	next();
};

exports.get = function(req, res, next) {
	req.consultaBD = Users.get(req.params.user_id);
	next();
};

exports.update = function(req, res, next) {
	req.consultaBD = Users.update(req.params.user_id, req.body);
	next();
};

exports.delete = function(req, res, next) {
	req.consultaBD = Users.delete(req.params.user_id);
	next();
};

exports.out = function(req, res, next) {
	var out = req.filas ? ((req.filas.length > 1) ? req.filas : req.filas[0]) : "OK";
	res.send(out);
};

exports.out_array = function(req, res, next) {
	var out_array = req.filas;
	res.send(out_array);
};


//join with 'Funcionario'
exports.checkExistence = function(req, res, next) {
	req.consultaBD = Users.checkExistence(req.body);
	next();
};
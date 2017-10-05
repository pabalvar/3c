'use strict';
 
var UsersDB= require('../queries/users.queries.js');		
			
exports.getUsers = function(req, res, next) {
	// Si viene idxlogin anota que es consulta de un resultado (no lista)
	if (req.params.idxlogin){
		req.singleResource=true;
		req.query.idxlogin = req.params.idxlogin
	}
	// Cargar consulta SQL
	req.consultas.getUsers = UsersDB.getUsersQuery(req.query, req.pagination);
	next();
};

exports.createUsers = function(req, res, next) {
	req.consultaBD = UsersDB.createUsersQuery(req.body.data);
	next();
};
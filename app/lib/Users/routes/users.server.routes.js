'use strict';

/*
 * Module dependencies.
 */
//var passport = require('passport');

var driver = require('../../../../app/lib/Server/drivers/mssql.server.driver'),
	users = require('../../../../app/lib/Users/controllers/users.server.controller'),
	EmpresasCtlr= require('../../../../app/lib/empresas/controllers/empresas.controller');

module.exports = function(app) {
	// User Routes

	// Setting up the users profile api
	app.route('/users/me').get(users.me);
	//app.route('/users').put(users.update);
	//app.route('/users/accounts').delete(users.removeOAuthProvider);

	// Setting up the users password api
	/*app.route('/users/password').post(users.changePassword);
	app.route('/auth/forgot').post(users.forgot);
	app.route('/auth/reset/:token').get(users.validateResetToken);
	app.route('/auth/reset/:token').post(users.reset);*/

	// Setting up the users authentication api
	//app.route('/auth/signup').post(users.signup);
	//app.route('/auth/signin').post(users.signin);

	//app.route('/auth/signout').get(users.signout);

	app.route('/users/profile/modulo/:idModulo')
	   .get(users.loadConfig)

	app.route('/users/empresas/canAccess')
		.get(users.getEmpresasAccess, driver.executeQuery(app),
			 EmpresasCtlr.list, driver.executeQuery(app),
			 users.out);

	//// Login
	app.route('/login')
		.post(
			users.login
		);
		
	//// Routes for CRUD ////
	app.route('/users')
		.get(app.locals.auth,
			users.getAll, driver.executeQuery(app),
			users.out_array
		)
		.post(app.locals.auth,
			users.create, driver.executeQuery(app),
			users.out
		)
		//checkExistence to the relation with Funcionario
		.put(app.locals.auth,
			users.checkExistence, driver.executeQuery(app),
			users.out
		);
	
	app.route('/users/:user_id')
		.get(app.locals.auth,
			users.get, driver.executeQuery(app),
			users.out
		)
		.put(app.locals.auth,
			users.update, driver.executeQuery(app),
			users.out
		)
		.delete(app.locals.auth,
			users.delete, driver.executeQuery(app),
			users.out
		);
	
	// Finish by binding the user middleware
    app.param('idModulo', users.configByModulo)	
		
};

'use strict';

var driver = require('../../../../app/lib/Server/drivers/mssql.server.driver'),
	usersCrud = require('../../../../app/lib/Users/controllers/users.crud.server.controller.js'),
	usersAuth = require('../../../../app/lib/Users/controllers/users.authentication.server.controller.js'),
	globals = require('../../../../app/lib/globals/controllers/globals.js');


module.exports = function (app) {

	/* Login Users*/
	app.route('/login')
		.post(
		usersAuth.login
		)
	app.route('/logout')
		.get(
		usersAuth.logout
		)

	/** CRUD Users */
	app.route('/users/:idxlogin*?')
		.get(
		//app.locals.auth,
		usersCrud.getUsers,
		driver.executeListQuery(app),
		globals.queryOut
		)
		.post(
		app.locals.auth,
		usersCrud.createUsers,
		driver.executeQuery(app),
		globals.queryOut
		)

};

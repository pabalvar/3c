'use strict';

module.exports = function(app) {
	// Root routing
	var core = require('../../../../app/lib/Server/controllers/core.server.controller');
	app.route('/').get(core.index);
};

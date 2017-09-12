'use strict';

/*
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../../../../app/lib/Server/controllers/errors.server.controller'),
  passport = require('passport');
  

/**
 * Send User
 */
exports.me = function(req, res) {
	res.json(req.user || null);
};

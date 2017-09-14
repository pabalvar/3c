'use strict';

var passport = require('passport');
var jwt = require('jsonwebtoken'); // for session managment

// Login
exports.login = function (req, res, next) {
	if (!req.body.username || !req.body.password) {
		return res.status(400).json({ message: 'Completar todos los campos.' });
	}

	passport.authenticate('local', function (err, user, info) {
		if (err) { return next(err); }
		if (user) {

			// User generateJWT
			// set expiration to 5 days
			var today = new Date();
			var exp = new Date(today);
			exp.setDate(today.getDate() + 5);

			var generated_jwt = jwt.sign({ // OBS: don't use the password (or hash + salt)
				// this first object param is the 'payload' of the token; we can use the info.
				id: user.id, // OBS: the id of MongoDB are this key: _id
				username: user.username,
				exp: parseInt(exp.getTime() / 1000),
			}, 'RANDOM_SECRET'); // OBS: this 'SECRET' should match then on verifying; and should be required from a Environment variable!

			return res.json({ token: generated_jwt });
		} else {
			return res.status(401).json(info);
		}
	})(req, res, next);
};

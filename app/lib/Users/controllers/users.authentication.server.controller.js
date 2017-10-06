'use strict';

var passport = require('passport');
var jwt = require('jsonwebtoken'); // for session managment

// Functions exportables
exports.login = login; 
exports.logout = logout;
exports.requiresLogin = requiresLogin;

// Implementación
function login(req, res, next) {
	
	// Validar si vienen todos los campos
	if (!req.body.username || !req.body.password) {
		return res.status(400).json({ message: 'Completar todos los campos.' });
	}

	passport.authenticate('local', {session:true, failureRedirect:"/"}, function (err, user, info) {
		if (err) { return next(err); }
		if (user) {
			// Devolver un token basado en nombre de usuario y id
			var nowSec = parseInt((new Date()).getTime() / 1000);
			var durationSec = 10 * (86400) // 5 [days] x 8600 [seconds / day]

			var token = jwt.sign({ // OBS: don't use the password (or hash + salt)
				id: user.id,
				username: user.username,
				exp: nowSec + durationSec
			}, 'RANDOM_SECRET'); // OBS: this 'SECRET' should match then on verifying; and should be required from a Environment variable!

			req.logIn(user,function(err){console.log("error:", err)})

			return res.json({ token: token });
		} else {
			return res.status(401).json(info);
		}
	})(req, res, next);
};

function logout(req,res,next){
	req.logOut(); //.destroy(function (err) {
	res.redirect('/'); //Inside a callback… bulletproof!
}

function requiresLogin(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).send({
            message: 'Usuario no ha abierto sesión'
        });
    }
    next();
};



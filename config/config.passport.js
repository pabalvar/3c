var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var jwt = require('jsonwebtoken');
var sql = require('mssql');
var Users = require('../app/lib/Users/queries/users.queries.js');

// Functions exportables
exports.init =init;
exports.login = login; 
exports.logout = logout;
exports.requiresLogin = requiresLogin;

// Detalles implementación
function init(app) {
    passport.use(new LocalStrategy(checkPassword(app)));
    app.use(passport.initialize()); // passport initialize middleware
    app.use(passport.session());

    passport.deserializeUser(function (user, done) {
        //console.log("deserializing", user)
        done(null, user);  // invalidates the existing login session.
    });
    passport.serializeUser(function (user, done) {
        //console.log("serializing", user)
        done(null, user.id)
    });
}

function checkPassword(app) {
    return function (username, password, done) {

        // Crear consulta usuario password
        var consultaBD = Users.checkValidPassword({ username: username, password: password });
        var request = new sql.Request(app.locals.connectionPool);

        return request.batch(consultaBD, function (err, recordset) {

            var result = recordset[0];

            if (result.id > 0) {
                var user = { id: result.id, username: result.username }
                return done(null, user);
            } else if (result.id == -1) {
                return done(null, false, { message: 'Email incorrecto o el Usuario está Inactivo.' });
            } else if (result.id == 0) {
                return done(null, false, { message: 'Clave incorrecta.' });
            } else {
                return done(null, false, { message: 'Error de servidor' });
            }
        });
    }
}

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

			req.logIn(user,function(err){if (err) console.log("error:", err); });

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
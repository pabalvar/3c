'use strict';

/*
 * Module dependencies.
 */

var passport = require('passport');
// npm install jsonwebtoken --save
var jwt = require('jsonwebtoken'); // for session managment
 
/*
var _ = require('lodash'),
	errorHandler = require('../../../../app/lib/Server/controllers/errors.server.controller'),
	passport = require('passport'),
  console= process.console,
	passportOptions={
		successRedirect: '/',
		failureRedirect: '/login'
	};
*/


// Login
exports.login = function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Completar todos los campos.'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }
    if(user){
			
			/*
			// To get the User login on the Passport Session Cookie
			req.logIn(user, function(err) {
				if (err) { return next(err); }
			});
			*/
			
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
			
			return res.json({token: generated_jwt});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
};


/**
 * Signin after passport authentication
 */
 /*
exports.signin = function(req, res, next) {

	passport.authenticate('test', function(err, user, info) {

//	console.tag('app/Users/controllers/users.authentication.server.controller','signin','err,info').log(err, info);
		if (err || !user) {
			res.status(400).send(info);
		} else {
			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;
			req.user=user;

			//Esto produce que se guarde una sesion, ademas de guardar req.user=user
			req.login(user, function(err) {
				if (err) {
					res.status(400).send({error:err, message:'El servidor no se encuentra activo o no se logra conectar'});
				} else {
					//Capto la redireccion en la session, y la borro del req.session
					//var redirect_to = req.session.redirect_to ? req.session.redirect_to : '/';
					//delete req.session.redirect_to;

					//Envio el usuario y la redireccion como respuesta, la vista se encarga de la redireccion
					//res.json({user: user , redirect_to : redirect_to});
					res.json({user: user});
				}
			});
		}
	})(req, res, next);
};
*/

/**
 * Signout
 */
/*
exports.signout = function(req, res) {
	//req.logout();
	req.session.destroy(function(err){

	});
	res.redirect('/');
};
*/

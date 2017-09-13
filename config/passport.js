// npm install passport passport-local --save
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy; // this strategy is th 'simple' one to authenticate based on a user + password

// npm install express-jwt --save
var jwt = require('express-jwt');

var sql = require('mssql');
var Users = require('../app/lib/Users/queries/users.queries.js');

module.exports = function(app) {

    passport.use(new LocalStrategy(
        function(username, password, done) {
            var result = {};
            var consultaBD = Users.checkValidPassword({
                username: username,
                password: password
            });
            var request = new sql.Request(app.locals.connectionPool);
            return request.batch(consultaBD, function(err, recordset) {
                result = recordset[0];
                if (result.id == -1) {
                    return done(null, false, {
                        message: 'Email incorrecto o el Usuario está Inactivo.'
                    });
                }
                if (result.id == 0) {
                    return done(null, false, {
                        message: 'Clave incorrecta.'
                    });
                }
                return done(null, {
                    id: result.id,
                    username: result.username
                });
            });
        }
    ));

    var auth = jwt({
        secret: 'RANDOM_SECRET',
        userProperty: 'payload'
    }); //RECOMMENDED: use an environment variable for referencing the secret and keep it out of your codebase (should be equal to the one use on models/Users.js)

    return auth;
}
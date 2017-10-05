var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var jwt = require('express-jwt');
var sql = require('mssql');
var Users = require('../app/lib/Users/queries/users.queries.js');

module.exports = function(app) {

    passport.use(new LocalStrategy(checkPassword(app)));

    var auth = jwt({
        secret: 'RANDOM_SECRET',
        userProperty: 'payload'
    }); //RECOMMENDED: use an environment variable for referencing the secret and keep it out of your codebase (should be equal to the one use on models/Users.js)

    return auth;
}

function checkPassword(app) {
return function(username, password, done) {

    // Crear consulta usuario password
    var consultaBD = Users.checkValidPassword({username: username, password: password});
    var request = new sql.Request(app.locals.connectionPool);
    return request.batch(consultaBD, function(err, recordset) {
        
        var result = recordset[0];

        if (result > 0){
            var user =  {id: result.id,username: result.username}
            return done(null, user );
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
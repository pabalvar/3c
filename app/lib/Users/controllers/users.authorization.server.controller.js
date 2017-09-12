'use strict';

/*
 * Module dependencies.
 */
var _ = require('lodash'),
	stringify = require('json-stringify-safe'),
	console=process.console,
	sql= require('mssql');

/**
 * User middleware
 */
exports.userByID = function(req, res, next, id) {

};

/**
 * Require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {

	if (!req.isAuthenticated()) {

		//console.tag('app/Users/users.authorization.server.controller','requiresLogin','req.query').log(stringify(req.query));
		//console.tag('app/Users/users.authorization.server.controller','requiresLogin','req.session').log(stringify(req.session));

		return res.status(401).send({
			message: 'Usuario no ha abierto sesión'
		});
	}

	next();
};

/**
 * User authorizations routing middleware
 */
exports.hasAuthorization = function(permiso,app) {

	return function(req,res,next){
        var hasUser = false;
        
        //console.tag('app/Users/users.authorization.server.controller','hasAuthorization','req').log(stringify(req));
        //console.tag('app/Users/users.authorization.server.controller','hasAuthorization','req.session').log(req.session);

        // Detectar si hay usuario en petición
        if (req.session) if (req.session.passport) if (req.session.passport.user) if (req.session.passport.user.username){
            hasUser=true;
        }
                    
        if (hasUser){
                    
            var consultaBD="select COUNT (*) AS 'PERMISO' from MAEUS where KOUS ='"+req.session.passport.user.username+"' and KOOP ='"+ permiso +"'";
            console.tag('app/Users/users.authorization.server.controller','hasAuthorization','consultaBD').log(consultaBD);

            if (!app.locals.connectionPool) res.status(500).json({message:'No es posible establecer conexion con la tabla MAEUS'});
            else{

                var request = new sql.Request(app.locals.connectionPool);

                //Ejecuto la query
                request.query(consultaBD, function(err, recordset) {
                    if (err) { //Todo error de sistema
                        console.tag('app/Server/drivers/mssql.server.driver.js','hasAuthorization','err').error(err);
                        res.status(500).send({message: 'Error de sistema', error: err});
                    }
                    else{  //Si es que devuelve algo
                        if(recordset[0].PERMISO == 1){
                            console.tag('app/Server/drivers/mssql.server.driver.js','hasAuthorization','message')
                                         .log('Usuario '+ req.session.passport.user.username +' tiene el permiso '+ permiso);
                            return next();
                        }
                        else if(recordset[0].PERMISO==0){
                            console.tag('app/Server/drivers/mssql.server.driver.js','hasAuthorization','message')
                                         .log('Usuario '+ req.session.passport.user.username +' no esta autorizado. No tiene el permiso '+ permiso);
                            return res.status(403).json({message:'Usuario '+ req.session.passport.user.username +' no esta autorizado. No tiene el permiso '+ permiso});
                        }
                        else{
                            console.tag('app/Server/drivers/mssql.server.driver.js','hasAuthorization','message')
                                         .Log('Error de datos de consistencia de datos para el usuario '+ req.session.passport.user.username+ ' para el permiso ' + permiso);

                        return res.status(500).json({message:'Error de datos de consistencia de datos para el usuario '+ req.session.passport.user.username+ ' para el permiso ' + permiso,
                                                                                    recordset: recordset[0],
                                                                                    error: err });
                        }
                    } //cierre de else
                });//cierre de request.query(...)
            }
        }else{
            console.tag('hasAuthorization').Warning("No hay usuario");
            return res.status(500).send({message: 'No se tiene usuario'});  
    	}// cierre hay o no usuario
    }
};

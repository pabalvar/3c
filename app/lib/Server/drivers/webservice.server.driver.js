'use strict';

var http = require('http', 'dont-enclose')/*,
    console= process.console*/;



exports.executeQuery= function(req, res, next){


    var query= req.consultaBD,
        queryURI= encodeURIComponent(query);

    var mode= 'cursor',
        url= '/getJSON?' + mode + '=' + queryURI ;

   // console.tag('WEBSRV','URL').log(url);

    var options = {
            host: 'localhost',
            port: 8081,
            path: url,
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            }
        };

    var requestWbsrv = http.request(options, function(responseWbsrv) {

        responseWbsrv.setEncoding('utf8');
         var responseString = '';

        responseWbsrv.on('data', function (chunk) {
            console.log("body: " + chunk);
             responseString += chunk;
        });

        responseWbsrv.on('end', function() {
            var resultObject = JSON.parse(responseString);
            console.log(resultObject);
            req.filas= resultObject;
            next();
        });

    });

    //Por si se recibe alguna exception no considerada
    requestWbsrv.on('error', function(error) {
        console.log(error);
        res.status(400).json({ error: 'Problema de conexion' });
    });

    requestWbsrv.end();

};



exports.response= function(req, res){

    res.json(req.filas);
};

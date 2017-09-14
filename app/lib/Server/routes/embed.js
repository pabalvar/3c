"use strict";

var _ = require('lodash');

/** Middleare para entregrar convertir parámetros de embed a objeto **/
module.exports = function (app) {
    app.use(function (req, res, next) {
        // catches: embed. Si viene separado por comas, lo convierte en array
        var ret;
        var query = req.query;
        if (query) {
            // si viene varias veces en URL bodyparser lo transforma en array
            if (typeof (query.embed) != 'undefined') {
                if (_.isArray(query.embed)) {
                    //console.log("es array");
                } else if (typeof (query.embed) == 'string') { // si viene separado por comas URL = embed=def,asd,asd,
                    query.embed = query.embed.split(',');
                }
                ret = _.keyBy(query.embed);
            }
        }
        //console.log("result >",ret,"<");
        if (ret) {
            req.query.embed = ret;
            req.embed = ret;
        }
        next();
    });
}
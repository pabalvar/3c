'use strict';

/*
 * Module dependencies. Dependencias propias al final
 */
var   _ = require('lodash'),
      stringify = require('json-stringify-safe'),
      console= process.console,
      Preferences= require('../queries/preferences.queries');


exports.list = function(req,res,next){
      var preferences= req.query;
      //console.log(req.query);
      req.consultaBD= Preferences.get(preferences);
      next();
};


exports.out= function(req, res){
      var output={
        data: req.filas,
        query: req.consultaBD,
        msg: req.msg

      }
      res.json(output);
};

exports.preferenceId= function (req, res, next,id){
   req.preferenceId= id;
   next();
};
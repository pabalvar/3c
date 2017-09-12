'use strict';

/*
 * Module dependencies. Dependencias propias al final
 */
var   _ = require('lodash'),
      stringify = require('json-stringify-safe'),
      console= process.console,
      Empresas= require('../queries/empresas.queries');


exports.list = function(req,res,next){
      var empresas=[];

      if(req.query.empresas){
        empresas= JSON.parse(req.query.empresas);
      }
      //Si la entrada, debe considerar el resultado de un query resuelta anterior
      else if(req.filas){
        req.filas.forEach(function(elem){
          empresas.push(elem.empresa)
        })
      }
       
      req.consultaBD= Empresas.get(empresas);
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

exports.empresaId= function (req, res, next,id){
   req.empresaId= id;
   next();
};
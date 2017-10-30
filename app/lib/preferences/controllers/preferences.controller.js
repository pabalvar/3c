'use strict';

var   PreferencesDB= require('../queries/preferences.queries');

exports.getPreference = function(req,res,next){
      req.consultaBD= PreferencesDB.getPreferencesQuery(req.query,req.pagination);
      next();
};

exports.getEmpresas = function(params){
      var params = params||{}
      params.variable=params.variable||"canAccess";
      params.module=params.module||"RRHH";

      return PreferencesDB.getPreferencesQuery(params,{setFields:'EMPRESA'});
}


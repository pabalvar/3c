'use strict';

var   PreferencesDB= require('../queries/preferences.queries');

exports.getPreference = function(req,res,next){
      req.consultaBD= PreferencesDB.getPreferencesQuery(req.query,req.pagination);
      next();
};


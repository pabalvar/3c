"use strict";

var globals = require('../../../../app/lib/globals/controllers/globals.js');
var _ = require("lodash");
/** Middleare para normalizar parámetros de query de la URL **/
module.exports = function(app) {
    // Convierte parámetros de URL en forma segura
    app.use(globals.urlParams);
}
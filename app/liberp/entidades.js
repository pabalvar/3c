'use strict';

var SQLcast = require('../lib/random_lib/castSQL').SQLcast;

/** GET **/
exports.getEntidades = getEntidades;


// Detalle de implementación
function getEntidades(req, res, next) {
  req.query.tiposuc = req.query.tiposuc||true; // por defecto P
    req.consultas.entidades = SQLcast(getEntidadesQuerySQL(), req.query, req.pagination);
    next();
}

function getEntidadesQuerySQL(){
 return `
-->> select
SELECT 
  TIEN,
  TRIM(KOEN) as KOEN,
  TRIM(SUEN) as SUEN,
  TRIM(NOKOEN) as NOKOEN,
  TIPOSUC
-->> from
FROM 
  MAEEN
-->> where
WHERE 1=1
  AND TIEN IN ( 'C','A' )--<< tien
  AND TIPOSUC in ('P')--<< tiposuc
  AND KOEN in ('SISTEMICA')--<< koen
-->> order  
ORDER BY 
  KOEN , SUEN 
 `; 
}
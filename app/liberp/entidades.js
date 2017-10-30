'use strict';

var SQLcast = require('../lib/random_lib/castSQL').SQLcast;

exports.getEntidades = getEntidades;


// Detalle de implementación
function getEntidades(req, res, next) {
  // en este contecto req.params.id es koen
  if (req.params.id) req.query.koen = req.params.id;

  req.query.tiposuc = req.query.tiposuc || true; // por defecto P
  req.consultas.entidades = SQLcast(getEntidadesQuerySQL(), req.query, req.pagination);
  next();
}

function getEntidadesQuerySQL() {
  return `
 -- Búsqueda global 
 declare @search varchar(1000)
 set @search = '%'+'texto'--<< search
 set @search = UPPER(@search)+'%'

-->> select
SELECT 
    TIEN,
    RTRIM(KOEN) as KOEN,
    RTRIM(SUEN) as SUEN,
    RTRIM(NOKOEN) as NOKOEN,
  TIPOSUC
-->> from
FROM 
  MAEEN
-->> where
WHERE 1=1
  AND KOEN in ('SISTEMICA')--<< koen
  AND TIEN IN ( 'C','A' )--<< tien
  AND TIPOSUC in ('P')--<< tiposuc
  AND UPPER( COALESCE(KOEN, '')+COALESCE(NOKOEN, '') ) like @search --<< search?
-->> order  
ORDER BY 
  KOEN, SUEN 
 `;
}
'use strict';

var SQLcast = require('../lib/random_lib/castSQL').SQLcast;

/** GET **/
exports.getMonedas = getMonedas;


// Detalle de implementación
function getMonedas(req, res, next) {
    var hoy = new Date();
    req.query.fechaHoy = hoy.toISOString().slice(0,10);
    req.consultas.monedas = SQLcast(getMonedasQuerySQL(), req.query, req.pagination);
    next();
}

function getMonedasQuerySQL(){
 return `
 -- Búsqueda global 
 declare @search varchar(1000)
 set @search = '%'+'texto'--<< search
 set @search = UPPER(@search)+'%'

-->> select
SELECT 
    KOMO,VAMO,NOKOMO  
-->> from
FROM 
    MAEMO
-->> where
WHERE 1=1
    AND FEMO = '2017-09-29'--<< fechaHoy 
    AND UPPER( COALESCE(KOMO, '')+COALESCE(NOKOMO, '') ) like @search --<< search?
-->> order  
ORDER BY 
    IDMAEMO 
 `; 
}
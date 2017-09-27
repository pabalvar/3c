'use strict';

var SQLcast = require('../lib/random_lib/castSQL').SQLcast;

/** GET PAGOS **/
exports.getDocumentos = getDocumentos;
exports.getDeudas = getDeudas;

function getDocumentos(req, res, next) {
  req.query.koen = req.query.id;
  //req.query.tiposuc = req.query.tiposuc||true; // por defecto P
  req.consultas.documentos = SQLcast(getDocumentosQuerySQL(), req.query, req.pagination);
    next();
}

// Detalle de implementación
function getDeudas(req, res, next) {
  req.query.koen = req.params.id;
  //req.query.tiposuc = req.query.tiposuc||true; // por defecto P
  req.consultas.documentos = SQLcast(getDocumentosQuerySQL(), req.query, req.pagination);
    next();
}

function getDocumentosQuerySQL(){
 return `
 -- Búsqueda global 
 declare @search varchar(1000)
 set @search = '%'+'texto'--<< search
 set @search = UPPER(@search)+'%'

-->> select
SELECT 
  EDO.IDMAEEDO,EDO.EMPRESA, EDO.TIDO, EDO.NUDO, EDO.ENDO, EDO.SUENDO, 
  EDO.MODO, EDO.TIMODO, EDO.TAMODO, EDO.ESPGDO, EDO.FEULVEDO, 
  ROUND(EDO.VABRDO,2) AS VABRDO, ROUND(EDO.VAABDO,2) AS VAABDO, 
  ROUND(EDO.VAIVARET,2) AS VAIVARET, ROUND(EDO.VAIVDO,2) AS VAIVDO, 
  ROUND(EDO.VANEDO,2) AS VANEDO,EDO.BLOQUEAPAG  
-->> from
FROM 
  MAEEDO AS EDO  
-->> where
WHERE 1=1
  and EDO.EMPRESA = '01'--<< idEmpresa
  and EDO.ENDO='001gino'--<< koen
  and EDO.TIDO IN ('BLV','BSV','BLX','FCV','FDB','FDV','FDX','FDZ','FEV','FVL','FVT','FVX','FXV','FYV','FVZ','RIN','ESC','FEE','FDE','NCC','NCB')--<< tipoDocumento
  AND EDO.ESPGDO = 'P'--<< espgdo
  AND EDO.NUDONODEFI = 0--<< NUDONODEFI
-->> order  
ORDER BY 
  EDO.TIDO,EDO.NUDO
 `; 
}
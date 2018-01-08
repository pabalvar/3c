'use strict';

var SQLcast = require('../lib/random_lib/castSQL').SQLcast;

exports.getEntidades = getEntidades;
exports.getMetaEntidades = getMetaEntidades;


// Detalle de implementación
function getEntidades(req, res, next) {
  // en este contecto req.params.id es koen
  if (req.params.id) req.query.koen = req.params.id;

  req.query.tiposuc = req.query.tiposuc || true; // por defecto P
  req.addquery(SQLcast(getEntidadesQuerySQL(), req.query, req.pagination), 'entidades');
  if (next) next();
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
    LTRIM(RTRIM(KOEN)) as KOEN,
    LTRIM(RTRIM(SUEN)) as SUEN,
    LTRIM(RTRIM(NOKOEN)) as NOKOEN,
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

// Entrega metadatos
function getMetaEntidades(req, res, next) {
  req.add(getEntidadesMeta(), 'entidades')
  req.add(getTipoEntidad(), 'tipoEntidad')
  next();
}
function getEntidadesMeta() {
  return [
    { field: "NOKOEN", name: "Nombre", visible: true, datatype: 'string:capitalize', nameprop: true },
    { field: "KOEN", name: "Código", visible: true, pk: true },
    { field: "TIEN", name: "Tipo", visible: true, datatype: 'lookup', tabla: 'tipoEntidad', options: { returnSrv: "id", returnClient: "name" } },
    { field: "SUEN", name: "Suc.", visible: true, pk: true }
  ]
};
function getTipoEntidad() {
  return [
    { id: "A", name: "Ambos" },
    { id: "P", name: "Proveedor" },
    { id: "C", name: "Cliente" }
  ]
}

'use strict';

var SQLcast = require('../../../../app/lib/random_lib/castSQL').SQLcast;

exports.getEmpresasQuery = getEmpresasQuery;

function getEmpresasQuerySQL() {
    return `
-->> select
SELECT
TRIM(EMPRESA) as EMPRESA,
TRIM(RAZON) as Razon, 
TRIM(RUT) as RUT, 
TRIM(NCORTO) as NombreCorto,
TRIM(DIRECCION) as Direccion,
TRIM(COMUNA) as Comuna,
TRIM(CIUDAD) as Ciudad,
TRIM(PAIS) as Pais, 
TRIM(TELEFONOS) as Fono, 
TRIM(GIRO) as Giro,
TRIM(RAZONAMP) as RazonAmpliada
-->> from
FROM
CONFIGP
-->> where
WHERE 1=1
AND EMPRESA in ('01')--<< empresa
`;
}

function getEmpresasQuery(params, output) {
    return SQLcast(getEmpresasQuerySQL(), params, output);
}



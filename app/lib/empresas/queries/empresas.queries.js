'use strict';

var SQLcast = require('../../../../app/lib/random_lib/castSQL').SQLcast;

exports.getEmpresasQuery = getEmpresasQuery;

function getEmpresasQuerySQL() {
    return `
-->> select
SELECT
LTRIM(RTRIM(EMPRESA)) as EMPRESA,
LTRIM(RTRIM(RAZON)) as Razon, 
LTRIM(RTRIM(RUT)) as RUT, 
LTRIM(RTRIM(NCORTO)) as NombreCorto,
LTRIM(RTRIM(DIRECCION)) as Direccion,
LTRIM(RTRIM(COMUNA)) as Comuna,
LTRIM(RTRIM(CIUDAD)) as Ciudad,
LTRIM(RTRIM(PAIS)) as Pais, 
LTRIM(RTRIM(TELEFONOS)) as Fono, 
LTRIM(RTRIM(GIRO)) as Giro,
LTRIM(RTRIM(RAZONAMP)) as RazonAmpliada
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



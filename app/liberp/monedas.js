'use strict';

var sql = require('../lib/random_lib/castSQL.js');

exports.getMonedas = getMonedas;
exports.getMetaMonedas = getMetaMonedas;


/* detalles de implementación **/

function getMonedas(req, res, next) {

    // en este contexto req.params.id es komo
    if (req.params.id) req.query.komo = req.params.id;

    // Obtener string SQL
    req.addquery(sql.SQLcast(getMonedasSQL(), req.query, req.pagination), 'monedas');

    if (next) next();
}

function getMonedasSQL() {
    return `
-->> select
SELECT
  LTRIM(RTRIM(KOMO)) as KOMO,
  TIMO,
  LTRIM(RTRIM(NOKOMO)) as NOKOMO,
  VAMO,
  FEMO
-->> from
FROM 
  TABMO 
-->> where
WHERE 1=1
  AND KOMO IN ('EUR')--<< komo
  AND TIMO IN ('E')--<< timo
-->> order
ORDER BY 
  KOMO
`}


function getMetaMonedas(req, res, next) {
    req.add(getMonedasMeta(), 'monedas');
    if (next) next();
}

function getMonedasMeta() {
    return [
        { field: "KOMO", name: "Código", pk: true, visible: true },
        { field: "TIMO", name: "Tipo", description: "Moneda N=Nacional E=Extranjera", visible: true, length: "1" },
        { field: "NOKOMO", name: "Nombre", description: "Nombre de moneda", visible: true },
        { field: "VAMO", name: "Valor", description: "Valor en moneda nacional", visible: false, datatype: 'number' },
        { field: "FEMO", name: "Fecha", description: "Fecha última tasa", visible: true, datatype: 'date' }
    ];
}



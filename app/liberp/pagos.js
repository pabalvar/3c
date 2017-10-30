'use strict';

var SQLcast = require('../lib/random_lib/castSQL').SQLcast;

exports.getPagos = getPagos;

// Detalle de implementación
function getPagos(req, res, next) {
    // en este contecto req.params.id es idmaedpce
    if (req.params.id) req.query.idmaedpce = req.params.id;

    // tidp por defecto es la lista abajo
    req.query.tidp = req.query.tidp||true;

    // variante: simple|complejo
    switch (req.query.variante) {
        case 'simple':
            req.query.variante = "AND (DPCE.ESPGDP<> 'N' AND DPCE.ESASDP = 'P')" + '/noquote';
            break;
        case 'general':
            req.query.variante = "AND ((DPCE.ESPGDP<> 'N' AND DPCE.ESASDP = 'P') OR ( DPCE.ESPGDP = 'P' OR DPCE.ESPGDP = 'R' ))" + '/noquote';
            break;
        default:
            req.query.variante = ''; // Necesario para que no inyecten SQL
    }

    req.consultas.pagos = SQLcast(getPagosQuerySQL(), req.query, req.pagination);
    next();
}

function getPagosQuerySQL() {
    return `
-->> select
SELECT 
DPCE.IDMAEDPCE,
DPCE.EMPRESA,
DPCE.TIDP, 
DPCE.NUDP, 
TRIM(DPCE.ENDP) AS ENDP, 
TRIM(DPCE.EMDP) AS EMDP, 
TRIM(DPCE.SUEMDP) AS SUEMDP,
TRIM(DPCE.CUDP) AS CUDP,
TRIM(DPCE.NUCUDP) AS NUCUDP, 
DPCE.FEEMDP, 
DPCE.FEVEDP, 
TRIM(DPCE.MODP) AS MODP,
DPCE.TIMODP, 
DPCE.TAMODP,
DPCE.VADP, 
DPCE.VAABDP, 
DPCE.VAASDP, 
DPCE.VAVUDP, 
DPCE.ESPGDP, 
TRIM(DPCE.REFANTI) AS REFANTI, 
TRIM(DPCE.ARCHIRSD) AS ARCHIRSD, 
DPCE.IDRSD
-->> from
FROM 
MAEDPCE AS DPCE 
-->> where
WHERE 1=1
AND DPCE.IDMAEDPCE IN ('192')--<< idmaedpce
AND DPCE.EMPRESA IN ('01')--<< empresa
AND DPCE.ENDP IN  ('001')--<< koen
AND DPCE.TIDP IN  ('ATB','CHV','CPV','CRV','DEP','EFV','LTV','PAV','RBV','RGV','RIV','TJV','VUE') --<< tidp
AND DPCE.ESASDP IN ('P')--<< esasdp
AND DPCE.ESPGDP IN ('N')--<< espgdp
AND ( DPCE.ESPGDP = 'P' OR DPCE.ESPGDP = 'R' ) --<< variante
-->> order
ORDER BY 
DPCE.FEEMDP
`}
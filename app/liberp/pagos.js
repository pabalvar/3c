'use strict';

var SQLcast = require('../lib/random_lib/castSQL').SQLcast;

exports.getPagos = getPagos;
exports.getMetaPagos = getMetaPagos;

// Detalle de implementación
function getPagos(req, res, next) {
    // en este contecto req.params.id es idmaedpce
    if (req.params.id) req.query.idmaedpce = req.params.id;

    // tidp por defecto es la lista abajo
    req.query.tidp = req.query.tidp || true;

    // variante: simple|complejo
    switch (req.query.variante) {
        case 'simple':
            req.query.variante = "AND (DPCE.ESPGDP<> 'N' AND DPCE.ESASDP = 'P')" + '/noquote';
            break;
        case 'deuda':
            req.query.variante = "( DPCE.ESPGDP = 'P' OR DPCE.ESPGDP = 'R' ))" + '/noquote'; // Pendiente o pRotestado
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
LTRIM(RTRIM(DPCE.ENDP)) AS ENDP, 
LTRIM(RTRIM(DPCE.EMDP)) AS EMDP, 
LTRIM(RTRIM(DPCE.SUEMDP)) AS SUEMDP,
LTRIM(RTRIM(DPCE.CUDP)) AS CUDP,
LTRIM(RTRIM(DPCE.NUCUDP)) AS NUCUDP, 
DPCE.FEEMDP, 
DPCE.FEVEDP, 
LTRIM(RTRIM(DPCE.MODP)) AS MODP,
DPCE.TIMODP, 
DPCE.TAMODP,
DPCE.VADP, 
DPCE.VAABDP, 
DPCE.VAASDP, 
DPCE.VAVUDP, 
DPCE.ESPGDP, 
LTRIM(RTRIM(DPCE.REFANTI)) AS REFANTI, 
LTRIM(RTRIM(DPCE.ARCHIRSD)) AS ARCHIRSD, 
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

// Entrega metadatos
function getMetaPagos(req, res, next) {
    req.resultados = req.resultados || {};
    req.resultados.meta = [
        { field: "IDMAEDPCE", name: "IDMAEDPCE", visible: false, pk: true },
        { field: "EMPRESA", readOnly: true, name: "Empresa", visible: false },
        { field: "TIDP", name: "TD", description: "Tipo documento", visible: true, length: "5", datatype: 'rtabla', tabla: 'FormasDePago', options: { returnSrv: "codigo", returnClient: "codigo" } },
        { field: "NUDP", name: "Número", description: "Número documento de pago", visible: false },
        { field: "ENDP", name: "Entidad", description: "Entidad documento de pago", visible: false },
        { field: "EMDP", name: "Emisor", description: "Emisor documento de pago (banco)", visible: false },
        { field: "SUEMDP", name: "Sucursal", description: "Plaza", visible: false },
        { field: "CUDP", name: "Cuenta", description: "Cuenta de banco", visible: false },
        { field: "NUCUDP", name: "Número", description: "Número de cheque o transferencia", visible: true, length: "10" },
        { field: "FEEMDP", name: "F. Emisión", visible: true, datatype: 'date', length: "8" },
        { field: "FEVEDP", name: "F. Vencim.", visible: true, datatype: 'date', length: "8" },
        { field: "MODP", name: "M", description: "Moneda", visible: true, length: "1", onInit: () => '$' },
        { field: "TIMODP", name: "Tipo moneda", description: "Nacional (N) o extranjera (E)", visible: false },
        { field: "TAMODP", name: "Tasa de cambio", visible: false },
        { field: "VADP", name: "Monto", visible: true, datatype: 'number', length: "10" },
        //{ field: "VAABDP", name: "Abono", description: "Abono anterior asignado", visible: false, datatype: 'number' },
        { field: "VAASDP", name: "Asignado (anterior)", description: "Asignado (anterior)", visible: false, datatype: 'number' },
        { field: "VAASDPN", name: "Asignado", description: "Asignado (nuevo)", visible: false, datatype: 'number' },
        { field: "SALDODP", name: "Saldo", description: "Disponible", readOnly: true, visible: true, datatype: 'number', length: "10" },
        { field: "VAVUDP", name: "Vuelto", description: "Vuelto", visible: false, datatype: 'number' },
        { field: "ESPGDP", name: "Estado", description: "Estado de pago del documento de pago (Pendiente,Cancelado,Nulo)", visible: false },
        { field: "REFANTI", name: "Referencia", visible: false },
        { field: "ARCHIRSD", name: "ARCHIRSD", visible: false },
        { field: "IDRSD", name: "IDRSD", visible: false }
    ];
    req.resultados.rtablas = { FormasDePago: getFormasDePago('ventas') }
    next();
}

function getFormasDePago(tipo) {
    var ret;
    if (tipo == "ventas") {
        ret = [
            { 'TIDPEN': 'EF', 'codigo': 'EFV', 'nombre': 'EFECTIVO' },
            { 'TIDPEN': 'CH', 'codigo': 'CHV', 'nombre': 'CHEQUE BANCARIO' },
            { 'TIDPEN': 'TJ', 'codigo': 'TJV', 'nombre': 'TARJETA DE CREDITO' },
            { 'TIDPEN': 'LT', 'codigo': 'LTV', 'nombre': 'LETRA DE CAMBIO' },
            { 'TIDPEN': 'PA', 'codigo': 'PAV', 'nombre': 'PAGARE DE CREDITO' },
            { 'TIDPEN': 'DE', 'codigo': 'DEP', 'nombre': 'PAGO POR DEPOSITO' },
            { 'TIDPEN': 'AT', 'codigo': 'ATB', 'nombre': 'TRANSFERENCIA BANCARIA' }
        ];
    }
    else {
        ret = [
            { 'TIDPEN': 'EF', 'codigo': 'EFC', 'nombre': 'EFECTIVO' },
            { 'TIDPEN': 'CH', 'codigo': 'CHC', 'nombre': 'CHEQUE EMPRESA' },
            { 'TIDPEN': 'TJ', 'codigo': 'TJC', 'nombre': 'TARJETA DE CREDITO' },
            { 'TIDPEN': 'LT', 'codigo': 'LTC', 'nombre': 'LETRA DE CAMBIO' },
            { 'TIDPEN': 'PA', 'codigo': 'PAC', 'nombre': 'PAGARE DE CREDITO' },
            { 'TIDPEN': 'PT', 'codigo': 'PTB', 'nombre': 'TRANSFERENCIA BANCARIA' }
        ];
    }
    return { data: ret };
}
'use strict';

var SQLcast = require('../lib/random_lib/castSQL').SQLcast;

exports.getDocumentos = getDocumentos;
exports.traeDeuda = traeDeuda;
exports.getMetaDeuda = getMetaDeuda;

// Detalle de implementación
function getDocumentos(req, res, next) {
  // en este contecto req.params.id es idmaeedo
  if (req.params.id) req.query.idmaeedo = req.params.id;

  req.consultas.documentos = SQLcast(getDocumentosQuerySQL(), req.query, req.pagination);
  next();
}

function traeDeuda(req, res, next) {
  req.query.tido = ['BLV', 'BSV', 'BLX', 'FCV', 'FDB', 'FDV', 'FDX', 'FDZ', 'FEV', 'FVL', 'FVT', 'FVX', 'FXV', 'FYV', 'FVZ', 'RIN', 'ESC', 'FEE', 'FDE', 'NCC', 'NCB'];
  req.query.espgdo = 'P';
  req.query.nudonodefi = 0;
  req.consultas.documentos = SQLcast(getDocumentosQuerySQL(), req.query, req.pagination);
  next();
}

function getDocumentosQuerySQL() {
  return `
  -->> select
 SELECT 
   EDO.IDMAEEDO,
   EDO.EMPRESA, 
   LTRIM(RTRIM(EDO.TIDO)) as TIDO, 
   LTRIM(RTRIM(EDO.NUDO)) as NUDO, 
   LTRIM(RTRIM(EDO.ENDO)) as ENDO, 
   LTRIM(RTRIM(EDO.SUENDO)) as SUENDO, 
   LTRIM(RTRIM(EDO.MODO)) as MODO, 
   EDO.TIMODO, 
   EDO.TAMODO, 
   EDO.ESPGDO, 
   EDO.FEULVEDO, 
   ROUND(EDO.VABRDO,2) AS VABRDO, 
   ROUND(EDO.VAABDO,2) AS VAABDO, 
   ROUND(EDO.VAIVARET,2) AS VAIVARET, 
   ROUND(EDO.VAIVDO,2) AS VAIVDO, 
   ROUND(EDO.VANEDO,2) AS VANEDO,
   EDO.BLOQUEAPAG  
 -->> from
 FROM 
   MAEEDO AS EDO  
 -->> where
 WHERE 1=1
   and EDO.IDMAEEDO = '12354'--<< idmaeedo
   and EDO.EMPRESA in ('01')--<< empresa
   and EDO.ENDO in ('001gino')--<< koen
   and EDO.TIDO IN ('BLV','BSV','BLX','FCV','FDB','FDV','FDX','FDZ','FEV','FVL','FVT','FVX','FXV','FYV','FVZ','RIN','ESC','FEE','FDE','NCC','NCB')--<< tido
   AND EDO.ESPGDO = 'P'--<< espgdo
   AND EDO.NUDONODEFI = 0--<< nudonodefi
 -->> order  
 ORDER BY 
   EDO.TIDO,EDO.NUDO
  `;
}

// Entrega metadatos
function getMetaDeuda(req, res, next) {
  req.resultados = req.resultados || {};
  req.resultados.meta = [
    { field: "IDMAEEDO", name: "IDMAEEDO", visible: false, pk: true },
    { field: "EMPRESA", name: "Emp.", description: "Empresa", visible: false },
    { field: "TIDO", name: "DP", description: "Tipo documento", visible: true, length: '3' },
    { field: "NUDO", name: "Número", visible: true, length: '10' },
    { field: "SUENDO", name: "Suc.", visible: false },
    { field: "TIMODO", name: "Timodo", visible: false },
    { field: "TAMODO", name: "Tamodo", visible: false },
    { field: "ESPGDO", name: "Estado doc.", visible: false, length: '1', datatype: 'rtabla', tabla: 'EstadoPago', options: { returnSrv: "id", returnClient: "name" } },
    { field: "FEULVEDO", name: "F. Vencim.", visible: true, length: '8', datatype: 'date' },
    { field: "MODO", name: "M", description: "Moneda", length: '1', visible: true },
    { field: "VABRDO", name: "Valor doc.", visible: true, length: '10', datatype: 'number' },
    { field: "VAABDO", name: "Saldo ant.", visible: true, length: '10', datatype: 'number' },
    { field: "VAIVARET", name: "Valor IVA ret.", visible: false, datatype: 'number' },
    { field: "VAIVDO", name: "Valor IVA doc.", visible: false, datatype: 'number' },
    { field: "VANEDO", name: "Valor neto doc.", visible: false, datatype: 'number' },
    { field: "BLOQUEAPAG", name: "Bloquea pago", visible: false },
    { field: "ASIGEDO", name: "Abono", visible: true, length: '10', datatype: 'number' },
    { field: "SALDOEDO", name: "Saldo", visible: true, length: '10', datatype: 'number' }
  ];
  req.resultados.rtablas = { EstadoPago: getEstadoPago() }
  next();
}

function getEstadoPago() {
  return { data: [{ id: "P", name: "Pendiente" }] }
}
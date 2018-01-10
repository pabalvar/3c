'use strict';

var SQLcast = require('../lib/random_lib/castSQL').SQLcast;

exports.getCuentas = getCuentas;
exports.getMetaCuentas = getMetaCuentas;


// Detalle de implementación
function getCuentas(req, res, next) {
  // en este contecto req.params.id es koen
  if (req.params.id) req.query.koen = req.params.id;
  // datos en res.cuentas
  req.addquery(SQLcast(getCuentasQuerySQL(), req.query, req.pagination), 'cuentas');

  // Si viene query.embed.entidadesPagos
  if (req.embed.entidadesPago) getEntidadesPago(req,res);

  if (next) next();
}

function getCuentasQuerySQL() {
  return `
-->> select
SELECT 
  LTRIM(RTRIM(M.KOEN)) as KOEN,
  M.TIPOPAGO as TIPOPAGO,
  LTRIM(RTRIM(M.EMISOR)) as EMISOR,
  LTRIM(RTRIM(M.CUENTA)) as CUENTA,
  LTRIM(RTRIM(M.RUT)) as RUT,
  LTRIM(RTRIM(M.NORUT)) as NORUT,
  LTRIM(RTRIM(M.BLOQUEADA)) as BLOQUEADA,
  LTRIM(RTRIM(M.SUCURSAL)) as SUCURSAL,
  LTRIM(RTRIM(E.NOKOENDP)) as NOKOENDP 
-->> from
FROM 
  MAEENCTA M
  LEFT JOIN TABENDP AS E ON 
    E.TIDPEN=LEFT(M.TIPOPAGO,2) 
    AND E.KOENDP=M.EMISOR 
    AND E.SUENDP=M.SUCURSAL
-->> where
WHERE 1=1
  AND E.EMPRESA = '01'--<< empresa
  AND M.KOEN = '76321731'--<< koen
  AND M.TIPOPAGO = 'CHV'--<< tidp
  AND M.BLOQUEADA = 0
-->> order  
ORDER BY 
  E.NOKOENDP 
 `;
}

function getEntidadesPago(req, res, next){
  req.addquery(SQLcast(getEntidadesPagoSQL(), req.query, req.pagination), 'entidadesPago');
  if (next) next();
}

function getEntidadesPagoSQL(){
  return `
  -- Búsqueda global 
  declare @search varchar(1000)
  set @search = '%'+'texto'--<< search
  set @search = UPPER(@search)+'%'

  --Truco: trim para usar tidp(char3) para filtrar tidpen (char2)
  declare @tidp varchar(3)
  set @tidp = 'CHV'--<< tidp

  -->> select
  SELECT 
    EMPRESA,
    LTRIM(RTRIM(KOENDP)) as KOENDP,
    LTRIM(RTRIM(SUENDP)) as SUENDP,
    TIDPEN,
    LTRIM(RTRIM(KOTEENDP)) as KOTEENDP,
    LTRIM(RTRIM(NOKOENDP)) as NOKOENDP,
    LTRIM(RTRIM(CONTAB)) as CONTAB,
    LTRIM(RTRIM(SUBAUXI)) as SUBAUXI,
    LTRIM(RTRIM(CONTABVTA)) as CONTABVTA,
    LTRIM(RTRIM(SUBAUXIVTA)) as SUBAUXIVTA,
    LTRIM(RTRIM(CTACTE)) as CTACTE,
    LTRIM(RTRIM(KOENDPPIA)) as KOENDPPIA,
    LTRIM(RTRIM(NUCHLT)) as NUCHLT,
    --NUCHLTINI,CMESAP,CONTABDON,SUBAUXIDON,CULEY20956
  -->> from
  FROM 
    TABENDP
  -->> where
  WHERE 1=1
    AND EMPRESA = '01'--<< empresa
    AND KOENDP = '001'--<< koendp
    AND TIDPEN = LEFT(@tidp,2) --<< tidp?
    AND UPPER( COALESCE(KOENDP, '')+COALESCE(NOKOENDP, '') ) like @search --<< search?
  -->> order  
  ORDER BY 
    KOENDP
  `; 
}

// Entrega metadatos
function getMetaCuentas(req, res, next) {
  req.add(getCuentasMeta(), 'cuentas')
  next();
}
function getCuentasMeta() {
  return [
    { field: "KOEN", name: "Código entidad", visible: true, fk:"MAEEN.KOEN" },
    { field: "TIPOPAGO", name: "Tipo pago", visible: true, fk:"TABENDP.TIDPEN" },
    { field: "EMISOR", name: "Emisor", visible: true, fk:"TABENDP.KOENDP" },
    { field: "CUENTA", name: "Número de cuenta", visible: true },
    { field: "RUT", name: "RUT titular", visible: true },
    { field: "NORUT", name: "Nombre titular", visible: true },
    { field: "BLOQUEADA", name: "Bloqueada", visible: true },
    { field: "SUCURSAL", name: "Sucursal", visible: true, fk:"TABENDP.SUENDP" },
  ]
};

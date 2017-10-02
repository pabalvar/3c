'use strict';

var SQLcast = require('../lib/random_lib/castSQL').SQLcast;

/** GET **/
exports.getMonedas = getMonedas;
exports.getFormasDePago = getFormasDePago;
exports.getParamsFuncionario = getParamsFuncionario;
exports.getEmisoresDocumento = getEmisoresDocumento;

function getParamsFuncionario(req, res, next){
    req.consultas.paramFuncionario = SQLcast(getParamsFuncionarioQuerySQL(), req.query, req.pagination);
    next();
}

function getEmisoresDocumento(req, res, next){
    req.consultas.emisores = SQLcast(getEmisoresDocumentoSql(), req.query, req.pagination);
    next();
}

// Detalle de implementación
function getMonedas(req, res, next) {''
    var hoy = new Date();
    req.query.fechaHoy = hoy.toISOString().slice(0,10);
    req.consultas.monedas = SQLcast(getMonedasQuerySQL(), req.query, req.pagination);
    next();
}

function getFormasDePago(req, res, next) {
    if(req.query.tipo == "ventas"){
        var formasDePago = ["EFV EFECTIVO","CHV CHEQUE BANCARIO","TJV TARJETA DE CREDITO","LTV LETRA DE CAMBIO",
                            "PAV PAGARE DE CREDITO","DEP PAGO POR DEPOSITO","ATB TRANSFERENCIA BANCARIA" ];
    }
    else {
        var formasDePago = ["EFC EFECTIVO","CHC CHEQUE EMPRESA ","TJC TARJETA DE CREDITO","LTC LETRA DE CAMBIO",
                            "PAC PAGARE DE CREDITO","PTB TRANSFERENCIA BANCARIA" ];
    }
    req.data = formasDePago;
    next();
}

function getEmisoresDocumentoSql(){
    return `
   -->> select
   SELECT 
        EMISOR.EMPRESA, EMISOR.KOENDP, EMISOR.SUENDP, EMISOR.TIDPEN, EMISOR.KOTEENDP, EMISOR.NOKOENDP
   -->> from
   FROM 
        TABENDP EMISOR
   -->> where
   WHERE 1=1
        AND EMISOR.TIDPEN=UPPER('CH')--<< tipoDocumento
    `; 
   }

function getParamsFuncionarioQuerySQL(){
    return `
   -->> select
   SELECT 
        CONF.ESUCURSAL, CONF.EBODEGA, CONF.ECAJA, CONF.ELISTAVEN, CONF.ELISTACOM, CONF.NLISTACOM, CONF.ELISTAINT, CONF.NLISTAINT, CONF.DIASMAXPAG
   -->> from
   FROM 
        CONFIEST CONF
   -->> where
   WHERE 1=1
        AND CONF.EMPRESA='01'--<< idEmpresa
        AND CONF.MODALIDAD='VENTA'--<< modalidad
    `; 
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
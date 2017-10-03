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
        var formasDePago = [
                                    { 'TIDPEN' : 'EF', 'codigo': 'EFV', 'nombre': 'EFECTIVO' } ,
                                    { 'TIDPEN' : 'CH', 'codigo': 'CHV', 'nombre': 'CHEQUE BANCARIO'  } ,
                                    { 'TIDPEN' : 'TJ', 'codigo': 'TJV', 'nombre': 'TARJETA DE CREDITO'   } ,
                                    { 'TIDPEN' : 'LT', 'codigo': 'LTV', 'nombre': 'LETRA DE CAMBIO'   } ,
                                    { 'TIDPEN' : 'PA', 'codigo': 'PAV', 'nombre': 'PAGARE DE CREDITO'   } ,
                                    { 'TIDPEN' : 'DE', 'codigo': 'DEP', 'nombre': 'PAGO POR DEPOSITO'   } ,
                                    { 'TIDPEN' : 'AT', 'codigo': 'ATB', 'nombre': 'TRANSFERENCIA BANCARIA'   }
                                ];
    }
    else {
        var formasDePago =  [
                                        { 'TIDPEN' : 'EF', 'codigo': 'EFC', 'nombre': 'EFECTIVO' } ,
                                        { 'TIDPEN' : 'CH', 'codigo': 'CHC', 'nombre': 'CHEQUE EMPRESA'  } ,
                                        { 'TIDPEN' : 'TJ', 'codigo': 'TJC', 'nombre': 'TARJETA DE CREDITO'   } ,
                                        { 'TIDPEN' : 'LT', 'codigo': 'LTC', 'nombre': 'LETRA DE CAMBIO'   } ,
                                        { 'TIDPEN' : 'PA', 'codigo': 'PAC', 'nombre': 'PAGARE DE CREDITO'   } ,
                                        { 'TIDPEN' : 'PT', 'codigo': 'PTB', 'nombre': 'TRANSFERENCIA BANCARIA'   } 
                                    ];
    }
    req.data = formasDePago;
    next();
}

function getEmisoresDocumentoSql(){
    return `
   -->> select
   SELECT 
        EMISOR.EMPRESA, LTRIM(RTRIM(EMISOR.KOENDP)) as KOENDP, LTRIM(RTRIM(EMISOR.SUENDP)) as SUENDP, EMISOR.TIDPEN,
        LTRIM(RTRIM(EMISOR.KOTEENDP)) as KOTEENDP, LTRIM(RTRIM(EMISOR.NOKOENDP)) as NOKOENDP
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
    LTRIM(RTRIM(KOMO)) AS KOMO, LTRIM(RTRIM(VAMO)) AS VAMO, LTRIM(RTRIM(NOKOMO)) as NOKOMO  
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
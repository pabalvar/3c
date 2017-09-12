'use strict';

var squel = require('squel').useFlavour('mssql'),
    SQLcast= require('../../../../app/lib/random_lib/castSQL').SQLcast,
    console= process.console;

var getEmpresaQuery = function(){
return `
SELECT
RTRIM(LTRIM(EMPRESA)) as EMPRESA,
RTRIM(LTRIM(RAZON)) as Razon, 
RTRIM(LTRIM(RUT)) as RUT, 
RTRIM(LTRIM(NCORTO)) as NombreCorto,
RTRIM(LTRIM(DIRECCION)) as Direccion,
RTRIM(LTRIM(COMUNA)) as Comuna,
RTRIM(LTRIM(CIUDAD)) as Ciudad,
RTRIM(LTRIM(PAIS)) as Pais, 
RTRIM(LTRIM(TELEFONOS)) as Fono, 
RTRIM(LTRIM(GIRO)) as Giro,
RTRIM(LTRIM(RAZONAMP)) as RazonAmpliada
FROM
CONFIGP
WHERE
EMPRESA = '01'--<< empresa
`;
}

var getEmpresa = function(params,output){
    // Check required params
    if (!params.empresa) return 0;
    
    return SQLcast(getEmpresaQuery(),params,output);
}
exports.getEmpresa = getEmpresa;

exports.get = function(EMPRESASID){
    var querie= squel.select()
                  .field('NCORTO', 'name')
                  .field('EMPRESA', 'id')
                  .from('CONFIGP')
                  .order('EMPRESA');

    var expr= squel.expr();
        expr.or('EMPRESA=?','-1');
    if(EMPRESASID.length>0){
        EMPRESASID.forEach(function(elem){
            expr.or('EMPRESA=?',elem);
        });
    }
    querie.where(expr);  
    return  querie.toString();
};


exports.getTmpl = function(EMPRESASID){

    //ToDo filtrar por EMPRESASID y ver que variables necesito
    var r = SQLcast(`
        SELECT 
            NCORTO,
            EMPRESA
        FROM CONFIGP
    `,{});
    
    return r;
       
};

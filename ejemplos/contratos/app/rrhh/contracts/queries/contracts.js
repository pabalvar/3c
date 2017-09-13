'use strict';

var RandomLib = require('../../../../app/lib/random_lib/castSQL');
var SQLcast = RandomLib.SQLcast;
var SQLexpr = RandomLib.SQLexpr;
var sp = require('../queries/contracts.searchParams.js');
var _ = require('lodash');

// Estructura de tablas
const XCONTRAT = ['UIDXCONTRAT', 'UIDXPERSON', 'FECHAINI', 'FECHAFIN', 'UIDXCONTXT', 'KOCON', 'EMPRESA', 'CODCAUSAL', 'EVALUACION'];

/** CRUD **/

// GET
var getContractsQuerySQL = `
-->> select
SELECT 
--contrato
   XC.UIDXCONTRAT as UIDXCONTRAT
  ,XC.KOCON as KOCON
  ,CONVERT(varchar(10),XC.FECHAINI,21) AS FECHAINI
  ,CONVERT(varchar(10),XC.FECHAFIN,21) as FECHAFIN
  ,XC.EMPRESA as EMPRESA
  ,XC.CODCAUSAL as CODCAUSAL
  ,CASE WHEN XC.FECHAFIN > '20980101' THEN 1 ELSE 0 END as indefinido
--append persona
  ,XP.RUT as RUT
  ,XP.UIDXPERSON as UIDXPERSON
  ,XP.SEX as SEX
  ,XP.NACION as NACION
  ,XP.FONOPRIV as FONOPRIV
  ,CONVERT(varchar(10),XP.FNAC,21) as FNAC
--append login
  ,XP.EMAIL as EMAIL
  ,XP.NOMBRE AS NOMBRE
  ,XP.APPP AS APPP
  ,XP.APPM AS APPM
  ,(select TOP 1 VALPRIN from XPERSED X where X.UIDXCONTRAT = XC.UIDXCONTRAT and KOCO = 'CX_TIPOCON' order by X.FECHAFIN desc) as TIPOCON  --<< tipocon?
-->> from
FROM 
  XPERSON AS XP
  LEFT JOIN XCONTRAT AS XC ON XP.UIDXPERSON = XC.UIDXPERSON
-->> where
WHERE
0=0

-- Filtro texto libre (textFilter)
AND (UPPER(COALESCE(XP.NOMBRE, '')+COALESCE(XC.KOCON, '')) like UPPER('%'+'Z'+'%')) --<< textFilter

-- Filtro ID Personas (personas)
AND XP.UIDXPERSON in ('25CD38CC-16BB-41B4-8FD6-003E58811994')--<< personas

-- Filtro RUT
AND XP.RUT in ('134545969-6')--<< rut

-- Filtro ID contrato (contratos)
AND XC.UIDXCONTRAT in ('25CD38CC-16BB-41B4-8FD6-003E58811994')--<< contratos

-- Filtro Código contrato (kocon)
AND XC.KOCON in ('1234')--<< kocon

-- Filtro comodín GUID en uidxpersonas y/o uidxcontrat
AND ( --<< uuid?
XP.UIDXPERSON in ('25CD38CC-16BB-41B4-8FD6-003E58811994')--<< uuid
OR XC.UIDXCONTRAT in ('25CD38CC-16BB-41B4-8FD6-003E58811994')--<< uuid
) --<< uuid?

-- Filtro Empresa (en searchParams)
AND XC.EMPRESA = '01'--<< depempresa

-- Filtro Empresa (en query)
AND XC.EMPRESA = '01'--<< empresa

-- Filtro liquidación emitida (emitidaQ)
AND (5=5)--<< emitidaQ


-- Filto liquidación errónea (erroneaQ)
AND (6=6)--<< erroneaQ

--Filtro clases (claseFilter)
AND XC.KOCON in (select KOCON from XPERSED D where KOCON = XC.KOCON and D.FECHAINI < '20160801' and D.FECHAFIN > '20160801' and KOCO = 'H_SUELDO') --<< claseFilter

-- Filtro finiquito (fechainiFiniquito,fechafinFiniquito)
AND XC.FECHAFIN >= '20160801'--<< fechainiFiniquito
AND XC.FECHAFIN <= '20160830'--<< fechafinFiniquito

-- Filtro contratos activos en proceso abierto (proceso es boolean)
AND XC.FECHAINI <= (SELECT FTPROCESO FROM XPROCESO WHERE ESTADO = 'A') --<< proceso
AND XC.FECHAFIN >= (SELECT FIPROCESO FROM XPROCESO WHERE ESTADO = 'A') --<< proceso

-- Filtro contrato activo (fechaActivoFin,fechaActivoIni)
AND XC.FECHAINI <= '20160801'--<< fechaActivoFin
AND XC.FECHAFIN >= '20160801'--<< fechaActivoIni

-- Filtro contrato inactivo (fechaInactivoFin,fechaInactivoIni)
AND ( --<< inactivo
XC.FECHAFIN <= '20160801'--<< fechaInactivoIni
OR XC.FECHAINI >= '20160801'--<< fechaInactivoFin
) --<< inactivo


-- Filtro contrato no tiene todos los conceptos requeridos
AND XC.UIDXCONTRAT in             --<< incompleto?
 (SELECT T.UIDXCONTRAT FROM       --<< incompleto?                                    
   -- Producto cruz                                                
   (SELECT C.UIDXCONTRAT,N.KOCO FROM XCONTRAT C,XCLASEN N WHERE N.REQUERIDO=1) T   --<< incompleto?
   -- Conceptos asignados requeridos
   LEFT JOIN (SELECT C.UIDXCONTRAT,X.KOCO FROM XCONTRAT C   --<< incompleto?       
     INNER JOIN XPERSED X on C.UIDXCONTRAT = X.UIDXCONTRAT  --<< incompleto?     
     INNER JOIN XCLASEN N on N.KOCO = X.KOCO    --<< incompleto?                  
     WHERE N.REQUERIDO=1) A on A.UIDXCONTRAT = T.UIDXCONTRAT and A.KOCO = T.KOCO  --<< incompleto?
  WHERE A.KOCO is null)   --<< incompleto?

-->> order
  ORDER BY
  APPP
`;

exports.getContractsQuery = function (query, output) {
  var params = _.cloneDeep(query); // decouple
  _.merge(params, sp.decodeSearchParams(query));
  if ( (query.embed||{}).tipocon ) params.tipocon = true;

  return SQLcast(getContractsQuerySQL, params, output);
};

// CREATE, UPDATE, UPSERT
var createContractsQuerySQL = `
DECLARE @err varchar(4000)
DECLARE @updated int
DECLARE @created int
DECLARE @duplicated int
DECLARE @allow_update int
set @allow_update = 0
set @allow_update = 1 --<< allow_update
DECLARE @allow_create int
set @allow_create = 0
set @allow_create = 1 --<< allow_create

BEGIN TRY
  BEGIN TRANSACTION
    -- TABLA PASO usando RUT como FK (campos XCONTRAT+EXTRA )
    SELECT C.*, F.RUT INTO #XCONTRAT FROM XCONTRAT C, XPERSON F WHERE 1=0
    -- agregar campo TIPOCON de tipo numérico
    ALTER TABLE #XCONTRAT ADD TIPOCON int

    -- INSERT FROM JSON
    INSERT INTO #XCONTRAT 
      (UIDXCONTRAT, UIDXPERSON, FECHAINI, FECHAFIN, UIDXCONTXT, KOCON, EMPRESA, CODCAUSAL, EVALUACION, TIPOCON, RUT) --<< extended_fields
    VALUES
      ('KOCON','EMPRESA') --<< extended_values

    -- Si se usó RUT de llave, actualizar UIDXPERSON
    UPDATE #XCONTRAT
      SET UIDXPERSON = F.UIDXPERSON
    FROM XPERSON F
    WHERE #XCONTRAT.RUT = F.RUT
    
    -- Si se usó UIDXPERSON de llave, actualizar RUT
    UPDATE #XCONTRAT
      SET RUT = F.RUT
    FROM XPERSON F
    WHERE #XCONTRAT.UIDXPERSON = F.UIDXPERSON
    
    -- Si se usó KOCON de llave, actualizar
    UPDATE #XCONTRAT 
      SET UIDXCONTRAT = C.UIDXCONTRAT 
    FROM XCONTRAT C
    WHERE #XCONTRAT.KOCON = C.KOCON
       
    -- OBTENER CUANTOS SE MODIFICAN/INSERTAN
    -- modify: existe contrato y pertenece a la persona
    set @updated = (SELECT count(*) FROM #XCONTRAT S INNER JOIN XCONTRAT C on C.UIDXCONTRAT = S.UIDXCONTRAT AND C.UIDXPERSON = S.UIDXPERSON)
    -- insert: existe persona y no existe contrato
    set @created = (SELECT count(*) FROM #XCONTRAT S where S.UIDXPERSON in (select UIDXPERSON from XPERSON) and S.UIDXCONTRAT not in (SELECT UIDXCONTRAT FROM XCONTRAT))

    -- VALIDAR NO SE MODIFICA SI NO SE PERMITE
    IF (@updated>0 and @allow_update = 0)    
    BEGIN
      SET @err = '@REGISTRY_EXISTS:'
      SET @err += 'NO SE PUDO GRABAR.. Ya existe un contrato KOCON='+(SELECT top 1 A.KOCON FROM XCONTRAT A inner join #XCONTRAT B on A.UIDXCONTRAT = B.UIDXCONTRAT )  
      RAISERROR(@err,16,1); 
    END  

     -- VALIDAR NO INSERTA SI NO SE PERMITE
    IF (@created>0 and @allow_create = 0)    
    BEGIN
      SET @err = '@REGISTRY_NOT_EXIST:'
      SET @err += 'NO SE PUDO GRABAR. No existe el contrato que se quiere modificar KOCON='+(SELECT top 1 S.KOCON FROM #XCONTRAT S INNER JOIN XCONTRAT C on C.UIDXCONTRAT = S.UIDXCONTRAT AND C.UIDXPERSON = S.UIDXPERSON )  
      RAISERROR(@err,16,1); 
    END    


    -- Check: si se está en modo insert, no puede existir KOCO
    SET @duplicated = (SELECT count(*) FROM #XCONTRAT WHERE KOCON in (SELECT KOCON FROM XCONTRAT))
    IF (@duplicated > 0 and @allow_update = 0)
    BEGIN
       SET @err = '@JSON_LIST:'
       SET @err += (
         SELECT 
           KOCON,
           UIDXPERSON,
           'Ya existe un contrato KOCON={{KOCON}}. No se puede crear.' as message 
         FROM #XCONTRAT WHERE KOCON in (SELECT KOCON FROM XCONTRAT) 
         FOR JSON AUTO    
        )
      RAISERROR(@err,16,1); 
    END
      
     -- VALIDAR SI NO CREA NADA
    IF (@created=0 and @updated=0)    
    BEGIN
      SET @err = '@EMPTY_REQUEST:'
      SET @err += 'NO SE PUDO GRABAR. No se hicieron modificaciones'  
      RAISERROR(@err,16,1); 
    END  

    -- INSERTAR LOS QUE NO EXISTEN
    INSERT INTO XCONTRAT 
    (
      UIDXCONTRAT,UIDXPERSON,FECHAINI,FECHAFIN,UIDXCONTXT,KOCON,EMPRESA,CODCAUSAL,EVALUACION --<< xcontrat_fields
      ) 
      SELECT
      UIDXCONTRAT,UIDXPERSON,FECHAINI,FECHAFIN,UIDXCONTXT,KOCON,EMPRESA,CODCAUSAL,EVALUACION --<< xcontrat_fields
      FROM #XCONTRAT WHERE UIDXPERSON in (select UIDXPERSON from XPERSON) and KOCON not in (SELECT KOCON FROM XCONTRAT)
 
    -- Truco: Insertar concepto CX_TIPOCON
    INSERT INTO XPERSED (UIDXPERSED,UIDXCONTRAT,CLASE,KOCO,FECHAINI,FECHAFIN,VALPRIN,VALAUX1,VALAUX2,VALAUX3,VALDESCRIP,FNACIM)
      SELECT NEWID(),X.UIDXCONTRAT,D.CLASE,D.KOCO,X.FECHAINI,'21000101',X.TIPOCON,D.VALAUX1,D.VALAUX2,D.VALAUX3,D.VALDESCRIP,GETDATE()
      FROM 
      #XCONTRAT X, XCLASED D, XCONTRAT C
      WHERE
      D.KOCO = 'CX_TIPOCON'
      AND X.UIDXCONTRAT = C.UIDXCONTRAT
      AND X.UIDXCONTRAT not in (select UIDXCONTRAT from XPERSED where KOCO = 'CX_TIPOCON')
      
    -- ACTUALIZAR LOS QUE EXISTEN
    UPDATE XCONTRAT SET 
    KOCON = D.KOCON -- Truco para que el set no esté vacío
    ,FECHAINI=D.FECHAINI --<< f.FECHAINI
    ,FECHAFIN=D.FECHAFIN --<< f.FECHAFIN
    ,EMPRESA=D.EMPRESA --<< f.EMPRESA
    ,CODCAUSAL=D.CODCAUSAL --<< f.CODCAUSAL
    ,EVALUACION=D.EVALUACION --<< f.EVALUACION
    FROM 
    #XCONTRAT D 
    INNER JOIN XCONTRAT C on D.UIDXCONTRAT = C.UIDXCONTRAT AND D.UIDXPERSON = C.UIDXPERSON

    -- Check si se siguen cumpliendo restricciones
    SET @duplicated = (SELECT count(*) 
    FROM 
    XCONTRAT A
    INNER JOIN XCONTRAT B 
      ON A.UIDXPERSON = B.UIDXPERSON 
      AND A.EMPRESA = B.EMPRESA 
      AND A.UIDXCONTRAT != B.UIDXCONTRAT 
      AND A.FECHAINI <= B.FECHAFIN 
      AND A.FECHAFIN >= B.FECHAINI
    )

    IF (@duplicated > 0) 
    BEGIN
      SET @err = '@NOT_UNIQ_SCOPE:'
      SET @err += 'NO SE PUDO GRABAR. Los contratos KOCON='+(
        SELECT top 1 A.KOCON+','+B.KOCON 
        FROM XCONTRAT A 
        INNER JOIN XCONTRAT B ON A.UIDXPERSON = B.UIDXPERSON  
        AND A.EMPRESA = B.EMPRESA  
        AND A.UIDXCONTRAT != B.UIDXCONTRAT  
        AND A.FECHAINI <= B.FECHAFIN  
        AND A.FECHAFIN >= B.FECHAINI )+' se traslapan temporalmente'  
      RAISERROR(@err,16,1); 
    END
    
    -- Check si alguna liquidación emitida se quedó fuera
    SET @duplicated = (SELECT count(*) 
    FROM
    XPROCESO P,#XCONTRAT C,XLIQUIDE L
    WHERE 1=1
    AND P.NPROCESO = L.NPROCESO
    AND L.UIDXCONTRAT = C.UIDXCONTRAT
    AND (P.FTPROCESO < C.FECHAINI or P.FIPROCESO > C.FECHAFIN)
    AND L.ESTADO = 'E'
    )
    IF (@duplicated > 0) 
    BEGIN
      SET @err = '@LIQ_EMIT_NO_CONTRAT:'
      SET @err += 'NO SE PUDO GRABAR. No es posible modificar los contratos porque compromete liquidaciones emitidas'  
      RAISERROR(@err,16,1); 
    END   
    
    
  -- Fin validaciones. Cerrar transacción  
  DROP TABLE #XCONTRAT
  COMMIT TRANSACTION
  SELECT 0 AS status, @updated as updated, @created as created
END TRY

BEGIN CATCH
  ROLLBACK
    SET @err = ERROR_MESSAGE()
    --SELECT @err
    RAISERROR(@err,16,1); 
END CATCH
`;

/** dato un array de objetos crea registros en tabla UIDXCONTRAT y adicionalmente crea concepto CX_TIPOCON */
exports.createContractsQuery = function (data, params) {
  var model = new SQLexpr(data);// Inicializar modelo con los datos recibidos (va a mutar abajo)
  var p = {}; // parámetros a pasar a la query

  // permitir o no creación y modificación de registros (depende si viene de POST o PATCH)
  p.allow_update = params.allow_update ? true : false;
  p.allow_create = params.allow_create ? true : false;

  // campos enviados por el cliente, determinan que campos participan en UPDATE f.FECHAINI (por ej) 
  p.f = model.fieldsToSQLString('obj'); // f = {KOCON:true, FECHAINI:true...}
  
  // extended: fijar columnas como extendido (XCONTRAT+Extras) y dar valores por defecto
  model.setFields(XCONTRAT.concat(['RUT','TIPOCON']));
  model.setDefaults({ "UIDXCONTRAT": "NEWID()", "UIDXPERSON": "NEWID()", "RUT": "0", "KOCON": "ABS(CHECKSUM(NEWID()))" });
  p.extended_fields = model.fieldsToSQLString();
  p.extended_values = model.valuesToSQLString();

  //  xcontrat: restringir a campos que pertenecen a la tabla. Se usa en el insert en XCONTRAT
  model.setFields(XCONTRAT);
  p.xcontrat_fields = model.fieldsToSQLString('set'); // " 'UIDXCONTRAT','KOCON'... "

  return SQLcast(createContractsQuerySQL, p);
}


// DELETE
var deleteContractsQuerySQL = `
DECLARE @err varchar(4000)
DECLARE @isReferenced int
DECLARE @deleted int



BEGIN TRY
  BEGIN TRANSACTION

    -- Check si no hay contratos con liquidacion emitida
    SET @isReferenced = (
      SELECT count(*) FROM XLIQUIDE L
      WHERE L.UIDXCONTRAT in  ('12123123-123123-12321')--<< contratos  
      AND L.ESTADO = 'E' 
    )
    IF (@isReferenced > 0) 
    BEGIN
       SET @err = '@JSON_LIST:'
       SET @err += (
         SELECT 
           XP.RUT,
           XP.UIDXPERSON,
           'Persona RUT={{RUT}} tiene liquidaciones emitidas asociadas. No se puede borrar.' as message 
         FROM XPERSON XP inner join XCONTRAT XC on XP.UIDXPERSON = XC.UIDXPERSON 
         WHERE XC.UIDXCONTRAT in  ('12123123-123123-12321')--<< contratos 
         FOR JSON AUTO    
        )
      RAISERROR(@err,16,1); 
    END

    -- borrar contratos
    DELETE 
    FROM 
      XCONTRAT 
    WHERE 
      UIDXCONTRAT in ('12123123-123123-12321')--<< contratos
    set @deleted = @@ROWCOUNT

    -- Check si no se borró nada error
    IF (@deleted = 0) 
    BEGIN
      SET @err = '@NOT_FOUND:'
      SET @err += 'NO SE PUDO BORRAR. No se encontraron registros coincidentes'
      RAISERROR(@err,16,1); 
    END

    -- Fin validaciones. Cerrar transacción  
  COMMIT TRANSACTION
  SELECT 0 AS status,@deleted as deleted
END TRY

BEGIN CATCH
  ROLLBACK
    SET @err = ERROR_MESSAGE()
    --SELECT @err
    RAISERROR(@err,16,1); 
END CATCH


` 

// DELETE
exports.deleteContractsQuery = function (data, params) {
  var p = {}; 
  console.log("data:", data)
  // data = []
  p.contratos = data;

  return SQLcast(deleteContractsQuerySQL, p);
}




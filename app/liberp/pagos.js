'use strict';

var sql = require('../lib/random_lib/castSQL'),
    monedas = require('./monedas.js');

exports.getPagos = getPagos;
exports.createPagos = createPagos;
exports.getMetaPagos = getMetaPagos;
exports.getMetaPagosd = getMetaPagosd;


// Detalle de implementación

function getPagos(req, res, next) {

    // en este contecto req.params.id es idmaedpce
    if (req.params.id) req.query.idmaedpce = req.params.id;

    // tidp por defecto es la lista abajo
    req.query.tidp = req.query.tidp || true;

    // variante: simple|deuda
    req.query.simple = (req.query.variante == 'simple');
    req.query.deuda = (req.query.variante == 'deuda');

    req.addquery(sql.SQLcast(getPagosSQL(), req.query, req.pagination), 'pagos');
    if (next) next();
}

function getPagosSQL() {
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
  DPCE.IDRSD,
  DPCE.UIDMAEDPCE,
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
  AND (DPCE.ESPGDP<> 'N' AND DPCE.ESASDP = 'P') --<< simple
  AND ( DPCE.ESPGDP = 'P' OR DPCE.ESPGDP = 'R' ) --<< deuda
-->> order
ORDER BY 
  DPCE.FEEMDP
`}

function createPagos(req, res, next) {

    var params = {
        allow_update: req.method == 'PUT',
        allow_create: req.method == 'POST',
        subQueryEnca: (req.body.pagos || []).length ? createPagosEnca(req.body.pagos) : false,
        subQueryDeta: (req.body.pagosd || []).length ? createPagosDeta(req.body.pagosd) : false
    }

    var ret = sql.SQLcast(createPagosSQL(), params);
    req.consultaBD = ret;
    next();
    return ret
}

function createPagosSQL() {
    // ALTER TABLE MAEDPCE ADD UIDMAEDPCE UNIQUEIDENTIFIER not null DEFAULT (newid())
    // ALTER TABLE MAEDPCD ADD UIDMAEDPCD UNIQUEIDENTIFIER not null DEFAULT (newid())
    return `
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

        -- TABLA PASOE CON DATOS ENVIADOS en pagos
        SELECT C.* INTO #MAEDPCE FROM MAEDPCE C WHERE 1=0
       --<< subQueryEnca    

       --TABLA PASOD CON DATOS ENVIADOS EN pagosd
       SELECT C.*,C.UIDMAEDPCD as UIDMAEDPCE INTO #MAEDPCD FROM MAEDPCD C WHERE 1=0
       
       --<< subQueryDeta   

       -- Actualizar totales

      -- Fin validaciones. Cerrar transacción  
      DROP TABLE #MAEDPCE,#MAEDPCD
      COMMIT TRANSACTION
      SELECT 0 AS status, @updated as updated, @created as created
    END TRY
    
    BEGIN CATCH
      ROLLBACK
        SET @err = ERROR_MESSAGE()
        --SELECT @err
        RAISERROR(@err,16,1); 
    END CATCH    
    `
}

function createPagosEnca(arrPagosEnca) {

    // Preparar sub query de encabezado MAEDPCE
    var pagos = new sql.SQLexpr(arrPagosEnca);
    pagos.setFields(pagosMeta().map(f => f.field));
    pagos.setDefaults({ "TUVOPROTES": 0 });
    pagos.setTransform({
        "HORAGRAB": "DATEPART(SECOND, GETDATE()) + 60 * DATEPART(MINUTE, GETDATE()) + 3600 * DATEPART(HOUR, GETDATE())",
        "LAHORA": "DATEADD(day, datediff(day, 0, GETDATE()),0)"
    });
    var paramsE = {
        f: pagos.fieldsToSQLString('obj'), // update fields
        pagos_fields: pagos.fieldsToSQLString('set'),
        pagos_values: pagos.valuesToSQLString(),
    }
    var ret = sql.SQLcast(createPagosEncaSQL(), paramsE);
    return ret;
}

function createPagosEncaSQL() {
    return `
    -- INSERT FROM JSON
    INSERT INTO #MAEDPCE (
      EMPRESA,TIDP,NUDP --<< pagos_fields
      --,ENDP,EMDP,SUEMDP,CUDP,NUCUDP,FEEMDP,FEVEDP,MODP,TIMODP,TAMODP,VADP,VAABDP,VAASDP,VAVUDP,ESASDP,ESPGDP,SUREDP,CJREDP,KOFUDP 
      --,KOTNDP,SUTNDP,NUTRANSMI,NUCOCO,KOTU,REFANTI,DOCUENANTI,IMDP,NULICO,PERIODO,TUVOPROTES,FECHAPROTE,RESUMEN,KOENDOSO,NOENDOSO,NUVISA
      --,KOVISADOR,ARCHIRSD,IDRSD,HORAGRAB,LAHORA,CUOTAS,REFERENCIA,VADONDP,IDMAEDPTB,LEY20956,UIDMAEDPCE 
    )
    VALUES
      ('01','EFV','123123') --<< pagos_values

    -- OBTENER CUANTOS SE MODIFICAN/INSERTAN
    set @updated = (SELECT count(*) FROM #MAEDPCE S INNER JOIN MAEDPCE C on C.UIDMAEDPCE = S.UIDMAEDPCE)
    set @created = (SELECT count(*) FROM #MAEDPCE S where S.UIDMAEDPCE not in (SELECT UIDMAEDPCE FROM MAEDPCE))
    
    -- VALIDAR QUE YA NO EXISTA EL UID
    IF (@updated>0)    
    BEGIN
      SET @err = '@JSON_LIST:'
      SET @err += (
        SELECT UIDMAEDPCE, 'Ya existe un registro UIDMAEDPCE={{UIDMAEDPCE}}. No se puede crear.' as message 
        FROM #MAEDPCE 
        WHERE UIDMAEDPCE in (SELECT UIDMAEDPCE FROM MAEDPCE) FOR JSON AUTO    
      )
      RAISERROR(@err,16,1); 
    END
      
    -- CALCULAR NUDP COMO CJREDP+<correlativo por TIDP>
    --- ASIGNAR NÚMERO CORRELATIVO A LOS PAGOS NUEVOS AGRUPADO POR TIDP
    ; WITH topNudp as (
      SELECT #MAEDPCE.*, (row_number() over (partition by TIDP,EMPRESA order by NUDP)) AS CORRELATIVO
      FROM #MAEDPCE
    )
    UPDATE topNudp 
    SET NUDP = '01' + -- ToDo: debe ser CJREDP
      RIGHT( '00000000' +
        CONVERT ( varchar(10),
            CORRELATIVO + 
            COALESCE( (
            SELECT TOP 1 SUBSTRING(NUDP,3,8) AS MAXNUDO	
                FROM MAEDPCE 
                WHERE
                    EMPRESA = topNudp.EMPRESA 
                    AND TIDP = topNudp.TIDP 
                    AND ISNUMERIC(SUBSTRING(NUDP,3,8))>0 
                ORDER BY SUBSTRING(NUDP,3,8) DESC  
            ),0)
        )
    ,8)

    -- INSERTAR DESDE TABLA TEMPORAL
    INSERT INTO MAEDPCE 
    (
      EMPRESA,TIDP,NUDP --<< pagos_fields
    ) 
    SELECT
      EMPRESA,TIDP,NUDP --<< pagos_fields
    FROM #MAEDPCE
`
}

function createPagosDeta(arrPagosDeta) {
    // Preparar sub query de detalle MAEDPCD
    var pagosd = new sql.SQLexpr(arrPagosDeta);
    pagosd.setFields(pagosdMeta().map(f => f.field).concat('UIDMAEDPCE'))// Agrega ref
    pagosd.setTransform({
        "HORAGRAB": "DATEPART(SECOND, GETDATE()) + 60 * DATEPART(MINUTE, GETDATE()) + 3600 * DATEPART(HOUR, GETDATE())",
        "LAHORA": "DATEADD(day, datediff(day, 0, GETDATE()),0)",
        "ARCHIRST": "MAEEDO",

    });
    var paramsD = {
        f: pagosd.fieldsToSQLString('obj'), // update fields
        pagosd_fields: pagosd.fieldsToSQLString('set'),
        pagosd_fields_min: pagosdMeta().map(f => f.field),
        pagosd_values: pagosd.valuesToSQLString(),
    }
    var ret = sql.SQLcast(createPagosDetaSQL(), paramsD);
    return ret;
}

function createPagosDetaSQL() {
    return `
    -- INSERT FROM JSON
    INSERT INTO #MAEDPCD ( 
        IDMAEDPCE,VAASDP --<< pagosd_fields
        --,FEASDP, TIDOPA,ARCHIRST,IDRST,TCASIG,REFERENCIA,KOFUASDP,SUASDP,CJASDP,HORAGRAB,LAHORA,UIDMAEDPCD
    )
    VALUES
      ('01','EFV','123123') --<< pagosd_values
       
    -- Actualizar ref IDMAEDPCE
    UPDATE #MAEDPCD
    SET IDMAEDPCE = E.IDMAEDPCE
    FROM MAEDPCE E INNER JOIN #MAEDPCD D on E.UIDMAEDPCE = D.UIDMAEDPCE


    -- OBTENER CUANTOS SE MODIFICAN/INSERTAN
    -- modify: existe asignación
    set @updated = (SELECT count(*) FROM #MAEDPCD S INNER JOIN MAEDPCD C on C.UIDMAEDPCD = S.UIDMAEDPCD)
    -- insert: no existe asignación
    set @created = (SELECT count(*) FROM #MAEDPCD S where S.UIDMAEDPCD not in (SELECT UIDMAEDPCD FROM MAEDPCD))

    -- VALIDAR NO SE MODIFICA SI NO SE PERMITE
    IF (@updated>0 and @allow_update = 0)    
    BEGIN
       SET @err = '@JSON_LIST:'
       SET @err += (
         SELECT 
         UIDMAEDPCD,
           'Ya existe un registro UIDMAEDPCD={{UIDMAEDPCD}}. No se puede crear.' as message 
         FROM #MAEDPCD WHERE UIDMAEDPCD in (SELECT UIDMAEDPCD FROM MAEDPCD) 
         FOR JSON AUTO    
        )
      RAISERROR(@err,16,1); 
    END

     -- VALIDAR NO INSERTA SI NO SE PERMITE (modo edit)
    IF (@created>0 and @allow_create = 0)    
    BEGIN
       SET @err = '@JSON_LIST:'
       SET @err += (
         SELECT 
           UIDMAEDPCD,
           'No existe el registro que se quiere modificar UIDMAEDPCD={{UIDMAEDPCD}}. No se puede modificar.' as message 
         FROM #MAEDPCD WHERE UIDMAEDPCD not in (SELECT UIDMAEDPCD FROM MAEDPCD) 
         FOR JSON AUTO    
        )
      RAISERROR(@err,16,1); 
    END

    -- INSERTAR LOS QUE NO EXISTEN
    INSERT INTO MAEDPCD 
    (
      IDMAEDPCE,VAASDP,FEASDP --<< pagosd_fields_min
    ) 
    SELECT
    IDMAEDPCE,VAASDP,FEASDP --<< pagosd_fields_min
    FROM #MAEDPCD WHERE UIDMAEDPCD not in (SELECT UIDMAEDPCD FROM MAEDPCD)
         
    -- ACTUALIZAR LOS QUE EXISTEN
    UPDATE MAEDPCD SET 
    UIDMAEDPCD = D.UIDMAEDPCD -- Truco para que el set no esté vacío
    FROM 
    #MAEDPCD D 
    INNER JOIN MAEDPCD C on D.UIDMAEDPCD = C.UIDMAEDPCD

    -- ACTUALIZAR ENCABEZADO MAEDPCE (VAASDP)
    UPDATE MAEDPCE 
    SET VAASDP = U.VAASDP
    FROM 
    (SELECT IDMAEDPCE,SUM(VAASDP) as VAASDP  from MAEDPCD
    WHERE IDMAEDPCE in (SELECT IDMAEDPCE from #MAEDPCD)
    GROUP BY IDMAEDPCE) U
	INNER JOIN MAEDPCE E
    ON E.IDMAEDPCE = U.IDMAEDPCE
    
    `
}

// Entrega metadatos MAEPCDE
function getMetaPagos(req, res, next) {
    req.add(pagosMeta(), 'pagos');
    req.add(getFormasDePago('ventas'), 'formasPago');
    monedas.getMonedas(req, req);
    if (next) next();
}
function pagosMeta() {
    return [
        //{ field: "IDMAEDPCE", name: "IDMAEDPCE", visible: false, pk: true },
        { field: "EMPRESA", name: "Empresa", description: "Código empresa receptora pago", readOnly: true, fk: 'TABENDP.EMPRESA', visible: false },
        { field: "TIDP", name: "TD", description: "Tipo documento", fk: 'TABENDP.TIDPEN+"V|C"', visible: true, length: "5", datatype: 'lookup', tabla: 'formasPago', options: { returnSrv: "codigo", returnClient: "codigo" } },
        { field: "NUDP", name: "Correlativo", description: "Número correlativo documento de pago", visible: false },
        { field: "ENDP", name: "Entidad", description: "Entidad documento de pago", fk: 'MAEEN.KOEN', visible: false },
        { field: "EMDP", name: "Emisor", description: "Emisor documento de pago (banco)", fk: 'TABENDP.EMDP', visible: false },
        { field: "SUEMDP", name: "Sucursal", description: "Plaza", fk: 'TABENDP.SUEMDP', visible: false },
        { field: "CUDP", name: "Cuenta", description: "Cuenta de banco", visible: false },
        { field: "NUCUDP", name: "Número", description: "Número de cheque o transferencia", visible: true, length: "10" },
        { field: "FEEMDP", name: "F. Emisión", visible: true, datatype: 'date', length: "10" },
        { field: "FEVEDP", name: "F. Vencim.", visible: true, datatype: 'date', length: "10" },
        { field: "MODP", name: "M", description: "Moneda", visible: true, length: "3", datatype: 'lookup', tabla: 'monedas', options: { returnSrv: "KOMO", returnClient: "KOMO" } },
        { field: "TIMODP", name: "Tipo moneda", description: "Nacional (N) o extranjera (E)", visible: false },
        { field: "TAMODP", name: "Tasa de cambio", visible: false },
        { field: "VADP", name: "Monto", visible: true, datatype: 'number', length: "10", validations: [{ min: 1 }] },
        //{ field: "VAABDP", name: "Abono", description: "Abono anterior asignado", visible: false, datatype: 'number' },
        { field: "VAASDP", name: "Asignado (anterior)", description: "Asignado (anterior)", visible: false, datatype: 'number' },
        //{ field: "VAASDPN", name: "Asignado", description: "Asignado (nuevo)", visible: false, datatype: 'number' },
        //{ field: "SALDODP", name: "Saldo", description: "Disponible", readOnly: true, visible: true, datatype: 'number', length: "10" },
        { field: "VAVUDP", name: "Vuelto", description: "Vuelto", visible: false, datatype: 'number' },
        { field: "ESPGDP", name: "Estado", description: "Estado de pago del documento de pago (Pendiente,Cancelado,Nulo)", visible: false },
        { field: "REFANTI", name: "Referencia", visible: false },
        { field: "TUVOPROTES", name: "TUVOPROTES", visible: false, datatype: 'number' },
        { field: "ARCHIRSD", name: "ARCHIRSD", visible: false },
        { field: "HORAGRAB", name: "HORAGRAB", visible: false, datatype: 'number' },
        { field: "LAHORA", name: "LAHORA", visible: false, datatype: 'date' },
        { field: "IDRSD", name: "IDRSD", visible: false },
        { field: "UIDMAEDPCE", name: "UIDMAEDPCE", visible: false, pk: true, datatype: 'uuid' },
    ];
}
// Entrega metadatos MAEPCDD
function getMetaPagosd(req, res, next) {
    req.add(pagosdMeta(), 'pagosd');
    if (next) next();
}
function pagosdMeta() {
    return [
        //{ field: "IDMAEDPCD", name: "IDMAEDPCD", visible: false, pk: true },
        { field: "IDMAEDPCE", name: "IDMAEDPCE", visible: false, fk: true },
        { field: "VAASDP", name: "Asignado", description: "Asignado", readonly: false, visible: true, datatype: 'number', length: "10" },
        { field: "FEASDP", name: "F. Asignación", visible: false, datatype: 'date', length: "10" },
        { field: "TIDOPA", name: "TIDOPA", description: "TIDO del documento a pagar (MAEEDO.TIDO)", visible: false, length: "3" },
        { field: "ARCHIRST", name: "ARCHIRST", description: "Tabla del documento a pagar (MAEEDO|CDOCCOE|MAEDPCE)", visible: false },
        { field: "IDRST", name: "IDRST", description: "ID en tabla fk", visible: false },
        { field: "TCASIG", name: "TCASIG", description: "Tasa cambio", visible: false },
        { field: "REFERENCIA", name: "REFERENCIA", description: "REFERENCIA???", visible: false },
        { field: "KOFUASDP", name: "Código funcionario", description: "Funcionario", visible: false },
        { field: "SUASDP", name: "Sucursal recepción", fk: true, description: "Sucursal", visible: false },
        { field: "CJASDP", name: "Caja recepción", fk: true, description: "Caja", visible: false },
        { field: "HORAGRAB", name: "HORAGRAB", visible: false },
        { field: "LAHORA", name: "LAHORA", datetype: 'date', visible: false },
        { field: "UIDMAEDPCD", name: "UIDMAEDPCD", visible: false, pk: true, datatype: 'uuid' },

    ];
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
    return ret
}
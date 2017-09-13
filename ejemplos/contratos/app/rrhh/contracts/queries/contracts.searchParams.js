'use strict';

var _ = require('lodash');



/**
* in: searchParams="{}" como string
* out: sp:como objeto
**/
var parseJSONSearchParams = function (query) {

    // Convierte req.searchParams en JSON
    if (typeof query.searchParams == 'string') {
        try {
            var sp = JSON.parse(query.searchParams) || {};
            if (sp) {
                query.searchParams = sp;
            }
        } catch (e) {
            // Search param viene no como JSON
            delete query.searchParams;
            //console.log("no hay searchParams");
        }
    }

    // return
    return query;
}

var encodeOperador = function (input) {

    var codes = { eq: '=', gt: '>=', lt: '<=' }
    var ret = codes[input];
    return ret
}

/** Funciones auxiliares **/
/** input: concepto:'A_PLAN',operador:eq|gt|lt,propiedad:'VALPRIN'|VALDESCRIP...,valor:'abc'|number */
var decodeClassFilter = function (data) {
    // unir todas las condiciones para un data[i] con AND, unir todos los data con un OR
    // loop en data[i][propxx] join con OR
    var ret = "AND ( KOCO='" + data[0].concepto + "'"
    // VALPRIN='ABC'
    var conds = [];
    data.forEach(function (d) {
        var propiedad = d.propiedad || '';
        var operador = encodeOperador(d.operador) || '';
        // si valor es numérico, incorporar PARSEINT a propiedad--> PARSEINT(propiedad) operador valor
        var valor = typeof (d.valor) == 'undefined' ? '' : (typeof (d.valor) == 'number' ? (d.valor + '') : "'" + d.valor + "'");
        if (typeof (d.valor) == 'number') { propiedad = 'TRY_CAST(' + propiedad + ' as FLOAT) ' } // >SQL2012
        if (operador.length && valor.length && propiedad.length) conds.push(propiedad + operador + valor);
    });
    if (conds.length) ret += ' AND ( (' + conds.join(') AND (') + ') )';
    return ret + ")";
}


/** Decode **/
/**
* in: sp Object
* out: 
    claseFilter,textFilter,
    emitida,erroneaQ,
    erronea,emitidaQ,
    activo,fechaActivoIni,fechaActivoFin
    inactivo,fechaInactivoIni,fechaInactivoFin
    finiquito,fechainiFiniquito,fechafinFiniquito
    empresa,
    fechaini,fechafin
**/
exports.decodeSearchParams = function (query) {
    //console.log("decode")
    // Parsear searchParams as JSON
    query = parseJSONSearchParams(query);
    //console.log("PREPOST",query);
    /** searchParams: {cfiltros,dates,company} **/
    var sp = query.searchParams || {};
    var cfiltros = sp.cfiltros || [];
    var ret = {};

    /** Init, valores por defecto **/
    /** searched_date: parámetro intermedio (fecha viene en formato) **/
    var locals = {
        fechaini: new Date((sp.dates || {}).fechaini || '1970-01-01').toISOString().replace(/-/g, '').substring(0, 8),
        fechafin: new Date((sp.dates || {}).fechafin || '2099-01-01').toISOString().replace(/-/g, '').substring(0, 8)
    }

    /** cfiltros: clase|free_text|assign **/
    cfiltros.forEach(function (o) {
        // type_filter = clase --> claseFilter
        if (o.type == 'clase') {
            ret.claseFilter = ret.claseFilter || '';
            var dfilter = decodeClassFilter(o.data);
            if (dfilter.length) {
                ret.claseFilter += " and XC.UIDXCONTRAT in (select UIDXCONTRAT from XPERSED D where D.UIDXCONTRAT = XC.UIDXCONTRAT and D.FECHAINI < '" + locals.fechafin + "' and D.FECHAFIN > '" + locals.fechaini + "'" + dfilter + ") ";
            }

            // type_filter = free_text --> textFilter
        } else if (o.type == 'free_text') {
            if (o.param == 'any' || o.param == 'all') {
                var bool = (o.param=='any')?' or ':' and ';//  si para es 'any' se unen las condiciones con un OR, si no, con un AND (i.e. deben contener todos los textos)
                o.data.forEach(function (o_elem) {
                    ret.textFilter = ret.textFilter || ((o.param=='any')?' AND (11=0':' AND (11=11'); // any inicializa con AND (11=0 or ...  'all' inicializa con AND (... and and 
                    ret.textFilter += bool+"UPPER(COALESCE(XP.NOMBRE, '')+COALESCE(XP.APPP, '')+COALESCE(XP.APPM, '')+COALESCE(XC.KOCON, '')+COALESCE(XP.RUT, '')) like UPPER('%'+'" + o_elem + "'+'%') "
                })
            } else if (o.param == 'kocon') {
                ret.kocon = o.data;
            } else if (o.param == 'rut') {
                ret.rut = o.data;
            } else if (o.param == 'uuid') {
                ret.uuid = o.data;
                ret.hasuuid = true;
            }
            // type_filter = assign --> .key (eg. 'emitida'). Ver proceso más abajo
        } else if (o.type == 'assign') {
            o.data.forEach(function (d) { ret[d] = true })
        }
    });
    // cerrar textFilter
    if (ret.textFilter) ret.textFilter += ') ';

    /** cfiltros: assign **/
    // 'emitida' : Estado liquidación = E
    if (ret.emitida)
        ret.emitidaQ = ret.emitida ? " XC.UIDXCONTRAT in ( SELECT UIDXCONTRAT from XLIQUIDE LE inner join XPROCESO RP on LE.NPROCESO = RP.NPROCESO and LE.ESTADO = 'E' and LE.UIDXLIQREL is null and RP.FIPROCESO <= '" + locals.fechafin + "' and RP.FTPROCESO >= '" + locals.fechaini + "' )" : false;

    // 'erronea' : Estado liquidación = X
    if (ret.erronea)
        ret.erroneaQ = ret.erronea ? " XC.UIDXCONTRAT in ( SELECT UIDXCONTRAT from XLIQUIDE LE inner join XPROCESO RP on LE.NPROCESO = RP.NPROCESO and LE.ESTADO = 'X' and LE.UIDXLIQREL is null and RP.FIPROCESO <= '" + locals.fechafin + "' and RP.FTPROCESO >= '" + locals.fechaini + "' )" : false;

    // 'emitida' && 'erronea' -> Si ambos activos unir con un OR
    /*if (ret.emitidaQ && ret.erroneaQ) {
        ret.emitidaQ += ' or ' + ret.erroneaQ;
        ret.erroneaQ = false;
    }*/

    // empresa en query
    if (query.empresa) ret.empresa = sp.empresa;

    // dep empresa: para usar en query personas. Aplica sólo si se usan condiciones sobre contratos
    if (sp.empresa && ( ret.claseFilter || ret.activo || ret.inactivo || ret.finiquito || ret.emitida || ret.erronea)){
        ret.depempresa = sp.empresa;
    }

    // activo,inactivo : XC.FECHAINI, XC.FECHAFIN dentro de las fechas enviadas. Si ambos seleccionados se anulan
    if (ret.activo && ret.inactivo) {
        ret.activo = false;
        ret.inactivo = false;
    }else{
        if (ret.activo) {
            ret.fechaActivoIni = locals.fechaini;
            ret.fechaActivoFin = locals.fechafin;
        }
        if (ret.inactivo) {
            ret.fechaInactivoIni = locals.fechaini;
            ret.fechaInctivoFin = locals.fechafin;
        }
    }

    // 'finiquito' -> fechafin del contrato está en período en estudio
    if (ret.finiquito) {
        ret.fechainiFiniquito = locals.fechaini;
        ret.fechafinFiniquito = locals.fechafin;
    }



    return ret;
}
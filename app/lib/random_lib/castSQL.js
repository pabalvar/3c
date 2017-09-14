"use strict";
const TSQL_POST_2012 = true;
var _ = require('lodash');

if (typeof process !== 'undefined') {
    var console = process.console;// Running on node?
}

/** Convertir parámetro order en OrderBy */
function getOrderBy(input) {
    if (!input) console.error("No viene order by");
    var ret = [];
    var arr = _.castArray(input)
    arr.forEach(function (o) {
        if (o[0] == '-') { // si nombre de campo viene antecedido de "-" es desc
            ret.push(o.slice(1) + ' desc')
        } else {
            ret.push(o);
        }
    });
    return ret.join(',') + ' ';
}

/**
 * Serializa el array de json para que se pueda usar en una instrucción VALUES de un insert múltiple en SQL:
 * Ejemplo (copy paste en consola para probar)
    var dataSet =
    [
        {
            "NOMBRE" : "Pablo",
            "EDAD"   : 40,
            "FECHA"  : "@miVar"
        },{
            "NOMBRE" : "Juan",
            "EDAD"   : 20,
            "FECHA"  : "DATE()"
        }
    ]

    // Inicializar objeto SQLexpr con el dataSet de prueba
    var model = new SQLexpr(dataSet)
 
    // Obtener string con columnas para usar en un INSERT (por defecto) o en un UPDATE ('set')
    model.fieldsToSQLString()           //  -->     "(NOMBRE,EDAD,FECHA)"
    model.fieldsToSQLString('set')      //  -->     ["NOMBRE", "EDAD", "FECHA"] 
    model.fieldsToSQLString('obj')      //  -->     { NOMBRE:true, EDAD:true, FECHA:true}  

    // Obtener string con valores para usar en un INSERT (por defecto) o en un UPDATE ('set')
    model.valuesToSQLString()           //  -->     "('Pablo','40',@miVar),('Juan','20',DATE())"
    model.valuesToSQLString('set')      //  -->     " NOMBRE='Juan',EDAD='20',FECHA=DATE() "

     
    // Alias campo NOMBRE por NOMPER
    model.setAlias({"NOMBRE":"NombreSQL","EDAD":"EdadSQL"})
    model.fieldsToSQLString()           //  -->     "(NombreSQL,EdadSQL,FECHA)"
    model.fieldsToSQLString('set')      //  -->     ["NombreSQL", "EdadSQL", "FECHA"]
    
    // Fijar columnas
    model.setFields(["NOMBRE"])
    model.fieldsToSQLString()           //  -->     "(NombreSQL)"
    model.valuesToSQLString()           //  -->     "('Pablo'),('Juan')"
    
    // Agregar columnas
    model.addFields(["EDAD","SLOGAN"])
    model.fieldsToSQLString('set')      //  -->     ["NombreSQL", "EdadSQL", "SLOGAN"]
    model.valuesToSQLString()           //  -->     "('Pablo','40',null),('Juan','20',null)"
    
    // Agregar valor por defecto
    model.setDefaults({"EDAD":"Default EDAD","SLOGAN":"Default SLOGAN"})
    model.valuesToSQLString()           //  -->     "('Pablo','40','Default SLOGAN'),('Juan','20','Default SLOGAN')"
    
    // Reemplazar valor contenido en otro campo
    model.setTransform({"SLOGAN":" Me llamo {NOMBRE}, edad {EDAD}"})
    model.valuesToSQLString()           // -->      "('Pablo','40',' Me llamo Pablo, edad 40'),('Juan','20',' Me llamo Juan, edad 20')"
 */
var SQLexpr = function (d) {
    // containers
    this.data = [];
    this.fields = [];
    this.values = [];
    this.defaults = [];
    this.transform = [];
    this.alias = [];

    // Agrega campos para el insert
    this.addField = function (key) {
        var f = this.fields;
        if (f.indexOf(key) < 0) { // agregar si no existe en campo f
            f.push(key);
        }
    }

    // Agrega campos a los del body 
    this.addFields = function (fields) {
        var self = this;
        // decople
        var _fields = [];
        _.merge(_fields, fields);
        _fields.forEach(function (field) {
            self.addField(field);
        });
    }

    // Obtiene todos los nombres de los campos 
    this.setFields = function (x) {

        if (x) { // x es array de strings
            this.fields = x;
            return this;
        }

        // Recorrer todas las 	llaves de data y guardar en array
        var d = this.data || [];
        var f = this.fields || [];

        for (var i = 0; i < d.length; i++) { // iterar lineas
            for (var key in d[i]) { // iterar campos
                if (d[i].hasOwnProperty(key)) {
                    this.addField(key);
                }
            }
        }
        this.fields = f;
        return this;
    }

    this.fieldsToSQLString = function (imethod) {
        var ret = [];
        var method = imethod || 'insert';
        var a = this.alias;
        var f = this.fields;
        // Reemplazar fields con alias (si existe)
        f.forEach(function (e) {
            if (a.hasOwnProperty([e])) {
                ret.push(a[e]);
            } else {
                ret.push(e);
            }
        });
        if (method == 'insert') {
            return ("(" + ret.join(",") + ")");
        } else if (method == 'set') {
            return ret;
        } else if (method == 'obj') {
            var obj = {};
            ret.forEach(function (o) {
                obj[o] = true;
            });
            return obj;

        }
    }

    /**
     * Serializa el array de json para que se pueda usar en una instrucción VALUES de un insert múltiple en SQL:
     * Ejemplo x=[{"a":"1","b":2,"c":"@miVar"},{"a":"11","b":22,"c":"DATE()"}], json2SQL(x) = "(1,2,miVar),(11,22,DATE())"
     */
    this.valuesToSQLString = function (imethod) {
        var r = '';
        var method = imethod || "insert"; // insert || update
        var dato = '';
        var linea = [];
        var setlinea = {};
        var lineas = [];
        var d = this.data;
        var f = this.fields;
        var df = this.defaults;
        var t = this.transform;
        var a = this.alias;

        var sqlexpr = /^(?:@\w+)|DATE\(.*\)|HASHBYTES\(.*\)|NEWID\(.*\)|SUM\(.*\)/; // Listar otras funciones SQL a continuación: ej. ...|DATE\(.*\)|COALESCE\(.*\)
        var noquote = '/noquote';
        var quote = '/quote';
        // Convertir cada json del array en un array
        for (var i = 0; i < d.length; i++) { // iterar líneas
            linea = [];
            for (var j = 0; j < f.length; j++) { // iterar campos
                dato = null;
                // Buscar en los defaults
                if (df.hasOwnProperty(f[j])) {
                    dato = df[f[j]];
                }

                // Sobreescribir si viene en data
                if (d[i].hasOwnProperty(f[j])) {
                    if (d[i][f[j]] != null) {
                        dato = d[i][f[j]];
                    }
                }

                // Aplicar transformación si vienen. Reemplazar {} en string de la transformación valor de algún campo
                if (t.hasOwnProperty(f[j])) {
                    var rx = /({([^})]*)})/g;
                    dato = t[f[j]];
                    if (dato.match(rx)) {
                        var tmp = dato.match(rx).forEach(function (l) {
                            dato = dato.replace(l, eval("d[i]['" + l.slice(1, -1) + "']"));
                            //console.log("DATO ", dato, " EVALx :",'d[i][',l.slice(1,-1),']');
                        })
                    }
                }

                if (typeof dato == 'string') {
                    // Agregar comillas extras si el string no es una variable o función SQL (ej. COALESCE(), @miVar, etc.)
                    if (dato.match(noquote)) {
                        dato = dato.replace(noquote, '');
                    } else if (dato.match(quote)) {
                        dato = dato.replace(quote, '');
                        // SQL Safe: duplicar ' si es que vienen
                        dato = "'" + dato.replace(/'/g, "''") + "'";
                    }
                    else if (!dato.match(sqlexpr)) {
                        // SQL Safe: duplicar ' si es que vienen
                        dato = "'" + dato.replace(/'/g, "''") + "'";
                    }
                } else if (dato == null) {
                    dato = "null";
                } else { // Dato es escalar (? no sé por qué le puse comillas acá. Creo SQL sabe interpretar igual )
                    dato = "'" + dato + "'";
                }
                linea.push(dato);
            }
            if (method == 'insert') {
                lineas.push("(" + linea.join(",") + ")");
            }else if(method == 'strArr'){
                lineas.push(linea.join(",") );
            }
        }
        if (method == 'insert') {
            r = lineas.join(",");
        } else if (method == 'set') {
            var tmp = [];
            var af = this.fieldsToSQLString('set');
            for (var i = 0; i < linea.length; i++) {
                tmp.push(af[i] + "=" + linea[i]);
            }
            r = " " + tmp.join(",") + " ";
        }else if (method == 'strArr'){
            return lineas
        }

        return r;
    }
    // Define valores por defecto para el insert. A[] es un array tipo {column:value,column:value}
    this.setDefaults = function (a) {
        // fijar defaults
        this.defaults = a;
		/*
		// insertar encabezados
		for (var i in a){
			this.addField(i);
		}*/
    }

    // Define transformaciones para una columna. Por ejemplo si columna A=x, A=COALESCE(x). 
    // La variable a reemplazar se escribe entre {}
    this.setTransform = function (a) {
        // fijar defaults
        this.transform = a;
		/*
		// insertar encabezados
		for (var key in a){
			this.addField(key);
		}*/
    }

    // Define alias SQL de un campo JSON.  
    // setAlias( {"codigoUsuario":"KOPER"})
    this.setAlias = function (a) {
        // fijar defaults
        this.alias = a;
		/*
		// insertar encabezados
		for (var i in a){
			this.addField(i);
		}*/
    }

    // Init
    this.init = function (d) {
        this.data = d;
        this.setFields();
    }

    // Inicializar
    this.init(d);
}

/** inyecta variables JS en un string según siguiente syntax:
 
 --<< variable      : inyecta eval(variable) en expr_sql. 
        
        Ejemplo:    var codigo      = 'FOO'
                    var sqlStr      = " select * from MAEDDO where KOPR = '1234'--<< codigo "
                    var sqlStr      = " select * from MAEDDO where KOPR = (1234)--<< codigo
        Resultado:  toJS(sqlStr)    = " select * from MAEDDO where KOPR = 'FOO' "

        Ejemplo:    var codigo      = 1234
                    var sqlStr      = " select * from MAEDDO where PRECIO = 500--<< codigo
        Resultado:  toJS(sqlStr)    = " select * from MAEDDO where KOPR = 1234 " 

            Trucos:
                si la variable es estrictamente false, se borra la lína completa
                si la variable es estrictamente true, se deja la línea como está
                si el string contiene /noquote no se agregan comillas al string
                si el string contiene /quote se fuerza a agregar comillas al string (si el string parece instrucción SQL)

        Parámetros: s {string} SQL statement puro
                    p {json}    Objeto con variables a ser reemplazadas en --<<
                    o {json} Objeto con opciones de salida:
                            o.count:boolean -> convierte query en select count(*)
                            o.pagination:{page:{int}|key{sqlExpr}, size:{int}} -> convierte query en query paginada
                            o.setFields:["campo1","campo2"] -> sólo incluye estos campos en la select

                    Requerimientos de la expresión SQL para poder usar opciones de salida:
                    o.count: 
                        anteponer "-->> select" antes de la primera SELECT y "-->> from" después del último campo (i.e. antes del FROM de la primera select)
                    o.pagination: 
                        anteponer "-->> select" antes de la primera SELECT y "-->> from" después del último campo (i.e. antes del FROM de la primera select)
                        anteponer "-->> group" antes de GROUP BY (si hubiere)
                        anteponer "-->> order" antes de ORDER BY (si hubiere)
                    
                        
// Ejemplo (copy paste en consola para probar)
var source = 
    `
    -->> select
    SELECT
    APPPER, count(*) as CANTIDAD
    -->> from
    FROM 
    RPERSE
    WHERE
    APPPER like '%A%'
    -->> group
    GROUP BY
    APPPER
    -->> order
    ORDER BY APPPER asc,count(*) desc
    `
 
    // Obtener query
    result = SQLcast(source)  // --> " SELECT APPPER, count(*) as CANTIDAD FROM RPERSE WHERE APPPER like '%A%' GROUP BY APPPER ORDER BY count(*) desc  "
    
    // Opción salida: COUNT(*)
    result = SQLcast(source,null,{"count":true}) // --> select count(*) as total FROM RPERSE WHERE APPPER like '%A%'
    
    // Opción salida: paginado (paginación por defecto size:10,pagina:1)
    result = SQLcast(source,null,{"pagination":{}}) //

    // Opción salida: paginado, página=2, largo página=50
    result = SQLcast(source,null,{"pagination":{"size":50,"page":2}}) //  --> SELECT  * from ( SELECT ROW_NUMBER() OVER ( ORDER BY   count(*) desc   ) as RowNum,  APPPER, count(*) as CANTIDAD  FROM RPERSE WHERE APPPER like '%A%' GROUP BY APPPER  ) as RRows WHERE RowNum > 50 and RowNum < 101 
    
    // Opción salida: especificar campos (campo existe en query original)
    result = SQLcast(source,null,{"setFields":["APPPER","KOPER"]}) // --> SELECT  APPPER,KOPER FROM RPERSE WHERE APPPER like '%A%'  group by APPPER,KOPER  order by APPPER asc
    
    // Opción salida: subselect -> elimina campos order-by
    
    // Opción salida: meta -> sólo retorna metadatos de la tabla (datatype, length, required)
    result = SQLcast(source,null,{"meta":true}) // --> SELECT COLUMN_NAME,DATA_TYPE,CHARACTER_MAXIMUM_LENGTH,IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = <table>
    
    // EJEMPLO in Line
    var line = ` select * from MAEDDO where KOPR = ('1234')--<< codigo `
    var params = {"codigo":['soy string',1,2,"GETDATE()"]}
    result = SQLcast(line,params) // -> " select * from MAEDDO where KOPR = ('soy string',1,2,GETDATE()) "
    
    var line = " select * from MAEDDO where KOPR = 1234--<< codigo "
    var params = {"codigo":'soy string'}
    result = SQLcast(line,params) // ->  " select * from MAEDDO where KOPR = 'soy string' "
    
    
*/

var SQLcast = function (s, p, opt) {
    // @xxx     DATE()     HASHBYTES()     COALESCE()               SELECT..FROM..   DROP TABLE        ( .... )
    var sqlexpr = /^(?:@\w+)|DATE\(.*\)|HASHBYTES\(.*\)|NEWID\(.*\)|COALESCE\(.*\)|SUM\(.*\)|SELECT.*FROM.*|DROP.*TABLE.*|^\s*\(.*\)\s*$|^\s*\[.*\]\s*$/i;
    var noquote = '/noquote';
    var quote = '/quote';
    var newLine = /\n/;
    var inLineRegex = /(?:('[^']*')|\(([^)]+)\)|(\w*))(\s?)(--(<<|=)\s([\w\.]+)(\?)?)/   // Cambia: ahora reemplaza la comilla tb
    var secctionBegin = /(?:^|\s)-->>\s(\w+)/
    var inLineComment = /--.*/;
    var R = {}; var section = '_default_';
    var o = opt || {};
    var count = false; // Converts query to count

    // Inicializar sección a _default_ para guardar resultado
    R[section] = '';

    // Eliminar tabs del string de entrada
    s = s.replace(/\t+/, '');

    var str = s || '';

    // Parsear consulta, generar secciones
    str.split(newLine).forEach(function (e) {
        // Eliminar múltimples espacios al principio y al final
        e = e.trim();
        var matches = e.match(inLineRegex) || false; // $1||$2||$3= key, $4=--<<... comment, $5= value

        // La línea contiene --<< (variable a ser evaluada)
        if (matches) {
            // Poner nombres a fragmentos del string identificados
            var match = {
                "key": matches[1] || matches[2] || matches[3], // texto que se reemplaza
                "noquote": (matches[6] == '=') ? true : false, // Si es --= se evalúa sin comillas, si es --<< se interpreta con comillas
                "variable": matches[7], // variable a evaluar para reemplazo
                "comment": matches[5], // porción que es comentario en SQL
                "wholeLine": matches[4] == ' ', // si es que reemplaza toda la linea
                "binary": (matches[8] == '?') ? true : false // se usa para evaluar no la variable, sino la existencia de
            }
            // Caso variable anidada (eg. p.options.name --> p[options][name]
            if (match.variable.match(/\./)) {
                match.vararr = match.variable.split('.');
                match.variable = match.vararr.join("']['");
            }
            match.variable = "['" + match.variable + "']";
            match.evalVar = eval('p' + match.variable);
            // Caso variable --<< var?  se reemplaza var por truthy o falsey
            if (match.binary){
                match.evalVar = match.evalVar?true:false;
            }
            // Agregar comillas si variable es de tipo string
            if (typeof match.evalVar == 'string') {
                if (match.evalVar.match(noquote) || match.noquote) {
                    match.evalVar = match.evalVar.replace(noquote, '');
                } else if (match.evalVar.match(quote)) {
                    match.evalVar = match.evalVar.replace(quote, '');
                    // SQL Safe: duplicar ' si es que vienen
                    match.evalVar = "'" + match.evalVar.replace(/'/g, "''") + "'";
                } else if (!match.evalVar.match(sqlexpr)) {
                    // SQL Safe: duplicar ' si es que vienen
                    match.evalVar = "'" + match.evalVar.replace(/'/g, "''") + "'";
                }
            }

            // Si el comentario reemplaza toda la línea
            if (match.wholeLine) {
                // Si la variable es exactamente 'false' se borra la línea
                if (match.evalVar === false || match.evalVar == undefined) {

                    // Si la variable es exactamente 'true' se deja el original (borrando el comentario)
                } else if (match.evalVar === true) {
                    e = e.replace(match.comment, '');
                    R[section] += e + ' ';
                    // Si la variable es otra cosa, reemplazar la línea por la evaluación de la variable
                } else {
                    R[section] += match.evalVar + ' ';;
                }
                // El comentario reemplaza una variable en la línea
            } else {
                // Si la variable es exactamente 'false' se borra la línea
                if (match.evalVar === false || match.evalVar == undefined) {
                    // Si la variable es exactamente 'true' se deja el original
                } else if (match.evalVar === true) {
                    e = e.replace(match.comment, '');
                    R[section] += e + ' ';
                    // La variable contiene valores se debe hacer un eval de match.variable
                } else {
                    var resValue;
                    // Si la variable es de tipo array, convertir a "x,y,z"
                    if (match.evalVar instanceof Array) {
                        var tmparr = [];
                        // Agregar comillas extras si el string no es una variable o función SQL (ej. COALESCE(), @miVar, etc.)
                        match.evalVar.forEach(function (a) {
                            var tmpTxt = a;
                            if (typeof a == 'string') {
                                if (a.match(noquote) || match.noquote) {
                                    tmpTxt = a.replace(noquote, '');
                                } else if (a.match(quote)) {
                                    tmpTxt = a.replace(quote, '');
                                    // SQL Safe: duplicar ' si es que vienen
                                    tmpTxt = "'" + tmpTxt.replace(/'/g, "''") + "'";
                                } else if (!a.match(sqlexpr)) {
                                    tmpTxt = "'" + tmpTxt + "'";
                                }
                            }
                            tmparr.push(tmpTxt);
                        });
                        match.value = tmparr.join(",");
                        // La variable es un escalar
                    } else {
                        match.value = match.evalVar;
                    }

                    // Reemplazar match.key con eval(match.variable) (i.e. resValue)
                    e = e.replace(match.key, match.value);

                    // Remove comments
                    e = e.replace(match.comment, '')

                    // Return string
                    R[section] += e + ' ';
                }
            }
        } else if (e.match(secctionBegin)) {
            section = e.match(secctionBegin)[1];
            R[section] = '';
        } else if (e.match(inLineComment)) { // este else debe ir al final!
            var tmp = e.replace(inLineComment, "");
            R[section] += tmp + ' ';
        } else {
            R[section] += e + ' ';
        }
    });

    /** Evaluar opciones de salida */

    /* o.subselect = true -> eliminar sección "order by" */
    if (o.subselect) {
        R['order'] = ' ';
    }

    /* o.count = true -> convertir en select count(*) */
    if (o.count) {
        // Convertir campos select, group by y order by
        R['select'] = ' select count(*) as total ';
        R['group'] = ' ';
        R['order'] = ' ';
    } else if (o.meta) {
        // Sólo busca meta datos de la tabla

        // Aislar la primera tabla de la seccion from
        var matches = R['from'].match(/from\s+(\w+)\s/i);
        // Redefinir toda la select como sigue
        R = {
            "_default_":
            " SELECT COLUMN_NAME as field,DATA_TYPE as datatype, CHARACTER_MAXIMUM_LENGTH maxLength," +
            " CASE WHEN IS_NULLABLE = 'NO' THEN 1 ELSE 0 END as required  " +
            "  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + matches[1] + "' "
        }
    } else if (o.pk) {
        // Obtiene metadatos y la columna PK (al parecer es cara esta consulta)
        var matches = R['from'].match(/from\s+(\w+)\s/i);
        R = {
            "_default_":
            " SELECT COLUMN_NAME as field,DATA_TYPE as datatype,CHARACTER_MAXIMUM_LENGTH maxLength " +
            " CASE WHEN IS_NULLABLE = 'NO' THEN 1 ELSE 0 END as required  " +
            "  ,(select count(*) from " +
            "    sys.tables ta inner join sys.indexes ind on ind.object_id = ta.object_id " +
            "    inner join sys.index_columns indcol on indcol.object_id = ta.object_id and indcol.index_id = ind.index_id " +
            "    inner join sys.columns col on col.object_id = ta.object_id and col.column_id = indcol.column_id " +
            "   where ind.is_primary_key = 1 and col.name = COLUMN_NAME and ta.name  = '" + matches[1] + "' " +
            "   ) as IS_PK " +
            "   FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + matches[1] + "' "
        }
    } else {
        /* o.setFields: ajustar campos de la select*/
        if (o.setFields) {
            var fields;
            // reemplazar los campos de la select por los indicados en el array

            // Generar texto para paginación
            var s_select = R['select'].replace(/select/i, ' ');// Aislar select
            var s_prefijo = R['from'].match(/^from\s+\w+\s+(\w+)/i)[1]; // Aislar alias de la tabla (from XCLASE D)

            // agregar prefijio por defecto si es que el setField no lo tiene
            fields = _.castArray(o.setFields).map(function (f) {
                var pre = s_prefijo ? s_prefijo + '.' : '';
                var ret = f.match(/\./) ? f : pre + f; // Si el campo viene con punto no se agrega el prefijo deducido
                return ret;
            })

            var s_top = s_select.match(/(\stop\s+\d+)/i); // Aislar top
            if (s_top) {
                s_select = s_select.replace(/(\stop\s+\d+)/i, ' ');
            } else {
                s_top = '';
            };

            var tmp_select = 'SELECT ' + s_top + ' ' + fields.join(',') + ' ';
            
            // Reemplazar sección select por texto anterior
            R['select'] = tmp_select;
            /*
            // Si existe order by, hay que sacar del order by los campos que no estén en la select
            if (R['order']){
                // aislar "order by"
                var s_order = R['order'].replace(/order\s+by/i,' ').split(',');
                var s_fields = [];

                s_order.forEach(function(x){
                    x = x.trim(); 
                    if  (fields.indexOf(x.split(' ')[0])>=0){ // Sólo incluir si está en la lista de campos de la select
                        s_fields.push(x);
                    }
                });
                
                // redefinir sección si hay resultados
                if (s_fields.length>0){
                    R['order'] = ' order by '+s_fields.join(',')+' ';
                }else{
                    R['order'] = ' ';
                }
            }*/

            // Si existe group by, incluir todos los campos de la select
            if (R['group']) {
                // aislar "group by"
                var s_group = R['group'].replace(/group\s+by/i, ' ').split(',');
                for (var i = 0; i < s_group.length; i++) {
                    s_group[i] = s_group[i].trim();
                };    // borrar espacios alrededor del campo del group

                var s_fields = [];

                fields.forEach(function (x) {
                    if (s_group.indexOf(x) < 0) { // Si no está en el group by, incluir
                        s_group.push(x);
                    }
                });

                // redefinir sección si hay resultados
                if (s_group.length > 0) {
                    R['group'] = ' group by ' + s_group.join(',') + ' ';
                } else {
                    R['group'] = ' ';
                }
            }
        }
        /* o.pagination -> convertir en select paginada */
        if (o.pagination) {
            var pag = o.pagination;
            // inicializar valores por defecto
            pag.page = pag.page || 1; // página 1 por defecto
            pag.size = pag.size || 9999; // largo página 10000 por defecto
            pag.minRow = pag.minRow || pag.start || (pag.page - 1) * (pag.size); // Inicio de página
            pag.maxRow = pag.maxRow || pag.minRow + pag.size + 1; // Fin de página
            // Generar texto para paginación 
            var s_order = R['order'].replace(/order by/i, ' '); // Aislar Order by
            var s_select = R['select'].replace(/select/i, ' ');// Aislar select
            var s_top = s_select.match(/(\stop\s+\d+)/i); // Aislar top
            if (s_top) {
                s_select = s_select.replace(/(\stop\s+\d+)/i, ' ');
            } else {
                s_top = '';
            };


            var tmp_select, s_epilogue, tmp_select_key, s_epilogue_key;
            // Tipo de paginación: Se puede paginar por número de página (pag.page) o por key (pag.key)
            if (pag.key) {
                R['order'] = ' ';   // Eliminar sección order
                tmp_select_key = ' declare @goalRow int declare @minRow int declare @maxRow int set @goalRow = ( ' +
                    ' SELECT top 1 RowNum from ( SELECT ROW_NUMBER() OVER ( ORDER BY ' + s_order + ' ) as RowNum,' + s_select + ' ';
                tmp_select = ' SELECT      * from ( SELECT ROW_NUMBER() OVER ( ORDER BY ' + s_order + ' ) as RowNum,' + s_select + ' ';
                s_epilogue_key = ") as RRows WHERE " + pag.key + " ) " +
                    " set @minRow = FLOOR(@goalRow/" + pag.size + ")*" + pag.size +
                    " set @maxRow = @minRow+" + pag.size + "+1 ";

                s_epilogue = ") as RRows WHERE RowNum > @minRow and RowNum < @maxRow ";

                // Copiar la select completa, transformar a string y anexar en el prólogo de la select final
                var Rkey = JSON.parse(JSON.stringify(R));
                Rkey['select'] = tmp_select_key;
                Rkey['epilogue'] = s_epilogue_key;
                var RkeyStr = '';
                for (var key in Rkey) {
                    RkeyStr += Rkey[key];
                }

                R['select'] = RkeyStr + " " + tmp_select;
                R['epilogue'] = s_epilogue;
            } else {
                if (TSQL_POST_2012) {
                    R['epilogue'] = ' OFFSET ' + pag.minRow + ' ROWS FETCH NEXT ' + pag.size + ' ROWS ONLY';
                    R['order'] = ' ORDER BY ' + getOrderBy(pag.order);
                } else {
                    // Versión SQL < 2012
                    R['order'] = ' ';   // Eliminar sección order
                    tmp_select = 'SELECT ' + s_top + ' * from ( SELECT ROW_NUMBER() OVER ( ORDER BY ' + s_order + ' ) as RowNum,' + s_select + ' ';
                    s_epilogue = ") as RRows WHERE RowNum > " + pag.minRow + " and RowNum < " + pag.maxRow + " ";

                    // Reemplazar sección select por texto anterior
                    R['select'] = tmp_select;
                    R['epilogue'] = s_epilogue;
                }
            }
        }
    }
    /** Fin opciones **/

    // Concatenar sql statement
    var ret = '';
    for (var key in R) {
        if (R.hasOwnProperty(key)) {
            ret += R[key];
        }
    }
    return ret;
}


if (typeof process !== 'undefined') { // Running on node?
    exports.SQLcast = SQLcast;
    exports.SQLexpr = SQLexpr;
}

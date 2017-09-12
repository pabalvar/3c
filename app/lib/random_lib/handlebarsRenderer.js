'use strict';
var console = process.console,
    Handlebars = require('handlebars'),
    HandlebarsIntl = require('handlebars-intl'),
    _ = require('lodash'),
    Moment = require('moment');

exports.renderDocument = function(model, templ) {
    HandlebarsIntl.registerWith(Handlebars);
    var intlData = {
        locales: ['es-CL']
    };

    /**
     * Number.prototype.format(n, x, s, c)
     * 
     * @param integer n: length of decimal
     * @param integer x: length of whole part
     * @param mixed   s: sections delimiter
     * @param mixed   c: decimal delimiter
     */
    Number.prototype.format = function(n, x, s, c) {
        var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
            num = this.toFixed(Math.max(0, ~~n));

        return(c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
    };

    Handlebars.registerHelper("round", function(lvalue, operator) {

        var err = true;
        if(_.isFinite(lvalue)) {
            if(lvalue.format) {
                err = false;
                lvalue = lvalue.format(operator, 3, '.', ',');
            }
        }
        if(err) {
            console.tag("render", "round").Warning("Error, no es numérico:", lvalue);
            lvalue = '#error';
        }
        return lvalue;
    });
    // Suma a una fecha. Ejemplo "dateAdd value 2 months"
    Handlebars.registerHelper("ifDateBetween", function(fechaini,fechafin,periodo_ini,month_offset,options){
        var p_ini,p_fin,f_ini,f_fin,ret;
        
        //console.log("ESTOY HAY: ",fechaini,fechafin,periodo_ini,typeof(fechaini),typeof(fechafin),typeof(periodo_ini));
        // Castear fechas que pueden venir como string o Date
        f_ini = (typeof(fechaini)=='string')?Moment.utc(fechaini, "YYYY-MM-DD"):Moment.utc(fechaini);
        f_fin = (typeof(fechafin)=='string')?Moment.utc(fechafin, "YYYY-MM-DD"):Moment.utc(fechafin);
        p_ini = (typeof(periodo_ini)=='string')?Moment.utc(periodo_ini, "YYYY-MM-DD"):Moment.utc(periodo_ini);
        p_fin = (typeof(periodo_ini)=='string')?Moment.utc(periodo_ini, "YYYY-MM-DD"):Moment.utc(periodo_ini);
        
        
        if (p_ini && p_fin && f_ini && f_fin){
            // Compara alfabéticamente. Si está dentro del período, retorna true
            ret = (
                (f_ini.format('YYYY-MM-DD') <  p_fin.add(month_offset+1,'months').startOf('month').format('YYYY-MM-DD')) &&
                (f_fin.format('YYYY-MM-DD') >= p_ini.add(month_offset,'months').startOf('month').format('YYYY-MM-DD'))
            )
            //console.log("ESTOY HAY2: ",f_ini.format('YYYY-MM-DD'),f_fin.format('YYYY-MM-DD'),p_ini,p_fin);
        }else{
            console.tag("render").Warning("Error en formato ifDateBetween", fechaini);
        }
        
        return ret?options.fn(this):options.inverse(this);
        
    });
    
    Handlebars.registerHelper("date", function(lvalue, format) {
        var ret,fecha;
        // mostrar fecha
        var err = true;
        format = format||'DD-MM-YYYY';

        if (typeof(lvalue)=='object'){
            fecha = Moment.utc(lvalue);
        }else{
           fecha = Moment(lvalue, "YYYY-MM-DD");
        }
           
        if(fecha) {
            if(fecha.format) {
                err = false;
                ret = fecha.locale('es').format(format);
            }
        }
        if(err) {
            console.tag("render").Warning("Valor en formato fecha", lvalue);
            lvalue = '#error';
        }
        return ret;
    });

    // formatea numero con decimal máximo sólo si es necesario. 1.02 --> 1,02; 1.00 --> 1
    Handlebars.registerHelper("number", function(lvalue, Decimals, Format) {
        var err = true;
        // Normalizar decimal a redondeo por defecto    

        var decimals = isNaN(Decimals) ? 2 : Decimals;
        var format = Format || '';
        var pre = '';
        var post = '';
        if(format == 'CLP') pre = '$ ';

        // retornar formateo
        if(!isNaN(lvalue) && !(lvalue == null)) {
            if(lvalue.format) {
                err = false;
                // Si no son necesario los decimales, quitarlos
                if(Math.round(lvalue) == lvalue) {
                    decimals = 0;
                }
                lvalue = pre + lvalue.format(decimals, 3, '.', ',') + post;
            }
        }
        if(err) {
            console.tag("render", "number").Warning("Valor en formato no numérico", lvalue);
            lvalue = '#error';
        }
        return lvalue;
    });
    Handlebars.registerHelper({
        eq: function (v1, v2) {
            return v1 === v2;
        },
        ne: function (v1, v2) {
            return v1 !== v2;
        },
        lt: function (v1, v2) {
            return v1 < v2;
        },
        gt: function (v1, v2) {
            return v1 > v2;
        },
        lte: function (v1, v2) {
            return v1 <= v2;
        },
        gte: function (v1, v2) {
            return v1 >= v2;
        },
        and: function (v1, v2) {
            return v1 && v2;
        },
        or: function (v1, v2) {
            return v1 || v2;
        }
    });
    Handlebars.registerHelper("apply", function(lvalue, operator) {
        var op = 'lvalue' + operator;
        try {
            eval("lvalue = " + op);
        } catch(err) {
            console.tag("render", "apply").Warning("ERROR: ", "lvalue = " + op);
            lvalue = '#error';
        }
        return lvalue;
    });
    Handlebars.registerHelper("len", function(json) {
        return Object.keys(json).length;
    });

    /** Preproceso **/
    // Si hay instrucciones handlebars en comentarios, sacarlos del comentario. i.e.
    // <!-- {{miVar}} -->  convertir en {{miVar}}
    // Esto permite usar {{}} en partes que el editor WYSIWYG si no borraría (por ejemplo dentro de un <table>)
    //var re = /<!--+\s*(\{\{[^}]+\}\})\s*-+->/g;
    //var template = Handlebars.compile(templ.replace(re, '$1')); //PAD: Ver si se necesita
    var template = Handlebars.compile(templ);
    
    var ret = template(model, {
        data: {
            intl: intlData
        }
    });

    return ret;

}
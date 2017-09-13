'use strict';

var console = process.console,
    Moment = require('moment');

exports.XCONTRAT = {
    'KOCON':{
        // si viene vacío, normalizar a undefined para que aplique regla según insert SQL
        transform: function(x,l){
            var ret = String(x||'').trim(); // convertir x a string
            return x||undefined; 
        },
        required:true
    },
    'FECHAINI':{
        // Usar moment para inerpretar mejor las fechas
        
        transform: function(x) {
            if (typeof (x) == 'string') {
                return Moment(x, 'YYYYMMDD').format('YYYYMMDD');
            } else if (typeof (x) == 'number') {
                return Moment(x).utc().format('YYYYMMDD');
            }
        },
        required:true
    },
    'FECHAFIN':{
        // Fechafin si no viene se transforma en el año 3000
        transform: function(x) {
            if (!x) return '30000101'
            if (typeof (x) == 'string') {
                return Moment(x, 'YYYYMMDD').format('YYYYMMDD');
            } else if (typeof (x) == 'number') {
                return Moment(x).utc().format('YYYYMMDD');
            } 
        },
        required:true
    }
}

'use strict';

/** Pregunta si un string se puede convertir en una cadena JSON, tolera que le falten comillas a los nombres de atributos.
*
@param {string} str Corresponde a un string que se desea comprobar si se puede convertir en objeto
@returns boolean True si es que se puede convertir, false en caso contrario.
@example { clase: 'SALUD'} => true
*/


exports.IsJsonString= function(str) {
    try {
        JSON.parse(str.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": '));
    } catch (e) {
        return false;
    }
    return true;
}

/** Convierte un string en una cadena JSON, tolera que le falten comillas a los nombres de atributos.
*
@param {string} str
@returns {object} Si todo va bien, devuelve un objeto sino un objeto vacio {}.
@example 1. { clase: 'SALUD'} => {'clase': 'SALUD'}
         2. { clase : SALUD } => {}
*/
exports.parseJSONString= function(str){
  var obj;
  try {
        obj=JSON.parse(str.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": '));
      } catch (e) {
          //return {};
      }
      return obj;
}

/**
*Convierte un elemento en string y le agrega comillas simples
@param {string | int | date}
*/
exports.quotesParam= function(elem){
  return " '"+String(elem)+"' ";
}

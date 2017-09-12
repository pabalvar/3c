'use strict';

var _ = require('lodash'),
    console = process.console,
    PaisesDB = require('../queries/paises.queries'),
    RegionesDB = require('../queries/region.queries'),
    ComunasDB = require('../queries/comunas.queries');

exports.paises = {
    query: function (req, res, next) {
        req.consultas.paises = PaisesDB.getPaisesQuery(req.query);
        next();
    }
};

exports.regiones = {
    query: function (req, res, next) {
        req.consultas.regiones = RegionesDB.getRegionesQuery(req.query);
        next();
    }
};

exports.comunas = {
    query: function (req, res, next) {
        req.consultas.comunas = ComunasDB.getComunasQuery(req.query);
        next();
    }
};


// Función abajo para encontrar heurísticamente coincidencia
var lcs = function lcs(lcstest, lcstarget) {
    var matchfound, lsclen, lscos, re, temp, result;

    matchfound = 0;
    lsclen = lcstest.length;

    for (var lcsi = 0; lcsi < lcstest.length; lcsi++) {
        lscos = 0;
        for (var lcsj = 0; lcsj < lcsi + 1; lcsj++) {
            re = new RegExp("(?:.{" + lscos + "})(.{" + lsclen + "})", "i");
            temp = re.test(lcstest);
            re = new RegExp("(" + RegExp.$1 + ")", "i");
            if (re.test(lcstarget)) {
                matchfound = 1;
                result = RegExp.$1;
                break;
            }
            lscos = lscos + 1;
        }
        if (matchfound == 1) {
            return result.length;
        }
        lsclen = lsclen - 1;
    }
    result = "";
    return result.length;
}

var unaccent = function (word) {
    var ret = word;
    var accents = [
        { base: 'A', letters: /[AaÁá]/g },
        { base: 'E', letters: /[EeÉé]/g },
        { base: 'I', letters: /[IiÍí]/g },
        { base: 'O', letters: /[OoÓó]/g },
        { base: 'U', letters: /[UuÚúÜü]/g }
    ]
    for (var i = 0; i < accents.length; i++) {
        ret = ret.replace(accents[i].letters, accents[i].base);
    }
    //console.log("CONVERT:::",word," ",ret);
    return ret;
}

exports.helpers = {
    /** Normaliza pais,comuna,region dado un objeto NOKOCM,NOKOREG,NOKOPA **/
    encode: function (req, line) {
        // Alias para buscadores:
        var P = req.resultados.paises;
        var R = req.resultados.regiones;
        var C = req.resultados.comunas;

        // Si no hay pais, obtener pais
        if (!line.KOPA && line.NOKOPA) {
            for (var i = 0; i < P.length; i++) {
                var s1 = unaccent(P[i].NOKOPA.toUpperCase());
                var s2 = unaccent(line.NOKOPA.toUpperCase());
                if ((s1 == s2) || (lcs(s1, s2) > 4)) {
                    line.KOPA = P[i].KOPA;
                    break;
                }
            }
            if (!line.KOPA) {
                console.tag("paises", "helpers", "encode").Error("Pais no conocido:" + line.NOKOPA);
            }
        };

        // Si no hay región, obtener región
        if (!line.KOREG && line.NOKOREG) {
            var bestIx = -1;
            var bestPt = -1;
            for (var i = 0; i < R.length; i++) {
                // Si viene pais descartar si no coinciden
                if (line.KOPA && line.KOPA != C[i].KOPA)
                    continue;
                // Si coinciden exactamente salir, si no, anotar puntaje    
                var s1 = unaccent(R[i].NOKOREG.toUpperCase());
                var s2 = unaccent(line.NOKOREG.toUpperCase());
                if (s1 == s2) {
                    bestPt = 999; // Si lo encuentra, le da harto puntaje para que lo considere positivo
                    bestIx = i;
                    break;
                } else {
                    var pt = lcs(s1, s2);
                    if (pt > bestPt) {
                        bestPt = pt;
                        bestIx = i;
                    }
                }
            }
            if (bestPt > 3) {// Si tiene más de 4 letras iguales se considera encontrado
                line.KOREG = R[bestIx].KOREG;
                // Si aun no se han llenado pais, agregar
                if (!line.KOPA) line.KOPA = R[bestIx].KOPA;
            } else {
                console.tag("paises", "helpers", "encode").Error("Región no conocida:" + line.NOKOREG);
            }
        };

        // Si no hay comuna, obtener comuna
        if (!line.KOCM && line.NOKOCM) {
            var bestIx = -1;
            var bestPt = -1;
            for (var i = 0; i < C.length; i++) {
                // Si viene pais o región, descartar si no coinciden
                if ((line.KOPA && line.KOPA != C[i].KOPA) || (line.KOREG && line.KOREG != C[i].KOREG))
                    continue;
                // Si coinciden exactamente salir, si no, anotar puntaje    
                var s1 = unaccent(C[i].NOKOCM.toUpperCase());
                var s2 = unaccent(line.NOKOCM.toUpperCase());
                if (s1 == s2) {
                    bestPt = 999; // Si lo encuentra, le da harto puntaje para que lo considere positivo
                    bestIx = i;
                    break;
                } else {
                    var pt = lcs(s1, s2);
                    if (pt > bestPt) {
                        bestPt = pt;
                        bestIx = i;
                    }
                }
            }
            if (bestPt > 4) {// Si tiene más de 4 letras iguales se considera encontrado
                //console.log("in: ",line.NOKOCM," out: ",C[bestIx].NOKOCM);
                line.KOCM = C[bestIx].KOCM;
                // Si aun no se han llenado pais y region, agregar
                if (!line.KOREG) line.KOREG = C[bestIx].KOREG;
                if (!line.KOPA) line.KOPA = C[bestIx].KOPA;
            } else {
                console.tag("paises", "helpers", "encode").Error("Comuna no conocido:" + line.NOKOCM);
            }
        };
        return line;
    }
}


exports.paisId = function (req, res, next, id) {
    req.paisId = id;
    next();
};

exports.regionId = function (req, res, next, id) {
    req.regionId = id;
    next();
};

exports.comunaId = function (req, res, next, id) {
    req.comunaId = id;
    next();
};
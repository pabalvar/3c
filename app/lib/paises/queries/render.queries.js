'use strict';

var squel = require('squel').useFlavour('mssql'),
    SQLcast= require('../../../../app/lib/random_lib/castSQL').SQLcast,
    SQLexpr= require('../../../../app/lib/random_lib/castSQL').SQLexpr,
    console= process.console;


var getDireccionQuery = `
SELECT
  XP.UIDXPERSON,C.UIDXCONTRAT,
  XP.KOPA,XP.KOREG,XP.KOCM,XP.DIRCALLE,XP.DIRNUMERO,XP.DIRADD,XP.DIRPLZ,
  PA.NOKOPA,RG.NOKOREG,CM.NOKOCM
FROM 
  XPERSON XP
  left join XCONTRAT C on C.UIDXPERSON = XP.UIDXPERSON
  left join XTABPA  PA on PA.KOPA = XP.KOPA -- link Pais
  left join XTABREG  RG on PA.UIDXTABPA = RG.UIDXTABPA and RG.KOREG = XP.KOREG -- link Región
  left join XTABCM  CM on RG.UIDXTABREG = CM.UIDXTABREG and CM.KOCM = XP.KOCM -- link Comuna
WHERE 1=1
  and XP.UIDXPERSON in (select UIDXPERSON from XPERSON)--<< uidxperson
  and C.UIDXCONTRAT in (select UIDXCONTRAT from XCONTRAT)--<< contracts
`

exports.getDireccion = function(params,output){
    return SQLcast(getDireccionQuery,params||{});
}

'use strict';

var SQLcast= require('../../../../app/lib/random_lib/castSQL').SQLcast,
    SQLexpr= require('../../../../app/lib/random_lib/castSQL').SQLexpr,
    console= process.console;

var getRegionesQuerySQL = `
DECLARE @searchString NVARCHAR(100)
set @searchString = 'xxxxxx'--<< search

-->> select
SELECT 
  PA.KOPA,RG.KOREG,RG.NOKOREG

-->> from
FROM
  XTABREG RG
  inner join XTABPA PA on PA.UIDXTABPA = RG.UIDXTABPA

-->> where
WHERE 1=1
  -- se agrega collation para ignorar acentos y mayusculas
  AND PA.NOKOPA = 'CHILE'--<< pais
  COLLATE SQL_Latin1_General_CP1_CI_AS --<< pais?

  AND PA.KOPA = 'CHL'--<< kopais
  COLLATE SQL_Latin1_General_CP1_CI_AS --<< kopais?

  AND RG.NOKOREG = 'BIOBÍO'--<< region
  COLLATE SQL_Latin1_General_CP1_CI_AS --<< region?
  
  AND RG.KOREG = 'BI'--<< koregion
  COLLATE SQL_Latin1_General_CP1_CI_AS --<< koregion?
  
  AND PA.NOKOPA+'_'+PA.KOPA+'_'+RG.NOKOREG+'_'+RG.KOREG like '%'+@searchString+'%' --<< search?
  COLLATE SQL_Latin1_General_CP1_CI_AS --<< search?

-->> order
ORDER BY 
  RG.NOKOREG asc
`;

exports.getRegionesQuery = function(params,output){
    return SQLcast(getRegionesQuerySQL,params||{});
}
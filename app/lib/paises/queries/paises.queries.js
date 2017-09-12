'use strict';

var SQLcast= require('../../../../app/lib/random_lib/castSQL').SQLcast,
    SQLexpr= require('../../../../app/lib/random_lib/castSQL').SQLexpr,
    console= process.console;

var getPaisesQuerySQL = `
DECLARE @searchString NVARCHAR(100)
set @searchString = 'xxxxxx'--<< search

-->> select
SELECT 
  PA.KOPA,PA.NOKOPA

-->> from
FROM
  XTABPA  PA

-->> where
WHERE 1=1
  -- se agrega collation para ignorar acentos y mayusculas
  AND PA.NOKOPA = 'CHILE'--<< pais
  COLLATE SQL_Latin1_General_CP1_CI_AS --<< pais?

  AND PA.KOPA = 'CHL'--<< kopais
  COLLATE SQL_Latin1_General_CP1_CI_AS --<< kopais?

  AND PA.NOKOPA+'_'+PA.KOPA like '%'+@searchString+'%' --<< search?
  COLLATE SQL_Latin1_General_CP1_CI_AS --<< search?

-->> order
ORDER BY 
  PA.NOKOPA asc
`;

exports.getPaisesQuery = function(params,output){
    return SQLcast(getPaisesQuerySQL,params||{});
}
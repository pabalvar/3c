'use strict';

var SQLcast = require('../lib/random_lib/castSQL').SQLcast;

/** GET **/
exports.getTrazaDocu = getTrazaDocu;


// Detalles de implementación
function getTrazaDocu(req, res, next) {
    req.consultas.trazadocu = SQLcast(getTrazaDocuSQL(), req.query, req.pagination);
    next();
}

function getTrazaDocuSQL(){
return `
WITH DDO_A AS
(
  -- seleccionar punto de partida
  SELECT IDMAEEDO,IDMAEDDO,IDRST,TIDO,NUDO 
  FROM MAEDDO 
  WHERE 1=1
    and IDMAEEDO = 123--<< idmaeedo
    and IDMAEDDO = 1844--<< idmaeddo
    and TIDO = 'FCV'--<< tido
    and NUDO = '123'--<< nudo

  -- seleccionar hacia adelante
  UNION ALL
  SELECT b.IDMAEEDO,b.IDMAEDDO,b.IDRST,b.TIDO, b.NUDO
  FROM MAEDDO b INNER JOIN DDO_A a
  ON a.IDRST = b.IDMAEDDO  
)
SELECT * INTO #DDO_A FROM DDO_A;

WITH DDO_B AS (
  SELECT * from #DDO_A
  
  -- seleccionar hacia atrás
  UNION ALL
  SELECT b.IDMAEEDO, b.IDMAEDDO, b.IDRST, b.TIDO, b.NUDO
  FROM MAEDDO b INNER JOIN #DDO_A a
  ON a.IDMAEDDO = b.IDRST
)
-->> select
SELECT
  IDMAEEDO,IDMAEDDO,IDRST,TIDO,NUDO
-->> from
FROM
  DDO_B
-->> group
GROUP BY
  IDMAEEDO,IDMAEDDO, IDRST, TIDO, NUDO
-->> order
ORDER BY
  IDMAEEDO,IDMAEDDO
-->> final
drop table #DDO_A
`;
}
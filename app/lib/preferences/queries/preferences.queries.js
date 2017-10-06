'use strict';

var RandomLib = require('../../../../app/lib/random_lib/castSQL'),
    SQLCast = RandomLib.SQLcast,
    SQLexpr = RandomLib.SQLexpr;

exports.getPreferencesQuery = function (query, output) {
    var r = SQLCast(`
-->> select
SELECT
P.VARIABLE as variable,
P.VALUE as value,
P.EMPRESA as empresa,
P.MODULENAME as module,
L.IDXLOGIN as userid
-->> from
FROM
XPROFILE P,XLOGIN L
-->> where
WHERE
P.UIDXLOGIN = L.UIDXLOGIN -- Join: XLOGIN-XPROFILE
AND L.IDXLOGIN = 1--<< idxlogin
AND P.VARIABLE = 'canAccess'--<< variable
AND P.EMPRESA = '01'--<< empresa
AND P.MODULENAME = 'RRHH'--<< module
`, query, output);

    return r;
};

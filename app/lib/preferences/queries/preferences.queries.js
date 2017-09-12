'use strict';

var RandomLib= require('../../../../app/lib/random_lib/castSQL'),
    SQLCast= RandomLib.SQLcast,
    SQLexpr= RandomLib.SQLexpr,
    console= process.console;
/** Trae preferencia para el usuario indicado
*
* Filtros: idxlogin,variable,empresa,module
*/
exports.get = function(input_params){
    var p = {
        //Inicializo variables para que no entrege undefined y no aparezcan filtrados por defecto
        idxlogin: input_params.idxlogin||false,
        variable: input_params.variable||false,
        empresa : input_params.empresa||false,
        module  : input_params.module||false
    };

    var r = SQLCast(`
        SELECT
            P.VARIABLE as variable,
            P.VALUE as value,
            P.EMPRESA as empresa,
            P.MODULENAME as module,
            L.IDXLOGIN as userid
        FROM
            XPROFILE P,XLOGIN L
        WHERE
            P.UIDXLOGIN = L.UIDXLOGIN -- Join: XLOGIN -> XPROFILE
            and L.IDXLOGIN = 1--<< idxlogin
            and P.VARIABLE = 'canAccess'--<< variable
            and P.EMPRESA = '01'--<< empresa
            and P.MODULENAME = 'RRHH'--<< module
    `,p);
    
    return r;
};


exports.create = function(user){
    
    /*var p = {};
    p.username = user.email;
    
    var user_array = [user];
    
    user_array.forEach(function(e){
        e.isActive = e.isActive ? 1 : 0;
    });
    
    p.SQLexpr = new SQLexpr(user_array);
    p.SQLexpr.addFields(["username"]);
    p.SQLexpr.setTransform({
        "username":"{email}",
        "password":"CONVERT(char(64),HASHBYTES('sha2_256',LTRIM(RTRIM('{email}'))+LTRIM(RTRIM('{password}'))),2)"
    });
    p.SQLexpr.setAlias({
        "username":"USERNAME",
        "password":"PWD",
        "name":"NOMBRE",
        "firstLastName":"APP1",
        "secondLastName":"APP2",
        "email":"EMAIL",
        "isActive":"ISACTIVE"
  });
    p.campos = p.SQLexpr.fieldsToSQLString();
    p.lineas = p.SQLexpr.valuesToSQLString();
    
    var r = SQLcast(`
        DECLARE @userExistsCount int
        DECLARE @username varchar(50)

        SET @username = 'b@b.cl'--<< username
        SET @userExistsCount = (SELECT COUNT(*) FROM XLOGIN WHERE USERNAME = @username)

        IF @userExistsCount = 0
            INSERT INTO XLOGIN
            (USERNAME, PWD, NOMBRE, APP1, APP2, EMAIL, ISACTIVE) --<< campos
            VALUES
            ('b@b.cl', '12345', 'b', '', '', 'b@b.cl', 1) --<< lineas
        ELSE
            SELECT 'NOT_UNIQ' as status
    `,p);
    
    return r;*/
    return '';
};


exports.update = function(user_id, user){
    
    /*var p = {};
    p.user_id = user_id;
    if (typeof user.email != 'undefined') { p.username = user.email; }
    
    var user_array = [user];
    
    user_array.forEach(function(e){
        if (e.isActive) { e.isActive = e.isActive ? 1 : 0; }
        delete e.id;
        Object.keys(e).forEach(function (key) {
            if (e[key] == null) { delete e[key]; }
        });
    });;
    
    p.SQLexpr = new SQLexpr(user_array);
    if (user_array[0].email) { 
        p.SQLexpr.addFields(["username"]);
        p.SQLexpr.setTransform({
            "username":"{email}",
            "password":"CONVERT(char(64),HASHBYTES('sha2_256',LTRIM(RTRIM('{email}'))+LTRIM(RTRIM('{password}'))),2)"
        });
    } else {
        p.SQLexpr.setTransform({
            "password":"CONVERT(char(64),HASHBYTES('sha2_256',LTRIM(RTRIM(EMAIL))+LTRIM(RTRIM('{password}'))),2)"
        });
    }
    p.SQLexpr.setAlias({
        "username":"USERNAME",
        "password":"PWD",
        "name":"NOMBRE",
        "firstLastName":"APP1",
        "secondLastName":"APP2",
        "email":"EMAIL",
        "isActive":"ISACTIVE"
  });
    p.linea = p.SQLexpr.valuesToSQLString('set');
    
    if (typeof p.username != 'undefined'){
        var r = SQLcast(`
            DECLARE @user_id int
            DECLARE @userExistsCount int
            DECLARE @username varchar(50)

            SET @user_id = '0'--<< user_id
            SET @username = 'a@a.cl'--<< username
            SET @userExistsCount = (SELECT COUNT(*) FROM XLOGIN WHERE USERNAME = @username AND IDXLOGIN != @user_id)

            IF @userExistsCount = 0
                UPDATE XLOGIN
                SET
                USERNAME='a@a.cl', PWD='12345', NOMBRE='a', EMAIL='a@a.cl', ISACTIVE=1 --<< linea
                WHERE IDXLOGIN = @user_id
            ELSE
                SELECT 'NOT_UNIQ' as status
        `,p);
    } else {
        var r = SQLcast(`
            DECLARE @user_id int

            SET @user_id = '0'--<< user_id
            
            UPDATE XLOGIN
            SET
            USERNAME='a@a.cl', PWD='12345', NOMBRE='a', EMAIL='a@a.cl', ISACTIVE=1 --<< linea
            WHERE IDXLOGIN = @user_id
        `,p);
    }
    
    return r;*/
    return '';
};

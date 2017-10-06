'use strict';

var RandomLib = require('../../../../app/lib/random_lib/castSQL'),
	SQLcast = RandomLib.SQLcast,
	SQLexpr = RandomLib.SQLexpr;

// CRUD		
exports.getUsersQuery = function (query, output) {
	var r = SQLcast(`
-->> select
SELECT 
IDXLOGIN AS id
,NOMBRE AS name
,APP1 AS firstLastName
,APP2 AS secondLastName
,EMAIL AS email
,ISACTIVE AS isActive
,LASTLOGIN AS lastLogin
-->> from
FROM 
XLOGIN
-->> where
WHERE 1=1
AND IDXLOGIN = 1--<< idxlogin
	`, query, output);

	return r;
};

exports.createUsersQuery = function (user) {

	var p = {};
	p.username = user.email;

	var user_array = [user];

	user_array.forEach(function (e) {
		e.isActive = e.isActive ? 1 : 0;
	});

	p.SQLexpr = new SQLexpr(user_array);
	p.SQLexpr.addFields(["username"]);
	p.SQLexpr.setTransform({
		"username": "{email}",
		"password": "CONVERT(char(64),HASHBYTES('sha2_256',LTRIM(RTRIM('{email}'))+LTRIM(RTRIM('{password}'))),2)"
	});
	p.SQLexpr.setAlias({
		"username": "USERNAME",
		"password": "PWD",
		"name": "NOMBRE",
		"firstLastName": "APP1",
		"secondLastName": "APP2",
		"email": "EMAIL",
		"isActive": "ISACTIVE"
	});
	p.campos = p.SQLexpr.fieldsToSQLString();
	p.lineas = p.SQLexpr.valuesToSQLString();

	var r = SQLcast(`
		DECLARE @userExistsCount int
		DECLARE @username varchar(50)

		SET @username = 'a@a.cl'--<< username
		SET @userExistsCount = (SELECT COUNT(*) FROM XLOGIN WHERE USERNAME = @username)

		IF @userExistsCount = 0
			INSERT INTO XLOGIN
			(USERNAME, PWD, NOMBRE, APP1, APP2, EMAIL, ISACTIVE) --<< campos
			VALUES
			('a@a.cl', '12345', 'a', '', '', 'a@a.cl', 1) --<< lineas
		ELSE
			SELECT 'NOT_UNIQ' as status
	`, p);

	return r;
};

// Login

exports.checkValidPassword = function (user_credentials) {

	var p = {};
	p.username = user_credentials.username;
	p.password = user_credentials.password;

	var r = SQLcast(`
		DECLARE @userExistsId int = -1
		DECLARE @username varchar(50)
		DECLARE @password varchar(50)

		SET @username = 'a@a.cl'--<< username
		SET @password = '12345g'--<< password
		SET @userExistsId = (SELECT IDXLOGIN FROM XLOGIN WHERE USERNAME = @username AND ISACTIVE = 'True')

		IF @userExistsId != -1
			IF CONVERT(char(64),HASHBYTES('sha2_256',LTRIM(RTRIM(@username))+LTRIM(RTRIM(@password))),2) = (SELECT PWD FROM XLOGIN WHERE USERNAME = @username)
				BEGIN
					UPDATE XLOGIN SET LASTLOGIN = getDate() WHERE IDXLOGIN = @userExistsId
					SELECT @userExistsId as id, @username as username
				END
			ELSE
				SELECT 0 as id, 'dummy' as username
		ELSE
			SELECT -1 as id, 'dummy' as username
	`, p);

	return r;
};

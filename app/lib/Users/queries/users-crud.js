'use strict';

var RandomLib= require('../../../../app/lib/random_lib/castSQL'),
	SQLcast= RandomLib.SQLcast,
	SQLexpr= RandomLib.SQLexpr;

// CRUD		

exports.getAll = function(){
	var r = SQLcast(`
		SELECT IDXLOGIN AS id
      ,NOMBRE AS name
      ,APP1 AS firstLastName
      ,APP2 AS secondLastName
      ,EMAIL AS email
      ,ISACTIVE AS isActive
      ,LASTLOGIN AS lastLogin
		FROM XLOGIN
	`,{});
	
	return r;
};

exports.create = function(user){
	
	var p = {};
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

		SET @username = 'a@a.cl'--<< username
		SET @userExistsCount = (SELECT COUNT(*) FROM XLOGIN WHERE USERNAME = @username)

		IF @userExistsCount = 0
			INSERT INTO XLOGIN
			(USERNAME, PWD, NOMBRE, APP1, APP2, EMAIL, ISACTIVE) --<< campos
			VALUES
			('a@a.cl', '12345', 'a', '', '', 'a@a.cl', 1) --<< lineas
		ELSE
			SELECT 'NOT_UNIQ' as status
	`,p);
	
	return r;
};

exports.get = function(user_id){
	
	var p = {};
	p.user_id = user_id;
	
	var r = SQLcast(`
		DECLARE @user_id int

		SET @user_id = '0'--<< user_id
		
		SELECT IDXLOGIN AS id
			,USERNAME as username
      ,NOMBRE AS name
      ,APP1 AS firstLastName
      ,APP2 AS secondLastName
      ,EMAIL AS email
      ,ISACTIVE AS isActive
      ,LASTLOGIN AS lastLogin
		FROM XLOGIN
		WHERE IDXLOGIN = @user_id
	`,p);
	
	return r;
};

exports.update = function(user_id, user){
	
	var p = {};
	p.user_id = user_id;
	if (typeof user.email != 'undefined') { p.username = user.email; }
	
	var user_array = [user];
	
	user_array.forEach(function(e){
		if (typeof e.isActive != 'undefined') { e.isActive = e.isActive ? 1 : 0; }
		delete e.id;
		for (var key in e) {
			if (e[key] == null) { delete e[key]; }
		};
	});
	
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
	
	return r;
};

exports.delete = function(user_id){
	
	var p = {};
	p.user_id = user_id;
	
	var r = SQLcast(`
		DECLARE @user_id int

		SET @user_id = '0'--<< user_id

		DELETE FROM XLOGIN
		WHERE IDXLOGIN = @user_id
	`,p);
	
	return r;
};


// Login

exports.checkValidPassword = function(user_credentials){

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
	`,p);
	
	return r;
};



//join with 'Funcionario'

exports.checkExistence = function(funcionario_user_data){
	var p = {};
	p.username = funcionario_user_data.email;
	
	var r = SQLcast(`
		DECLARE @username varchar(50)
		DECLARE @uidxlogin uniqueidentifier
		DECLARE @funcionarioAssociatedCount int

		SET @username = 'glarrain@manager.cl'--<< username
		SET @uidxlogin = (SELECT UIDXLOGIN FROM XLOGIN WHERE USERNAME = @username)
		SET @funcionarioAssociatedCount = (SELECT COUNT(*) FROM XPERSON WHERE UIDXLOGIN = @uidxlogin)

		IF @funcionarioAssociatedCount = 0
			SELECT IDXLOGIN as id, NOMBRE as name, APP1 as firstLastName, APP2 as secondLastName FROM XLOGIN WHERE USERNAME = @username
		ELSE
			SELECT 'ALREADY_ASSOCIATED' as status
	`,p);
	
	return r;
};
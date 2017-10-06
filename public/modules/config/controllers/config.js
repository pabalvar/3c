'use strict';

angular.module('config')
	.controller('ConfigController', ['$scope', '$resource', 'db',
		function ($scope, $resource, db) {

			var original = {};
			var Objeto_Estados = {
				alerta: false,
				error: false,
				textoAlerta: '',
				textoError: ''
			};

			$scope.page = {
				title: 'Panel de Configuración'
			};

			$scope.VistaEstados = Object.create(Objeto_Estados);

			$scope.escogerPuertoDefault = function () {
				if ($scope.bool_port_default)
					$scope.form.port = 1433;

			};

			$scope.buscarDatosBD = function () {
				db.get(function (response) {
					$scope.form = response.config;
					original = angular.copy(response.config);

					//Si puerto corresponde a 1433, dejo activado la casilla de puerto default
					if ($scope.form.port == 1433)
						$scope.bool_port_default = true;

				}, function (errorResponse) {
					console.log(errorResponse);
					$scope.VistaEstados.error = true;
					$scope.VistaEstados.textoError = errorResponse.data.message;

				});
			};

			$scope.revert = function () {
				$scope.VistaEstados = Object.create(Objeto_Estados);

				return $scope.form = angular.copy(original),
					$scope.bd_config.$setPristine(),
					$scope.form.port == 1433 ? $scope.bool_port_default = true :
						$scope.bool_port_default = false;
			};

			$scope.canRevert = function () {
				return !angular.equals($scope.form, original) || !$scope.bd_config.$pristine;
			};

			$scope.canSubmit = function () {
				return $scope.bd_config.$valid && !angular.equals($scope.form, original);
			};

			$scope.guardar = function () {
				$scope.VistaEstados = Object.create(Objeto_Estados);
				var configdb = new db($scope.form);

				configdb.$save(function (response) {
					$scope.VistaEstados.alerta = true;
					$scope.VistaEstados.textoAlerta = response.message;
					original = angular.copy(response.config);  //El temporal se actualiza con valores nuevos
					$scope.form = angular.copy(original)   //Para que el formulario de angular se actualice
					$scope.bd_config.$setPristine();    //Para que la vista elimine alertas y mensajes de editado

				}, function (errorResponse) {
					console.log(errorResponse);
					$scope.VistaEstados.error = true;
					$scope.VistaEstados.textoError = errorResponse.data.message;

				});

			};

			$scope.resetConnection = function () {
				db.reset({},
					function (response) {
						console.log(response);
					},
					function (error) {
						console.log(error);
					});
			};

		}


	]);

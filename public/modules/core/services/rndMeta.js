'use strict';
/**
 * @ngdoc service
 * @name core.meta
 * @requires $resource
 * @requires auth_service
 * @description permite ejecutar una consulta SQL remotamente
**/
angular.module('core')
/*
	.factory('rndMeta', ['$resource', 'auth_service', 'rndDialog',
		function ($resource, auth_service, rndDialog) {
			return $resource('/meta/:id', { id: '@id' }, {
				get: {
					method: 'GET',
					transformResponse: function (_res) {
						var res = angular.fromJson(_res);
						console.log("Acá")
						// Agregar campo $estado
						//if (res.data) res.data = rndDialog.initMeta(res.data);
						//else
						//res.data = rndDialog.initMeta(res.meta);
						// Agregar referencia a campos en array para poder acceder por propiedad
						//res.data.forEach(f => { res.data[f.field] = f });
						return res;
					}
				}
			});
		}])*/
	.factory('rndMeta', ['$resource', 'auth_service', 'rndDialog',
		function ($resource, auth_service, rndDialog) {
			return function (name) {
				return $resource('/meta/:id', { id: name }, {
					get: {
						method: 'GET',
						transformResponse: function (_res) {
							var res = angular.fromJson(_res);

							// Inicializar el campo data
							if (res[name]) res.data = rndDialog.initMeta(res[name]);

							return res;
						}
					}
				})
			};
		}])

/*
$scope.$watch(function () { return auth_service.currentUser() }, function (newVal, oldValue) {
	$scope.currentUser = newVal;
	$scope.companies = [];
	$scope.changeCompany(undefined);

	if ($scope.currentUser) {
		Preferences.get({ idxlogin: $scope.currentUser.id, variable: 'canAccess' },
			function (res) {

				// Caso no se encuentra compañía, se entrega un valor por defecto sin privilegios
				var defaultCompany = {
					"name": "público",
					"id": "XX",
					"showImg": false,
					"showName": false
				}

				var out = res.data.map(e => ({
					img: e.src_image, //'images/companies/'+elem.id+'.png',
					name: e.name,
					id: e.id,
					showImg: false,
					showName: true
				}));

				if (out.length == 0) {
					// Avisar que no encontró empresa
					var warning = {
						message: 'Usuario no aparece con alguna empresa asociada'
					};
					console.log(warning.message);
					toastr.warning(warning.message, { progressBar: true });
					out.push(defaultCompany);
				}

				$scope.companies = out;
				$rootScope.companies = $scope.companies;

				$scope.changeCompany($scope.companies[0].id);
			});
	}
}, true)


$scope.changeCompany = function (companyID) {
	$rootScope.currentCompany = companyID;
}*/


angular.module('core')
	.service('rndEmpresa', ['$http', 'auth_service', function ($http, auth_service) {

		var ret = {
			empresas: undefined,
			selected: undefined,
			get: get,
			getEmpresas: getEmpresas,
			getData: getData,
			set: set
		}

		function set(id) { ret.selected = id; }
		function getEmpresas() { return ret.empresas }
		function get() { return ret.selected }
		function getData() {
			if (ret.empresas != undefined) return ret.empresas;
			return $http({
				method: 'GET',
				url: '/empresas',
				headers: { Authorization: 'Bearer ' + auth_service.getToken() }
			}).then(
				function (res) {

					//console.log("llegue: ", res);
					ret.empresas = res.data.data; // cargar las empresas
					ret.selected = res.data.data[0].EMPRESA // seleccionar la primera
					//if (ret.empresa==null) set(empresas[0].EMPRESA);
					return;
				});
		}
		return ret;

	}])
	.factory('rndEmpresaAjax', ['$resource', 'auth_service', function ($resource, auth_service) {
		return $resource('/empresas', { id: '@id' }, {
			get: {
				method: 'GET',
				headers: { Authorization: 'Bearer ' + auth_service.getToken() }
			},
			create: {
				method: 'POST',
				headers: { Authorization: 'Bearer ' + auth_service.getToken() }
			},
			upsert: {
				method: 'PATCH',
				headers: { Authorization: 'Bearer ' + auth_service.getToken() }
			},
			update: {
				method: 'PUT',
				headers: { Authorization: 'Bearer ' + auth_service.getToken() }
			},
			delete: {
				method: 'DELETE',
				headers: { Authorization: 'Bearer ' + auth_service.getToken() }
			}
		});
	}])





'use strict';

angular.module('users')

.controller('UserCtrl', ['$scope', '$state', '$stateParams', 'User', 'toastr',
function($scope, $state, $stateParams, User, toastr) {
	
	if($stateParams.user_id) {
		var user_id = $stateParams.user_id;
		$scope.user = User.get({ user_id: user_id }, function(){
			$scope.user.password = '';
			$scope.user.confirm_password = '';
			$scope.user_old = angular.copy($scope.user);
			$scope.user_diffs = {};
		}, function(){
			toastr.error('El Servicio no pudo encontrar al Usuario. Reintente.', {progressBar: true});
			$state.go('app.users.list', {}, {reload: true});
		});
	}
	
}])

.controller('UsersListCtrl', ['rndDTO','$scope', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'User', 'toastr', '$state', '$filter',
function(rndDTO, $scope, DTOptionsBuilder, DTColumnBuilder, $compile, User, toastr, $state, $filter) {

	$scope.dtOptions = DTOptionsBuilder.fromFnPromise(function() {
			return User.get(function(){},function(){
				toastr.error('El Servicio no pudo encontrar a los Usuarios. Reintente.', {progressBar: true});
			}).$promise;
	})
	.withPaginationType('simple_numbers')
	.withBootstrap()
	.withDataProp('data')
	.withOption('responsive', true)
	.withLanguage(rndDTO.language.es)
	.withOption('createdRow', function(row) {
		// Recompiling so we can bind Angular directive to the DT
		$compile(angular.element(row).contents())($scope);
	});
	
	$scope.dtColumns = [
		DTColumnBuilder.newColumn('email').withTitle('Email').withClass('all'),
		DTColumnBuilder.newColumn('name').withTitle('Nombre'),
		DTColumnBuilder.newColumn('firstLastName').withTitle('Apellido Paterno'),
		DTColumnBuilder.newColumn('secondLastName').withTitle('Apellido Materno'),
		DTColumnBuilder.newColumn('isActive').withTitle('Activo?').renderWith(function(data){return $filter('boolToStr')(data);}),
		DTColumnBuilder.newColumn('lastLogin').withTitle('Último Login').renderWith(function(data){return $filter('date')(data, 'dd/MM/yy - H:mm');}),
		DTColumnBuilder.newColumn(null).withTitle('Acciones').notSortable().withClass('all').renderWith(renderActions).withOption('width', '20%')
	];
	
	function renderActions(data) {
		return '<button ui-sref="app.users.show({ user_id: ' + data.id + ' })" class="btn btn-info btn-sm btn-border btn-rounded-20 btn-ef btn-ef-5 btn-ef-5a mb-10"><i class="fa fa-eye"></i> <span>Ver</span></button>&nbsp'
		+'<button ui-sref="app.users.edit({ user_id: ' + data.id + ' })" class="btn btn-warning btn-sm btn-border btn-rounded-20 btn-ef btn-ef-5 btn-ef-5a mb-10"><i class="fa fa-edit"></i> <span>Editar</span></button>&nbsp'
		+'<button ng-click="delete(' + data.id + ')" class="btn btn-danger btn-sm btn-border btn-rounded-20 btn-ef btn-ef-5 btn-ef-5a mb-10"><i class="fa fa-remove"></i> <span>Eliminar</span></button>&nbsp';
	};
	
	$scope.delete = function (user_id) {
		if (confirm('Estás seguro?')) {
			User.delete({ user_id: user_id }, function(){
				toastr.error('Usuario Eliminado.', {progressBar: true});
				$state.go('app.users.list', {}, {reload: true});
			}, function(){
				toastr.error('El Usuario no pudo ser Eliminado. Reintente.', {progressBar: true});
			});
		}
	};

}])

.controller('NewUserCtrl', ['$scope', 'toastr', '$state', 'User',
function($scope, toastr, $state, User) {
	
	$scope.editing = false;
	
	$scope.user = {
		isActive: true
	};
	
	$scope.submitForm = function(isValid) {
		if (isValid) {
			var user_aux = angular.copy($scope.user);
			var user_toSave = new User();
			delete user_aux['confirm_password'];
			user_toSave.data = user_aux;
			user_toSave.$save(function(result) {
				if (result.status == 'NOT_UNIQ') {
					toastr.error('El Email ya está usado. Pruebe con otro.', {progressBar: true});
				} else {
					toastr.success('Usuario Creado.', {progressBar: true});
					$state.go('app.users.list', {}, {reload: true});
				}
			},function(){
				toastr.error('El Servicio no pudo crear al Usuario. Reintente.', {progressBar: true});
			});
		} else {
			toastr.error('Formulario con Campos Inválidos.', {progressBar: true});
		}
	};

}])

.controller('EditUserCtrl', ['$scope', 'toastr', '$state', 'User',
function($scope, toastr, $state, User) {
	
	$scope.editing = true;
	$scope.noChanges = true;
	$scope.form_changes = {};
	
	function resetPasswords() {
		$scope.user.password = null;
		$scope.user.confirm_password = null;
	};
	
	$scope.setChangeEmail = function(){
		$scope.form_changes.changeEmail = !$scope.form_changes.changeEmail;
		if(!$scope.form_changes.changeEmail){
			$scope.user.email = $scope.user_old.email;
			resetPasswords();
		}
	};
	
	$scope.setChangePass = function(){
		$scope.form_changes.changePass = !$scope.form_changes.changePass;
		if(!$scope.form_changes.changePass){resetPasswords();}
	};
	
	function findDiff(original, edited) {
		var diff = {};
		for (var key in original) {
			if ((key.indexOf('$') == -1) && (key != 'confirm_password') && (original[key] !== edited[key]) && (edited[key] != null)) { diff[key] = edited[key]; }
		}
		return diff;
	}
	
	$scope.$watch('user', function(newVal, oldVal){
		$scope.user_diffs = findDiff($scope.user_old, newVal);
		if (!$.isEmptyObject($scope.user_diffs) && (!$scope.form_changes.changeEmail || (typeof $scope.user_diffs['email'] != 'undefined'))) { $scope.noChanges = false; }
		else { $scope.noChanges = true; }
	}, true);
	
	$scope.submitForm = function(isValid) {
		if (isValid) {
			var user_aux = angular.copy($scope.user);
			delete user_aux['confirm_password'];
			for (var key in user_aux) {
				if(typeof $scope.user_diffs[key] != 'undefined') { user_aux[key] = $scope.user_diffs[key]; }
				else if (key != 'id') { delete user_aux[key]; }
			}
			user_aux.$update(function(result) {
				if (result.status == 'NOT_UNIQ') {
					toastr.error('El Email ya está usado. Pruebe con otro.', {progressBar: true});
				} else {
					toastr.success('Usuario Actualizado.', {progressBar: true});
					$state.go('app.users.list', {}, {reload: true});
				}
			},function(){
				toastr.error('El Servicio no pudo editar al Usuario. Reintente.', {progressBar: true});
			});
		} else {
			toastr.error('Formulario con Campos Inválidos.', {progressBar: true});
		}
	};

}]);
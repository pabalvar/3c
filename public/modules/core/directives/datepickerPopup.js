//Corrige el problema de que al inicializar un datepicker con ng-model, la fecha no la muestre en el formato deseado
angular.module('core').directive('datepickerPopup', function (){
		    return {
		        restrict: 'EAC',
		        require: 'ngModel',
		        link: function(scope, element, attr, controller) {
		      //remove the default formatter from the input directive to prevent conflict
		      controller.$formatters.shift();
		  }
		}
		});

'use strict';
angular.module("core")
/** Selecciona en profile.selected. Requiere profile.data=[{id:'',name:'',default:true|false}] **/
.directive("rndSelectModo", function(){
  return{
    restrict:'E',
    replace: true,
    scope:{
      profiles: '=',
      showSelected: '@',
      icon:'@',
      title:'@'
    },
    templateUrl:'modules/core/directives/rndSelectModo.html',
	controller: function($scope){
        $scope.selected;
    
        // init default como seleccionado
        $scope.profiles.data.forEach(function(p){
                if (p.default){
                    $scope.profiles.selected = p;
                    $scope.selected = p.id;
                }
            });

        /** función que selecciona el perfil **/
        $scope.setProfile = function(id){
            $scope.profiles.data.forEach(function(p){
                if (p.id == id){
                    $scope.profiles.selected = p;
                }
            })
        }
    }
  }
})

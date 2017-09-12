
angular.module('core')
.service('rndCompany', function($rootScope){
  var M = {
    get:function(){
      return $rootScope.currentCompany;
    }
  }
    return M;
  
})




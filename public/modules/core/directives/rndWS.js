'use strict';
angular.module("core")
/** Selecciona en profile.selected. Requiere profile.data=[{id:'',name:'',default:true|false}] **/
.directive("rndWs", function(){
  return{
    restrict:'EA'
    ,transclude:true
    ,scope:{
        service:'=',
        isEmpty:'=',
        showEmpty:'@',
        hideBanner:'@'
    }
    ,template: `
<!-- Busy Bar -->
<md-progress-linear ng-if="service.busy" md-mode="indeterminate" ng-disabled="true"></md-progress-linear>      
<!-- contenido original -->
<div class="{{service.busy?'busy':''}} {{service.error?'dead':''}}">
    <ng-transclude></ng-transclude>
</div>
`
  }
})
/** Selecciona en profile.selected. Requiere profile.data=[{id:'',name:'',default:true|false}] **/
.directive("rndWss", function(){
  return{
    restrict:'EA'
    ,transclude:true
    ,scope:{
        isBusy:'=',
        isEmpty:'=',
        showEmpty:'@',
        hideBanner:'@'
    }
    ,template: `
<!-- Busy Bar -->
<md-progress-linear ng-if="isBusy[0].busy||isBusy[1].busy||isBusy[2].busy||isBusy[3].busy"  md-mode="indeterminate" ng-disabled="true"> </md-progress-linear>         
<!-- Data empty Bar -->
<div ng-if="!isEmpty && !(isBusy[0].busy||isBusy[1].busy||isBusy[2].busy||isBusy[3].busy) && !(isBusy[0].error||isBusy[1].error||isBusy[2].error||isBusy[3].error) && !hideBanner" class="alert alert-info "> No hay datos que mostrar</div>
<!-- contenido original -->
<div class="{{(isBusy[0].busy||isBusy[1].busy||isBusy[2].busy||isBusy[3].busy)?'busy':''}} {{(isBusy[0].error||isBusy[1].error||isBusy[2].error||isBusy[3].error)?'xdead':''}}">
    <ng-transclude ng-show="showEmpty || isEmpty||(isBusy[0].error||isBusy[1].error||isBusy[2].error||isBusy[3].error)" ></ng-transclude>
</div>
`
  }
})
.directive("rndReload", function(){
  return{
    restrict:'E',
    replace: true,
    scope:{
        isBusy:'=',
        reload:'='
    },
    template:'<li><a href ng-click="reload()" ><span uib-tooltip="recargar"><i class="fa" ng-class="(isBusy[0].busy||isBusy[1].busy||isBusy[2].busy||isBusy[3].busy)?\'fa-spin fa-spinner\':\'fa-refresh\'"/></span></a></li>'
  }
})

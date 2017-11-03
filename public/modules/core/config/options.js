'use strict';

//angular-datatables
angular.module('core').run(function () {

  //Para bloquear alertas de errores de datatables
  $.fn.dataTableExt.sErrMode = 'throw';
})


  //angular-breadcrumbs
  .config(function ($breadcrumbProvider) {
    $breadcrumbProvider.setOptions({
      templateUrl: '/modules/core/views/breadcrumb.html'
    });
  })

  //angular-language
  .config(['$translateProvider', function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
      prefix: 'modules/core/languages/',
      suffix: '.json'
    });
    $translateProvider.useLocalStorage();
    $translateProvider.preferredLanguage('es');
    $translateProvider.useSanitizeValueStrategy(null);
  }])

  //Theme

  .run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on('$stateChangeSuccess', function (event, toState) {

      event.targetScope.$watch('$viewContentLoaded', function () {

        angular.element('html, body, #content').animate({ scrollTop: 0 }, 200);

        setTimeout(function () {
          angular.element('#wrap').css('visibility', 'visible');

          if (!angular.element('.dropdown').hasClass('open')) {
            angular.element('.dropdown').find('>ul').slideUp();
          }
        }, 200);
      });
      //Para la estructura container de la pagina, se puede setear por estado o ruta
      $rootScope.containerClass = toState.containerClass;
      //Para mostrar o no mostrar, selector de fecha en breadcrumb
      //console.log(toState.showDateRangePicker);
      $rootScope.showDateRangePicker = toState.showDateRangePicker ? toState.showDateRangePicker : false;
    });
  }])

  .config(['uiSelectConfig', function (uiSelectConfig) {
    uiSelectConfig.theme = 'bootstrap';
  }])
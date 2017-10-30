'use strict';

/**
 * @ngdoc function
 * @name randomStack.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the randomStack
 */

angular.module('core')
  .controller('rdmMainCtrl',
  function ($scope, $rootScope, $http, $window, $translate, toastr, auth_service, rndEmpresa) {

    angular.extend($scope, {
      //Variables de login
      isLoggedIn: auth_service.isLoggedIn,
      currentUser: auth_service.currentUser(),
      //Variables asociadas a como se ve el template
      main: {
        title: 'Random ERP',
        settings: {
          navbarHeaderColor: 'scheme-light',// 'scheme-default',
          sidebarColor: 'scheme-light',//'scheme-default',
          brandingColor: 'scheme-greensea', //'scheme-default',
          activeColor: 'scheme-greensea',//'default-scheme-color',
          headerFixed: true,
          asideFixed: true,
          rightbarShow: false
        }
      }
    });

    /** Helper para obtener tamaño del viewport **/
    $scope.iframeWidth = $window.innerWidth;
    $scope.iframeHeight = $window.innerHeight;
    angular.element($window).bind('resize', function () {
      $scope.iframeWidth = $window.innerWidth;
      $scope.iframeHeight = $window.innerHeight;
      $scope.$digest();
    });  

    /*--------------------Variables y funciones asociadas a cambio de Lenguaje-----------------------*/
    $scope.languages = [
      { id: 'es', name: 'Español', img: 'images/flags/Spain.png' },
      { id: 'en', name: 'English', img: 'images/flags/United-States-of-America.png' },
      { id: 'de', name: 'German', img: 'images/flags/Germany.png' }
    ];

    $scope.changeLanguage = function (langKey) {
      $translate.use(langKey);
      $scope.currentLanguage = langKey;
    };
    $scope.currentLanguage = $translate.proposedLanguage() || $translate.use();

    /** Empresa */
    $scope.$watch(rndEmpresa.get, function(n,o){
      $scope.empresaSelected = n;
      $scope.empresas = rndEmpresa.getEmpresas();
    });
    $scope.setEmpresa = rndEmpresa.set;

    /*--------------Si el containerClass cambia se adquiere a nivel local------------*/
    $rootScope.$watch('containerClass', function (newValue, oldValue) {
      $scope.containerClass = newValue;
    })

  });

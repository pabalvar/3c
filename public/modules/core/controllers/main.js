'use strict';

/**
 * @ngdoc function
 * @name randomStack.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the randomStack
 */

angular.module('randomStack')

  .controller('rdmMainCtrl',
  function ($scope, $rootScope, $http, $window, $translate, toastr, auth_service, Preferences) {

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

    /*--------------------Variables y funciones asociadas a compañia-----------------------*/

    //Si el usuario cambia, cambia la empresa
    $scope.$watch(function () { return auth_service.currentUser() }, function (newVal, oldValue) {
      $scope.currentUser = newVal;
      $scope.companies = [];
      $scope.changeCompany(undefined);

      if ($scope.currentUser) {
        Preferences.canAccess({ userid: $scope.currentUser.id },
          function (res) {

            // Caso no se encuentra compañía, se entrega un valor por defecto sin privilegios
            var defaultCompany = {
              "name": "público",
              "id": "XX",
              "showImg": false,
              "showName": false
            }

            var out = res.map(e => ({
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
    }

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


    /*--------------Si el containerClass cambia se adquiere a nivel local------------*/
    $rootScope.$watch('containerClass', function (newValue, oldValue) {
      $scope.containerClass = newValue;
    })

  });

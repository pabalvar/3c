'use strict';

/**
 * @ngdoc directive
 * @name theme.directive:collapseSidebarSm
 * @description
 * # collapseSidebarSm
 */
angular.module('theme')
  .directive('collapseSidebar', function ($rootScope) {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {

        // obtener objetos
        var app = angular.element('.appWrapper');
        var $window = angular.element(window);
        var width = $window.width();
        var lastWidth = lastWidth||width;
        var timer;

        // agregar clase "sidebar-sm" al app-wrapper al iniciar
        redraw();

        $window.resize(function () {
            clearTimeout(timer);
            timer = setTimeout(redraw, 200);
        });

        element.on('click', function (e) {
          app.toggleClass('no-sidebar')
          e.preventDefault();
        });


        function redraw() {
          var width = $window.width();
          //console.log("performing redraw. last:",lastWidth, "current:", width)
          if (width > 991){
            app.removeClass('no-sidebar');
            app.removeClass('mobile')
          }else{
            app.addClass('no-sidebar');
            app.addClass('mobile');
          }
          // Actualizar ancho
          lastWidth= width;

        };

      }
    };
  });

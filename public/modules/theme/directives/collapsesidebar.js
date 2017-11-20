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

        // agregar clase "sidebar-sm" al app-wrapper al iniciar
        redraw();

        $window.resize(function () {
          if (width !== $window.width()) {
            var t;
            clearTimeout(t);
            t = setTimeout(redraw, 300);
          }
        });

        element.on('click', function (e) {
          app.toggleClass('no-sidebar')
          e.preventDefault();
        });

        function redraw() {
          var width = $window.width();
          if (width > 768){
            app.removeClass('no-sidebar');

          }else{
            app.addClass('no-sidebar');
          }

        };

      }
    };
  });

'use strict';
angular.module("core")
  .directive("rndExpand", function () {
    return {
      restrict: 'E',
      replace: true,

      link: function postLink(scope, element) {
        // Buscar elemento superior con la clase expandable
        var col = element.parents('.expandable');
        col.splice(1); // sólo el elemento inmediatemente anterior
        var redrawfn = scope.redraw;
        // obtener atributo default-class y guardarlo

        var defaultClass;
        try {
          defaultClass = col[0].attributes.getNamedItem('default-class').value;
        } catch (err) {
          console.warn("se debe definir un atributo default-class='col-lg-6' en el div con clase expandable. Botón expander se ocultará.");
        }

        // al iniciar agregar clase default
        if (defaultClass) {
          col.addClass('col-lg-12');
          element.addClass('wide-panel');

          element.on('click', function () {
            if (redrawfn) redrawfn();
            element.toggleClass('wide-panel');
            element.toggleClass('narrow-panel');
            if (col.hasClass(defaultClass)) {
              col.removeClass(defaultClass);
              col.addClass('col-lg-12');
            } else {
              col.removeClass('col-lg-12');
              col.addClass(defaultClass);
            }
          });

        } else {
          // Si no viene defaultClass ocultar botón
          element.remove();
        }

      },
      template: '<li><a href ><span class="wide-panel" uib-tooltip="ancho completo"><fa name="arrows-h"/></span><span class="narrow-panel" uib-tooltip="ancho normal"><fa name="columns"/></span></a></li>'
    }
  })

  .directive("rndMinimizar", function () {
    return {
      restrict: 'E',
      replace: true,
      template: '<li><a href rnd-tile-control-toggle><span class="minimize" uib-tooltip="minimizar"><fa name="angle-up"/></span><span class="expand" uib-tooltip="expandir"><fa name="angle-down"/></span></a></li>'
    }
  })
  .directive('rndTileControlToggle', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        var tile = element.parents('.tile');
        tile.splice(1); // sólo el elemento inmediatemente anterior

        element.on('click', function () {
          tile.toggleClass('collapsed');
          tile.children().not('.tile-header').slideToggle(150);
        });
      }
    };
  })
  .directive("rndFullscreen", function ($compile) {
    return {
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element) {
        // Obtener parent tile y obtener su atributo 'fullscreen'
        var tile = element.parents('.tile');
        var fs;
        try {
          fs = tile[0].attributes.getNamedItem('fullscreen').value;
          //scope.fullScreen = scope.fullScreen||{};
          scope[fs] = false;
          // reemplazar el elemento
          var html = '<li><a href ng-click="' + fs + ' = !' + fs + '"><span uib-tooltip="pantalla normal" ng-if="' + fs + '"><fa name="window-restore"/></span><span uib-tooltip="pantalla completa" ng-if="!' + fs + '"><fa name="window-maximize"/></span></a></li>';
          var e = $compile(html)(scope);
          element.replaceWith(e);
          element.on('click', function () {
            tile.trigger('click');
          });
        } catch (err) {
          // anexar variable al scope
          console.warn("no se encontró parent tile con atributo 'fullscreen'. Botón se elimina");
          element.remove();
        }

      }
    }
  })
  






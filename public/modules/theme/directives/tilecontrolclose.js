'use strict';

/**
 * @ngdoc directive
 * @name theme.directive:TileControlClose
 * @description
 * cierra un tile
 * # TileControlClose
 */

angular.module('theme').directive('tileControlClose', function () {
  return {
    restrict: 'A',
    link: function postLink(scope, element) {
      var tile = element.parents('.tile');

      element.on('click', function () {
        tile.addClass('closed').fadeOut();
      });
    }
  };
});

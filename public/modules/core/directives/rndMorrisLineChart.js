'use strict';

/**
 * @ngdoc directive
 * @name core.directive:chartMorris
 * @description
 * directiva para usar gráficos
 * # chartMorris
 * https://github.com/jasonshark/ng-morris/blob/master/src/ngMorris.js
 */

angular.module('core')
  .directive('rndMorrisLine', function () {

    return {
      restrict: 'A',
      scope: {
        params: '=',
      },
      link: function (scope, elem, attrs) {
        var morris;

        scope.$watch('params', function () {
          if (scope.params) {
            if (!morris) {
              morris = new Morris.Line({
                element: elem,
                data: scope.params.data,
                xkey: scope.params.xKey,
                ykeys: scope.params.yKeys,
                labels: scope.params.labels,
                lineColors: scope.params.colors || ['#0b62a4', '#7a92a3', '#4da74d', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
                lineWidth: scope.params.lineWidth || '4',
                fillOpacity: scope.params.fillOpacity || '0.8',
                grid: (scope.params.showGrid == false) ? false : true,
                hideHover: true,
                smooth: scope.params.smoot || false,
                //parseTime: scope.params.parseTime || false,
                events: scope.params.events || [],
                resize: true
              });
            } else {
              morris.options.events = scope.params.events || [];
              morris.setData(scope.params.data);
            }
          }
        }, true);
      }
    };
  })

  .directive('morrisAreaChart', function () {

    return {
      restrict: 'A',
      scope: {
        params: '=',
      },
      link: function (scope, elem, attrs) {
        var morris;

        scope.$watch('params', function () {
          if (scope.params) {
            if (!morris) {
              morris = new Morris.Area({
                element: elem,
                data: scope.params.data,
                xkey: scope.params.xKey,
                ykeys: scope.params.yKeys,
                labels: scope.params.labels,
                lineColors: scope.params.colors || ['#0b62a4', '#7a92a3', '#4da74d', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
                lineWidth: scope.params.lineWidth || '0',
                fillOpacity: scope.params.fillOpacity || '0.8',
                grid: scope.params.showGrid || false,
                hideHover: true,
                //parseTime: scope.params.parseTime || false,
                events: scope.params.events || [],
                resize: true
              });
            } else {
              morris.options.events = scope.params.events || [];
              morris.setData(scope.params.data);
            }
          }
        }, true);
      }
    };
  })

  .directive('morrisBarChart', function () {
    return {
      restrict: 'A',
      scope: {
        params: '=',
      },
      link: function (scope, elem, attrs) {

        var morris;

        scope.$watch('params', function () {
          if (scope.params) {
            if (!morris) {
              morris = new Morris.Bar({
                element: elem,
                data: scope.params.data,
                xkey: scope.params.xKey,
                ykeys: scope.params.yKeys,
                labels: scope.params.labels,
                barColors: scope.params.colors || ['#0b62a4', '#7a92a3', '#4da74d', '#afd8f8', '#edc240', '#cb4b4b', '#9440ed'],
                xLabelMargin: 2,
                resize: true,
                stacked: scope.params.stacked,
                hideHover: true,
                //hoverCallback: function (index, options, content, row) {
                //    return '<a href="#!/app/.../funcionarios">'+content+'</a>' ;
                //} // ASI se agregaría un link al popup
              });
            } else {
              morris.setData(scope.params.data);
            }
          }
          //elem.on('click', function(i,row){console.log("Aca un link a todo el chart",i,row);});
        }, true);
      }
    };
  })

  .directive('morrisDonutChart', function () {
    return {
      restrict: 'A',
      scope: {
        params: '=',
      },
      link: function (scope, elem, attrs) {
        var morris;
        scope.$watch('params', function () {
          if (scope.params) {
            if (!morris) {
              morris = new Morris.Donut({
                element: elem,
                data: scope.params.data,
                colors: scope.params.colors || ['#0B62A4', '#3980B5', '#679DC6', '#95BBD7', '#B0CCE1', '#095791', '#095085', '#083E67', '#052C48', '#042135'],
                resize: true
              });
            } else {
              morris.options.colors = scope.params.colors;
              morris.setData(scope.params.data);
            }
          }
        }, true);
      }
    };
  });

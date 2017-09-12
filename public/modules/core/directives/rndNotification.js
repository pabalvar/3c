'use strict';
angular.module("core")
  .directive('rndNotification', function ($timeout) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        type: '@',
        content: '@',
        show: '='
      },
      template: '<div data-ng-show="showNotification" class="alert alert-{{type}} text-center">{{content}}</div>',
      controller: function ($scope) {
        $scope.$watch('show', function (newValue) {
          if (newValue)
            $scope.showNotification = true;

          $timeout(function () {
            $scope.showNotification = false;
          }, 3000);
        });
      }
    }
  });

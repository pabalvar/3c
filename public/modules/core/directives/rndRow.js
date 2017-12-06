angular.module('core')
    .directive('rndRow', function () {
        return {
            restrict: 'EA',
            transclude: true,
            template:
                `<div class="row b-b m-0 pt-10" style="min-height: 36px;"><div ng-transclude></div></div>`
        }
    });

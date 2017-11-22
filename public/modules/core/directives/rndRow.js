angular.module('core')
    .directive('rndRow', function () {
        return {
            restrict: 'EA',
            transclude: true,
            template:
                `<div class="row b-b m-0" style="min-height: 36px;"><div class="p-outer"><div ng-transclude></div></div></div>`
        }
    });

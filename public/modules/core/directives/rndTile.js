angular.module('core')

    .directive('rndTile', [
        function () {
            return {
                restrict: 'EA',
                transclude: true,
                template: '<div class="tile rnd-b tile-shadow"><ng-transclude></ng-transclude></div>'
            }
        }
    ])
    .directive('rndTileHeader', [
        function () {
            return {
                restrict: 'EA',
                transclude: true,
                template: '<div class="tile-header dvd dvd-btm"><ng-transclude></ng-transclude></div>'
            }
        }
    ])
    .directive('rndTileWidget', [
        function () {
            return {
                restrict: 'EA',
                transclude: true,
                template: '<div class="tile rnd-b tile-shadow"><div class="tile-widget pb-5 pt-5"><ng-transclude></ng-transclude></div></div>'
            }
        }
    ])
    
    .directive('rndWidget', [
        function () {
            return {
                restrict: 'EA',
                transclude: true,
                template: '<div class="tile-widget tile-shadow"><ng-transclude></ng-transclude></div>'
            }
        }
    ])
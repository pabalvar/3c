angular.module('core')

    .directive('rndTile', [
        function () {
            return {
                restrict: 'EA',
                transclude:true,
                template:'<div class="tile"><ng-transclude></ng-transclude></div>'
            }
        }
    ]
    )
    .directive('rndTileWidget', [
        function () {
            return {
                restrict: 'EA',
                transclude:true,
                template:'<div class="tile"><div class="tile-widget"><ng-transclude></ng-transclude></div></div>'
            }
        }
    ]
    )
    .directive('rndWidget', [
        function () {
            return {
                restrict: 'EA',
                transclude:true,
                template:'<div class="tile-widget"><ng-transclude></ng-transclude></div>'
            }
        }
    ]
    )
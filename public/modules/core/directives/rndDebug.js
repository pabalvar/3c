angular.module('core')
    .directive('rndDebug', [function () {
            return {
                restrict: 'EA',
                template: '<span class="visible-xs">XS</span><span class="visible-sm">SM</span><span class="visible-md">MD</span><span class="visible-lg">LG</span>'
            }
    }]);
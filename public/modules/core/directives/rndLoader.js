angular.module("core")
.directive('rndLoader', function ($rootScope, $timeout) {
    return {
        restrict: 'A',
        replace: true,
        template: '<p class="rnd-loader"><i class="fa fa-spinner fa-spin"></i> </p>',
        link: function (scope, elem, attrs) {
            var hideLoaderTimeout;
            var minLoaderDisplayTime = attrs.minLoaderDisplay || 300;
            scope.data = {
                startTime: undefined
            };

            var unregisterStart = $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {
                scope.data.startTime = new Date();
                elem.removeClass('ng-hide');
            });

            var unregisterSuccess = $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
                var transitionTime = new Date() - scope.data.startTime;
                var loaderTimeout = minLoaderDisplayTime - transitionTime;
                loaderTimeout = loaderTimeout > 0 ? loaderTimeout : 0;
                hideLoaderTimeout = $timeout(function () {
                    elem.addClass('ng-hide');
                }, loaderTimeout);
            });

            var unregisterError = $rootScope.$on('$stateChangeError', function () {
                elem.addClass('ng-hide');
            });

            scope.$on('destroy', function () {
                unregisterStart();
                unregisterSuccess();
                unregisterError();
                $timeout.cancel(hideLoaderTimeout);
            });
        }
    };
});
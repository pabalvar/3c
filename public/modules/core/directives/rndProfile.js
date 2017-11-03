angular.module('core')
    /**
     * Directiva para mostrar genéricamente una estructura en que el primer dato es el nombre
     * @class rndProfile
     * @param {Object} options
     * @param {Boolean} options.closeButton
     * @param {Boolean} options.closeOnClick
     * @example
     * var tooltip = new mapboxgl.Popup()
     *   .setLatLng(map.unproject(e.point))
     *   .setHTML("<h1>Hello World!</h1>")
     *   .addTo(map);
     */
    .directive('rndProfile', [
        function () {
            return {
                restrict: 'EA',
                scope: {
                    options: "=",
                    dataset: "=",
                    source: "=",
                    meta: "=",
                    rtablas: "=?rtablas",
                },
                templateUrl: 'modules/core/directives/rndProfile.html',
            }
        }
    ]
    )

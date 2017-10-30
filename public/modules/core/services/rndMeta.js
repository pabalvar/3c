'use strict';

angular.module('core')
    .service('rndMeta', [function () {

        function rndMeta(meta, rtablas) {
            return function (res) {
                res.data.forEach(function (d) { d.$meta = meta; d.$rtablas = rtablas })
                return res.data;
            }
        }
        return rndMeta;
    }
    ])
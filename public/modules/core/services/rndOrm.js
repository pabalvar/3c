(function(){
'use strict';
angular.module("core")
    .service('rndORM', ['rndUuid', function (rndUuid) {

        var vm = {};

        vm.createObject = function (Data, model, input) {
            //if (!data) data = $scope.Personas.data;
            var obj = model.reduce(function (t, m) { t[m.field] = m.onInit ? m.onInit() : ''; return t }, {});
            if (input) {
                angular.extend(obj, input);
            }
            return obj;
        }

        vm.createEstado = function () {
            return {
                $action: 'N',
                $isOpen: true
            }
        }

        vm.newUuid = function () {
            return rndUuid();
        }
        vm.newString = function (input) {
            return function () {
                var ret = '';
                if (typeof (input) != 'undefined') ret = input;
                return ret;
            }
        }
        vm.newRandomString = function (input) {
            return function () {
                var ret = '';
                var prefix = 'ITEM';
                if (typeof (input) != 'undefined') prefix = input;
                ret = prefix + '_' + Math.floor(Math.random() * 1000);
                return ret;
            }
        }
        vm.newDate = function (input) {
            return function () {
                var ret = input;
                if (!input) ret = (new Date()).toISOString().substr(0, 10);
                return ret;
            }
        }
        return vm

    }]);
})()


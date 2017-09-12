angular.module('core')
    .factory('rndPage', function () {
        // State machine
        return function (_params) {
            var vm = {}

            // init
            var params = _params || {};
            vm.size = params.size || 5;
            vm.current = params.current || 1; // número página. Empieza en 1
            vm.maxSizeForm = params.maxSizeForm || 10;
            vm.onChange = params.onChange || function () { }

            vm.setPageSize = function (size) {
                vm.size = size;
                vm.current = 1;
                vm.onChange();
            }

            vm.getSize = function(){
                return vm.size;
            }

            vm.getStart = function () {				// paginación 
                return ((vm.current - 1) * vm.size);
            }
            vm.getLast = function (largo) {
                return Math.min(vm.getStart() + vm.size - 1, largo)
            }

            vm.rehash = function(largo){

            }

            return vm;
        }

    })
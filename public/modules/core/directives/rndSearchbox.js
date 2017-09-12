angular.module('core')

    .directive('rndSearchbox', [
        function () {
            return {
                restrict: 'EA',
                scope: {
                    onChange: '='
                },
                template:`<div class="input-group">
                            <input id="buscar"
                                   placeholder="buscar (entre visibles)"
                                   class="form-control"
                                   ng-model="filterString"
                                   ng-change="onChange(filterString)"
                                   ng-disabled="" />
                            <span class="input-group-btn">
                                <button  ng-disabled="true" type="button" class="btn btn-default"><i class="fa fa-search"></i></button>
                            </span>
                        </div>`

            }
        }
    ]
    )
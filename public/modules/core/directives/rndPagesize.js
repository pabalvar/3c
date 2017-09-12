angular.module('core')
    .directive('rndPageSize', [
        function () {
            return {
                restrict: 'EA',
                scope: {
                    rndPage: '=',
                },
                template:`<div uib-tooltip="resultados por página">
                            <button type="button"
                                    class="btn btn-default dropdown-toggle"
                                    data-toggle="dropdown">
                                <span>{{rndPage.size}}</span><span class="ml-5 caret"></span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-right">
                                <li><span class="text-center ml-10">resultados por página</span></li>
                                <li ng-repeat="s in [5,10,50,200,1000]"><a class="text-right"
                                       ng-click="rndPage.setPageSize(s)">
                                <span class="float-left text-muted">
                                    <fa class="mr-10" name="th-list"></fa>
                                    <fa ng-show="s <= rndPage.maxSizeForm" class="mr-10" name="th-large"></fa>
                                </span>{{s}}</a>
                                </li>
                            </ul>
                        </div>`

            }
        }
    ]
    )
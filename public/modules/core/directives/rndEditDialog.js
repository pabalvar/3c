angular.module('core')
.directive('rndEditDialog', [
    function () {
        return {
            restrict: 'EA',
            scope: {
                linea: '=',
                modelo:'='
            },
            Xtemplate:`<div> {{action}}</div>` ,
            template:`
            <div ng-if="linea.$estado.$isOpen">
            <pre>{{linea}}</pre> <pre>{{modelo}}</pre>
            </div>`
        }
    }
]
)

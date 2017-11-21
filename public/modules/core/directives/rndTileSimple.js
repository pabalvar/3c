angular.module('core')
.component('rndTileSimple', {
    bindings:{
        source:'='
    },
    template:`
<div ng-show="$ctrl.source" class="col-xs-6 b-l p-0">
  <section class="tile tile-simple">
    <div class="tile-body text-center p-0">
      <h1 class="m-0">{{$ctrl.source.value}}</h1>
      <span class="text-muted">{{$ctrl.source.name}}</span>
    </div>
  </section>
</div>
`
})


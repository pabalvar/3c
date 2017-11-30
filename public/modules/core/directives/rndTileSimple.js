angular.module('core')
  .component('rndTileSimple', {
    bindings: {
      source: '=',
      options: '='
    },
    transclude: true,
    template: `
<div class="col-xs-6 b-l p-0">
  <section class="tile tile-simple">
    <div class="tile-body text-center p-0">
      <h1 class="m-0"><ng-transclude></ng-transclude></h1>
      <span class="text-muted">{{$ctrl.options.title}}</span>
    </div>
  </section>
</div>
`
  })


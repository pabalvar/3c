angular.module('core')
.component('rndBreadcrumb', {
    transclude:true,
    template:
`<div class="pageheader rnd-white lter b-b shadow-b">
   <div class="page-bar ">
      <ncy-breadcrumb class="hidden-xxs"></ncy-breadcrumb>
      <span style="position:absolute; right:20px;" ng-transclude></span>
   </div>
 </div>
`
})


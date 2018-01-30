'use strict';

module.exports = {
    templateEngine: 'swig',
    sessionSecret: 'MEAN',
    sessionCollection: 'sessions',
    assets: {
        lib: {
            css: [
                "public/bower_components/bootstrap/dist/css/bootstrap.css",
                "public/bower_components/datatables/media/css/jquery.dataTables.css",
                "public/bower_components/font-awesome/css/font-awesome.min.css",
                "public/bower_components/angular-material/angular-material.css",
                "public/bower_components/angular-toastr/dist/angular-toastr.css",
                "public/bower_components/angular-ui-select/dist/select.css",
                "public/bower_components/angular-ui-grid/ui-grid.min.css",
                "public/bower_components/animate.css/animate.css",
                "public/bower_components/bootstrap-daterangepicker/daterangepicker-bs3.css",
                "public/bower_components/morrisjs/morris.css",
                "public/bower_components/ng-tags-input/ng-tags-input.min.css",
                "public/bower_components/ng-tags-input/ng-tags-input.bootstrap.min.css",
                "public/modules/theme/styles/main.css", 
                'public/bower_components/handsontable/dist/handsontable.full.css',
                'public/bower_components/froala-wysiwyg-editor/css/froala_editor.min.css',
                'public/bower_components/froala-wysiwyg-editor/css/plugins/code_view.min.css',
                'public/bower_components/froala-wysiwyg-editor/css/plugins/table.min.css'             
                //"public/bower_components/jsoneditor/dist/jsoneditor.min.css"
            ],
            js: [
                'public/bower_components/api-check/dist/api-check.js',
                'public/bower_components/Chart.js/Chart.js',
                "public/bower_components/jquery/dist/jquery.js",
                "public/bower_components/angular/angular.js",
                "public/bower_components/angular-animate/angular-animate.js",
                //"public/bower_components/angular-i18n/angular-locale_es_cl.js",
                "public/scripts/vendor/angular-bootstrap/ui-bootstrap-tpls.js", // PAD: hice versión propia debido a open on arrowdown
                'public/bower_components/froala-wysiwyg-editor/js/froala_editor.min.js',
                'public/bower_components/froala-wysiwyg-editor/js/plugins/code_view.min.js',
                'public/bower_components/froala-wysiwyg-editor/js/plugins/table.min.js',
                'public/bower_components/froala-wysiwyg-editor/js/plugins/code_beautifier.min.js',
                "public/bower_components/bootstrap/dist/js/bootstrap.min.js",
                "public/bower_components/angular-cookies/angular-cookies.js",               
                //"public/bower_components/jsoneditor/dist/jsoneditor.min.js",
                //"public/bower_components/ng-jsoneditor/ng-jsoneditor.min.js",               
                'public/bower_components/datatables/media/js/jquery.dataTables.min.js',
                'public/bower_components/angular-datatables/dist/angular-datatables.min.js',
                'public/bower_components/angular-datatables/dist/plugins/bootstrap/angular-datatables.bootstrap.min.js',
                //'public/bower_components/angular-datatables/dist/plugins/buttons/angular-datatables.buttons.min.js',
                "public/bower_components/angular-datatables/dist/plugins/columnfilter/angular-datatables.columnfilter.min.js",
                //"public/bower_components/angular-datatables/dist/plugins/colreorder/angular-datatables.colreorder.min.js",
                //"public/bower_components/angular-datatables/dist/plugins/fixedheader/angular-datatables.fixedheader.min.js",
                "public/bower_components/angular-datatables/dist/plugins/scroller/angular-datatables.scroller.min.js",
                //"public/bower_components/angular-datatables/dist/plugins/tabletools/angular-datatables.tabletools.min.js",
                "public/bower_components/d3/d3.js",
                "public/bower_components/angular-fontawesome/dist/angular-fontawesome.js",
                "public/bower_components/angular-fullscreen/src/angular-fullscreen.js",
                "public/bower_components/angular-simple-logger/dist/angular-simple-logger.js",
                //"public/bower_components/lodash/lodash.js",
                //"public/bower_components/angular-loading-bar/build/loading-bar.js",
                "public/bower_components/eventEmitter/EventEmitter.js",
                //"public/bower_components/imagesloaded/imagesloaded.js",
                "public/bower_components/angular-aria/angular-aria.js",
                "public/bower_components/angular-material/angular-material.js",
                //"public/bower_components/angular-messages/angular-messages.js",
                "public/bower_components/moment/moment.js",
                "public/bower_components/angular-momentjs/angular-momentjs.js",
                "public/bower_components/angular-resource/angular-resource.js",
                "public/bower_components/angular-sanitize/angular-sanitize.js",
                "public/bower_components/angular-toastr/dist/angular-toastr.tpls.js",
                "public/bower_components/angular-touch/angular-touch.js",
                "public/bower_components/angular-translate/angular-translate.js",
                "public/bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js",
                "public/bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.js",
                "public/bower_components/angular-translate-storage-local/angular-translate-storage-local.js",
                "public/bower_components/jquery-ui/jquery-ui.js",
                "public/bower_components/angular-ui-router/release/angular-ui-router.js",
                "public/bower_components/angular-ui-select/dist/select.js",
                //"public/bower_components/angular-ui-tree/dist/angular-ui-tree.js",
                "public/bower_components/angular-ui-utils/ui-utils.js",
                //"public/bower_components/angular-ui-grid/ui-grid.js",
                "public/bower_components/bootstrap-daterangepicker/daterangepicker.js",
                "public/bower_components/ng-bs-daterangepicker/src/ng-bs-daterangepicker.js",
                //"public/bower_components/jquery.easy-pie-chart/dist/angular.easypiechart.min.js",
                "public/bower_components/raphael/raphael.js",
                "public/bower_components/morrisjs/morris.js",
                "public/bower_components/ng-tags-input/ng-tags-input.min.js",
                "public/bower_components/oclazyload/dist/ocLazyLoad.js",
                'public/bower_components/angular-chart.js/dist/angular-chart.js',            
                'public/bower_components/angular-breadcrumb/dist/angular-breadcrumb.min.js',            
                'public/bower_components/handsontable/dist/handsontable.full.js',
                'public/bower_components/ngHandsontable/dist/ngHandsontable.js',
                'public/bower_components/angular-smart-table/dist/smart-table.js',
                'public/bower_components/clipboard/dist/clipboard.min.js',
                'public/bower_components/ngclipboard/dist/ngclipboard.min.js'
            ]
        },
        css: [
            'public/modules/core/css/*.css'
        ],
        js: [
            'public/config.js',
            'public/application.js',
            'public/modules/*/*.js',
            'public/modules/**/*.js'
        ],
        tests: [

        ]
    }
};
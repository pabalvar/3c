'use strict';
/**
 * @name core.directive:daterangepicker
 * @description
 * # daterangepicker
 */

angular.module('core')
    .directive('daterangepicker', function () {
        return {
            restrict: 'A',
            scope: {
                options: '=daterangepicker',
                start: '=dateBegin',
                end: '=dateEnd'
            },
            link: function (scope, element) {

                element.daterangepicker(scope.options, function (start, end) {
                    scope.start = start.format("YYYY-MM-DD");
                    scope.end = end.format("YYYY-MM-DD");
                    scope.$apply();
                });
            }
        };
    })

    /**
     * @name core.controller:DaterangepickerCtrl
     * @description
     * # DaterangepickerCtrl
     * Datepicker custom
     */
    .controller('DaterangepickerjsCtrl', function ($scope, $rootScope, $moment/*, rrhhServiceContratosFilter*/) {
        // Inicializar local scope
        $scope.startDate = $moment.utc().startOf('month').format("YYYY-MM-DD");//rrhhServiceContratosFilter.fechaini;
        $scope.endDate = $moment.utc().endOf('month').format("YYYY-MM-DD");//rrhhServiceContratosFilter.fechafin;

        var getStep = function (fechaini, fechafin, add) {
            var info = {};
            dateRangeReadable(fechaini, fechafin, info);

            if (info.wholeYear) {
                if (add) {
                    $scope.startDate = $moment.utc(fechaini).add(1, 'year').startOf('year').format("YYYY-MM-DD");
                    $scope.endDate = $moment.utc(fechafin).add(1, 'year').endOf('year').format("YYYY-MM-DD");
                } else {
                    $scope.startDate = $moment.utc(fechaini).subtract(1, 'year').startOf('year').format("YYYY-MM-DD");
                    $scope.endDate = $moment.utc(fechafin).subtract(1, 'year').endOf('year').format("YYYY-MM-DD");
                }
            } else {
                if (add) {
                    $scope.startDate = $moment.utc(fechaini).add(1, 'month').startOf('month').format("YYYY-MM-DD");
                    $scope.endDate = $moment.utc(fechafin).add(1, 'month').endOf('month').format("YYYY-MM-DD");
                } else {
                    $scope.startDate = $moment.utc(fechaini).subtract(1, 'month').startOf('month').format("YYYY-MM-DD");
                    $scope.endDate = $moment.utc(fechafin).subtract(1, 'month').endOf('month').format("YYYY-MM-DD");
                }

            }
        }

        $scope.dateBack = function () {
            getStep($scope.startDate, $scope.endDate, false);
        }
        $scope.dateForward = function () {
            getStep($scope.startDate, $scope.endDate, true);
        }
        /** Genera el string mínimo para un rango de fechas **/
        var dateRangeReadable = function (initDate, endDate, info) {
            // Localizar $moment
            $moment.locale('es', {
                monthsShort: "ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic".split("_")
            });
            // instanciar fechas como $moments
            var i = $moment(initDate, "YYYY-MM-DD");
            var e = $moment(endDate, "YYYY-MM-DD");

            // Evaluar initDate
            var sameYear = (i.format("YYYY") == e.format("YYYY"));
            var sameMonth = (i.format("MM") == e.format("MM"));
            var wholeMonth = (i.format("DD") == '01' && ($moment(e).endOf('month').format("DD") == e.format("DD")));
            var wholeYear = (i.format("MM-DD") == '01-01' && ($moment(e).endOf('year').format("MM-DD") == e.format("MM-DD")));

            var MM = wholeYear ? '' : 'MMM ';
            var DD = wholeMonth ? '' : 'DD ';
            var formato = DD + MM + 'YYYY';

            var i_text = i.format(formato);
            var e_text = e.format(formato);

            // Si la fecha es infinito positivo o negativo
            if (e > $moment('2080-01-01')) e_text = '∞';
            if (i < $moment('1971-01-01')) i_text = '∞';

            var ret = (i_text == e_text) ? i_text : i_text + ' - ' + e_text;
            // agregar datos en info
            info = info || {};
            info.wholeYear = wholeYear;

            return ret;
        }

        // Watcher a localscope. Al cambiar, actualizar root, y actualizar startDateReadable
        $scope.$watch('startDate', function (newVal, oldVal) {
            //rrhhServiceContratosFilter.fechaini = newVal;
            $scope.readable = dateRangeReadable(newVal, $scope.endDate);
        });
        $scope.$watch('endDate', function (newVal, oldVal) {
            //rrhhServiceContratosFilter.fechafin = newVal;
            $scope.readable = dateRangeReadable($scope.startDate, newVal);
        });

        //Para mostrar o ocultar el DateRangePicker, es una variable global que se indica por ruta/estado
        $rootScope.$watch('showDateRangePicker', function (newValue, oldValue) {
            $scope.showDateRangePicker = newValue;
        });


        $scope.rangeOptions = {
            ranges: {
                'Este mes': [$moment.utc().startOf('month'), $moment.utc().endOf('month')],
                'Mes pasado': [$moment.utc().subtract(1, 'months').startOf('month'), $moment.utc().subtract(1, 'months').endOf('month')],
                'Últimos 12 meses': [$moment.utc().subtract(1, 'year').add(1, 'month').startOf('month'), $moment.utc().endOf('month')],
                'Últimos 4 meses': [$moment.utc().subtract(3, 'months').startOf('month'), $moment.utc().endOf('month')],
                'Este año': [{
                    'year': $moment().get('year'),
                    'month': 0,
                    'day': 1
                }, {
                    'year': $moment().get('year'),
                    'month': 11,
                    'day': 31
                }],
                'Año pasado': [{
                    'year': $moment().subtract(1, 'year').get('year'),
                    'month': 0,
                    'day': 1
                }, {
                    'year': $moment().subtract(1, 'year').get('year'),
                    'month': 11,
                    'day': 31
                }],
                'Este mes en adelante': [$moment.utc().startOf('month'), $moment('2099-01-01').utc().endOf('year')],
                'Toda la historia': [$moment('1970-01-01').utc().startOf('year'), $moment('2099-01-01').utc().endOf('year')]
            },
            locale: {
                "format": "YYYY-MM-DD",
                "separator": " - ",
                "applyLabel": "Aplicar",
                "cancelLabel": "Cancelar",
                "fromLabel": "Desde",
                "toLabel": "Hasta",
                "customRangeLabel": "Personalizado",
                "daysOfWeek": [
                    "Dom",
                    "Lun",
                    "Mar",
                    "Mie",
                    "Jue",
                    "Vie",
                    "Sab"
                ],
                "monthNames": [
                    "Enero",
                    "Febrero",
                    "Marzo",
                    "Abril",
                    "Mayo",
                    "Junio",
                    "Julio",
                    "Agosto",
                    "Septiembre",
                    "Octubre",
                    "Noviembre",
                    "Diciembre"
                ],
                "firstDay": 1
            },
            opens: 'left',
            startDate: $moment($scope.startDate).format("MM/DD/YYYY"),
            endDate: $moment($scope.endDate).format("MM/DD/YYYY"),
            parentEl: '#content',
        };
    });

/**
* Single Date Picker. No afecta scope global. Se inicializa con fechafin global, eso si.
*/
angular.module('randomStack').controller('DaterangepickerjsSingleCtrl', function ($scope, $rootScope, $moment) {
    // Inicializar local scope a Rootscope fechafin o en su defecto fin de mes actual
    $scope.viewDate = $rootScope.currentFechaview || $rootScope.currentFechafin || $moment.utc().endOf('month').format("YYYY-MM-DD");
    $scope.endDate = $scope.viewDate;
    $scope.startDate = $scope.viewDate;


    /** Genera el string mínimo para un rango de fechas **/
    var dateReadable = function (initDate) {
        // Localizar $moment
        $moment.locale('es', {
            monthsShort: "ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic".split("_")
        })
        // instanciar fechas como $moments
        var i = $moment(initDate, "YYYY-MM-DD");
        var formato = 'MMM ' + 'YYYY';
        var i_text = i.format(formato);
        var ret = i_text;
        return ret;

    }

    // Watcher a localscope. Este visor es local. Al cambiar, actualizar root, y actualizar startDateReadable
    $scope.$watch('startDate', function (newVal, oldVal) {
        //console.log("bringing to global currentFechaview (start)", oldVal, newVal)
        $rootScope.currentFechaview = newVal;
        $scope.readable = dateReadable(newVal, $scope.endDate);
    });
    $scope.$watch('endDate', function (newVal, oldVal) {
        //console.log("ignoring change on currentFechaview", oldVal, newVal)
        //$rootScope.currentFechafin = newVal; 
        //$scope.readable = dateReadable($scope.startDate, newVal);
    });


    $scope.rangeOptions = {
        singleDatePicker: true,
        showDropdowns: true,
        opens: 'left',
        startDate: $moment($scope.startDate).format("MM/DD/YYYY"),
        endDate: $moment($scope.endDate).format("MM/DD/YYYY"),
        parentEl: '#content',
    };
});
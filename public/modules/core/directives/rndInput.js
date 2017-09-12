'use strict';
angular.module("core")
  .directive("rndInput", function () {
    return {
      restrict: 'EA'
      , templateUrl: 'modules/core/directives/rndInput.html'
      , transclude: true
      , scope: {
        columns: '=',
        data: '=',
        line: '=',
        key: '=',
        rtablas: '=',
        indexBy: '@'
      }, controller: ['$timeout', '$scope', 'getDatatype', '$moment', 'decodeRtabla', 'rndDialog',
        /** Al hacer un cambio se ejecutan las siguientes funciones: 
         * hooks[] // variables internas
         * scope.column.onValueChange
          */
        function ($timeout, $scope, getDatatype, $moment, decodeRtabla, rndDialog) {
          console.log("rndInput: me crearon");

          // Scope variables
          $scope.line.$estado = $scope.line.$estado || {}; // init $estado (lineMeta)
          $scope.line.$estado[$scope.key] = $scope.line.$estado[$scope.key] || {}; // init cellMeta
          $scope.lineMeta = $scope.line.$estado; // alias line meta
          $scope.cellMeta = $scope.line.$estado[$scope.key]; // alias cellMeta
          $scope.column = $scope.columns.find(o => o.field == $scope.key);//  modelo de la columna
          $scope.type = getDatatype($scope.column);
          $scope.buffer = {};

          // variables
          var hooks = []; // Array de funciones 
          const DateInfinite = new Date('3001-01-01');
          const DateInfiniteThreshold = new Date('3000-01-01');
          var indexBy = $scope.indexBy; // alias
          var line = $scope.line; // alias
          var key = $scope.key; // alias
          var column = $scope.column; // alias
          var type = $scope.type; // alias
          var cellMeta = $scope.cellMeta
          var lineMeta = $scope.lineMeta
          var rtablas = $scope.rtablas;
          var buffer = $scope.buffer; // alias
          var Data = $scope.data;
          var $dialog = rndDialog;

          // Start-up
          init(type);

          // Crear watcher
          $scope.$watch('buffer.tmpInput', updateBuffer, true);

          // Implementation details

          /** Función que inicializa directiva según tipo */
          function init(type) {
            // Inicializar valor
            buffer.tmpInput = line[key];

            // inicialización adicional según tipo
            switch ((type || {}).datatype) {
              case 'rtabla': initRtabla(); break;
              case 'date': initDate(type); break;
            }

          }

          /** Función que llama al actualizar valores */
          function updateBuffer(newVal, oldVal) {

            if ((newVal == oldVal) || typeof (newVal) == 'undefined') return;
            //console.log("cambio", oldVal, '>', newVal);
            // Aplica pre Hooks internos
            if (hooks.length) {
              hooks.forEach(function (fn) {
                var refs = [null, key, oldVal, newVal];
                if (fn(refs)) line[key] = refs[3];
              });
            } else { // caso por defecto sin hooks
              line[key] = newVal;
            }

            // dejar que servicio $dialog maneje el resto del cambio
            // obtener row number buscando por index
            var row = Data.data.findIndex(d => d[indexBy] == line[indexBy]);
            $dialog.onChange(Data, row, column, oldVal);
            $dialog.setCellDirty(Data, row, column);
            $dialog.setLineModified(Data.data[row]);
            $dialog.validateCell(Data, row, column);
          }

          /** Función que hace cargo de cuando el input es de tipo rtabla. */
          function initRtabla() {
            buffer.tmpInput = decodeRtabla(line[key], rtablas[column.tabla], column.options).data
            // Anexar hook para cambiar la tabla
            hooks.push(updateInputRtabla);
          }


          /** Función que hace cargo de cuando el input es de tipo date. Controla el datepopup */
          function initDate(type) {
            // Inicializar valor
            buffer.tmpInput = new Date(line[key]);

            // inicializar controlador del date
            $scope.dateCtrl = {
              isOpen: false,
              toggleOpen: function () { $scope.dateCtrl.isOpen = !$scope.dateCtrl.isOpen },
              format: (type.variant == 'm') ? 'MMM yyyy' : 'dd-MM-yyyy',
              altInputFormats: ['yyyy-MM-dd', 'dd-MM-yyyy'],
              isDateInfinite: false
            }

            // Opciones para el datepopup
            $scope.dateOptions = {
              formatYear: 'yyyy',
              startingDay: 1,
              minMode: type.variant == 'm' ? 'month' : 'day',
              infiniteDate: DateInfinite
            };

            // Anexar hook para formatear date
            hooks.push(aplicarFecha);
          }

          function aplicarFecha(change) { // [0=ix,1=field,2=oldVal,3=newVal]
            // Si viene type.sub aplicar regla
            if (type.variant == 'm') {
              if (type.sub == 'i') {
                change[3] = new Date($moment(change[3]).utc().startOf('month'));
              } else if (type.sub == 'f') {
                change[3] = new Date($moment(change[3]).utc().endOf('month'));
              }
            }
            // Toggle si es fecha infinita
            $scope.dateCtrl.isDateInfinite = (change[3] > DateInfiniteThreshold);
            return true;
          }

          function updateInputRtabla(change) {
            //var changed = !(newVal == oldVal);
            if (typeof (change[3]) != 'undefined' && change[3] != null) {
              change[3] = change[3][column.options.returnSrv];
              return true;
            }
          }

        }]
    }
  })
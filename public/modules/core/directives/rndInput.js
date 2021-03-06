'use strict';
/**
* @ngdoc directive 
* @name core.directive:rndInput 
* @restrict 'E'
* @scope
* @param {Object} source Objeto que contiene los datos
* @param {Array} source.data Colección de objetos de datos
* @param {Object} line Objecto que contiene el dato
* @param {String} key Nombre del campo en <code>line</code> del dato a editar
* @param {rndMeta} meta Array de metadatos de datos de <code>source.data</source>
* @param {String} meta.field Nombre del campo 
* @param {String} meta.name Nombre visible campo 
* @param {String=} meta.description Descripción campo (para tooltip)
* @param {String=} meta.datatype Tipo de dato (number|currency|date|rtabla|typeahead)
* @param {function=} meta.onValueChange Función a llamar cuando se hace un cambio en el campo. Se llama con los parámetros <code>(source, i, meta, oldval)</code>
* @param {function|function[]=} meta.validations Función o array de funciones que se ejecutan depués de hechos 
los cambios. Si retorna ===true el dato es válido si no inválido. Si retorna un string se muestra el mensaje de error. 
* @param {rndRtabla=} rtablas Objeto rtabla para enmascarar datos
* @element ANY
* @description
* Directiva que permite mostrar una tabla. Requiere una promesa o un array, además de un objeto metadatos.
*
* <img style="margin-right:10px;" src="img/rndInput.date.png" alt="rndInput.date"> <img src="img/rndInput.rtabla.png" alt="rndInput.rtabla">
* @example
* <pre>   
<rnd-input 
  source="source"
  line="fila"
  key="m.field"
  meta="meta"
  rtablas="rtablas">
</rnd-input>
</pre>
**/
angular.module("core")
  .directive("rndInput", function () {
    return {
      restrict: 'EA'
      , templateUrl: 'modules/core/directives/rndInput.html'
      , transclude: true
      , scope: {
        columns: '=', // deprecado, usa meta
        meta: '=',
        data: '=', // deprecado usa source
        source: '=',
        line: '=',
        key: '=',
        rtablas: '=',
        dialog: '=?',
        indexBy: '@'
      }, controller: ['$timeout', '$scope', 'getDatatype', '$moment', 'decodeRtabla', 'rndDialog', 'focus',
        /** Al hacer un cambio se ejecutan las siguientes funciones: 
         * hooks[] // variables internas
         * scope.column.onValueChange
          */
        function ($timeout, $scope, getDatatype, $moment, decodeRtabla, rndDialog, focus) {
          // Revisar deprecado
          //console.log("rndInput: creación objeto");
          if ($scope.columns) console.warn("rndInput: columns va a ser deprecado. Use meta");
          var meta = $scope.columns || $scope.meta.data; // backwards compatibile columns ahora se llama meta

          if ($scope.data) console.warn("rndInput: data va a ser deprecado. Use source");
          var Data = $scope.data || $scope.source; //backwards compatibile columns ahora se llama source

          // Anula la acción por defecto de los key-arrows para permitir navegar en contexto de tabla
          $scope.keydown = keydown;


          // Init
          $scope.line.$estado = $scope.line.$estado || {}; // init $estado (lineMeta)

          $scope.id = rndDialog.newRandomString()();

          // Referenciar meta
          $scope.column = meta.find(o => o.field == $scope.key);//  modelo de la columna
          $scope.type = getDatatype($scope.column);
          $scope.buffer = {};

          // Salir si es $estado
          if ($scope.key == '$estado') return;

          // Alias
          $scope.line.$estado[$scope.key] = $scope.line.$estado[$scope.key] || {}; // init cellMeta
          $scope.lineMeta = $scope.line.$estado; // alias line meta
          $scope.cellMeta = $scope.line.$estado[$scope.key]; // alias cellMeta



          // variables
          var hooks = []; // Array de funciones a aplicar al haber cambios
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

          // Start-up
          init(type);

          // Crear watcher
          $scope.$watch('buffer.tmpInput', updateBuffer, true);


          // Anexar cellClick si lo tiene el meta
          if (column.onClick) {
            $scope.cellClick = function (line, column, source) {
              //console.log("hizo click en la celda", line);
              // llamar a la función de meta
              column.onClick(line, column, source);
            }
          }
          // Anexar cellBlur si lo tiene el meta
          if (column.onBlur) {
            $scope.cellBlur = function (line, column, source) {
              //console.log("hizo blur en la celda", line, column);
              // llamar a la función de meta
              column.onBlur(line, column, source);
            }
          }

          // Implementation details

          /** Función que inicializa directiva según tipo */
          function init(type) {
            // Inicializar valor
            buffer.tmpInput = line[key];

            // inicialización adicional según tipo
            switch ((type || {}).datatype) {
              case 'rtabla': initRtabla(); break;
              case 'date': initDate(type); break;
              case 'lookup': initLookup(); break;
            }
          }

          /** Función que llama al actualizar valores */
          function updateBuffer(newVal, oldVal) {

            // Descartar si no hay cambio (o se está inicializando watcher)
            if ((newVal == oldVal) || typeof (newVal) == 'undefined') return;

            // Asignar valor
            if (hooks.length) {
              hooks.forEach(function (fn) {
                var refs = [null, key, oldVal, newVal];
                if (fn(refs)) line[key] = refs[3];
              });
            } else { // caso por defecto sin hooks
              line[key] = newVal;
            }

            // encontrar línea de esta directiva en $scope.Data.data[]
            var rowIx = Data.data.findIndex(l => l === $scope.line);

            // Ejecutar hooks requeridos por el controlador (mediante dialog.onChange)
            if ($scope.dialog.onChange) $scope.dialog.onChange(newVal, oldVal, Data.data[rowIx], Data, rowIx, key, column);

            // Ejecutar hooks incluidos en metadata.onValueChange
            rndDialog.onChange(Data, rowIx, column, oldVal);
            // Marcar como modificada 
            rndDialog.setCellDirty(Data, rowIx, column);
            rndDialog.setLineModified(Data.data[rowIx]);
            // Ejecutar validación en la celda
            rndDialog.validateCell(Data, rowIx, column);
          }

          /** Anula la acción por defecto de los key-arrows para permitir navegar en contexto de tabla **/
          function keydown(evt) {
            console.log("keydown en rndInput")
            // arrows    // page
            if (/(37|38|39|40|33|34)/.test(evt.which)) {
              evt.preventDefault();

              // Debido a BUG en firefox se reescribe el valor en dropdown. https://stackoverflow.com/questions/22321604
              if ($scope.type.datatype == 'lookup'){
                var val = $scope.buffer.tmpInput;
                $timeout(()=>{ $scope.buffer.tmpInput = val});
              }
            
            }
          }


          /** Función que hace cargo de cuando el input es de tipo rtabla. */
          function initRtabla() {
            $scope._rtablas = (typeof (rtablas) == 'function') ? rtablas() : rtablas; // instanciar si es función
            buffer.tmpInput = decodeRtabla(line[key], $scope._rtablas[column.tabla], column.options).data
            // Anexar hook para cambiar la tabla
            hooks.push(updateInputRtabla);
          }

          /** Función que hace cargo de cuando el input es de tipo rtabla. */
          function initLookup() {
            // $scope._rtablas = (typeof (rtablas) == 'function') ? rtablas() : rtablas; // instanciar si es función
            buffer.tmpInput = decodeRtabla(line[key], $scope.meta[column.tabla], column.options).data
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
              openDeferred: dateOpenDeferred,
              closeDeferred: dateCloseDeferred,
              setToday: function () {
                buffer.tmpInput = new Date();
                //console.log("cambiando")
                $scope.dateCtrl.isDateInfinite = false;
              },
              toggleOpen: function () { $scope.dateCtrl.isOpen = !$scope.dateCtrl.isOpen },
              setOpen: function (open) {
                //console.log("estoy open=", open)
                $scope.dateCtrl.isOpen = open
              },
              format: (type.variant == 'm') ? 'MMM yyyy' : 'dd-MM-yyyy',
              altInputFormats: ['yyyy-MM-dd', 'dd-MM-yyyy'],
              isDateInfinite: false,
              timer: {}
            }

            // Crear watcher que deja el foco donde corresponde cuando cierra el calendario
            $scope.$watch('dateCtrl.isOpen', onCloseCalendario);

            function onCloseCalendario(newVal, oldVal) {
              if (oldVal === true) {
                if (newVal === false) {
                  //console.log("lo cerró.- calendario cambio de ", oldVal, " a ", newVal);
                  focus($scope.id, 0)
                }
              }
            }

            function dateCloseDeferred() {
              $timeout.cancel($scope.dateCtrl.timer);
              var fn = function () { $scope.dateCtrl.setOpen(false) }
              $scope.dateCtrl.timer = $timeout(fn, 100);
            }

            function dateOpenDeferred() {
              $timeout.cancel($scope.dateCtrl.timer);

              var fn = function () { $scope.dateCtrl.setOpen(true) }
              $scope.dateCtrl.timer = $timeout(fn, 400);
            }

            // Opciones para el datepopup
            $scope.dateOptions = {
              formatYear: 'yyyy',
              startingDay: 1,
              minMode: type.variant == 'm' ? 'month' : 'day',
              infiniteDate: DateInfinite,
              timer: $scope.dateCtrl
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
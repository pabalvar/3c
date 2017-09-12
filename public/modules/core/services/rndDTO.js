'use strict';

angular.module('core')

  .factory('rndDTO', function (DTOptionsBuilder, DTColumnBuilder, $compile) {

    var options = {};

    options.language = {
      es: {
        "sProcessing": "Procesando...",
        "sLengthMenu": "Mostrar _MENU_ registros",
        "sZeroRecords": "No se encontraron resultados",
        "sEmptyTable": "(tabla vacía)",
        "sInfo": "Mostrando registros _START_ al _END_ de _TOTAL_",
        "sInfoEmpty": "No hay registros que mostrar",
        "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
        "sInfoPostFix": "",
        "sSearch": "Buscar:",
        "sUrl": "",
        "sInfoThousands": ",",
        "sLoadingRecords": "Cargando...",
        "oPaginate": {
          "sFirst": "Primero",
          "sLast": "Último",
          "sNext": "Siguiente",
          "sPrevious": "Anterior"
        },
        "oAria": {
          "sSortAscending": ": Orden ascendente",
          "sSortDescending": ": Orden descendente"
        }
      }
    }

    options.initTable = function () {
      return {
        dtOptions: {},
        dtInstance: {},
        dtColumnDefs: [],
        loadColumns: false,
        textError: [],
        colaPeticiones: [],
        state: {
          isBusy: false,
          isOK: false
        },
        getLastPeticion: function () {
          return this.colaPeticiones[this.colaPeticiones.length - 1]
        },
        clearCola: function () {
          this.colaPeticiones = [];
        },
        isLoading: function () {
          this.state.isBusy = true;
          this.textError = [];
        },
        isFinished: function (error) {
          this.state.isBusy = false;
          if (error) {
            this.state.isOK = false;

            if (Object.prototype.toString.call(error) === '[object Array]') {
              this.textError = error;
            }
            else {
              this.textError = [error];
            }
          } else {
            this.state.isOK = true;
          }
        }
      };
    };
    options.translate = function (table) {
      return table
        .withDisplayLength(10)
        .withBootstrap()
        .withOption('responsive', true)
    };

    options.reorder = function (options, columnHeader, orderHeader) {
      var cambioOrdenDiccionario = [],
        temp = {};

      //Recorro la lista de columnas 'columnHeader', para registrar el indice de cada una 
      //y como vienen ordenadas. El plugin por defecto utiliza esto para ordenar las columnas.
      columnHeader.forEach(function (columna, index) {
        temp[columna.atribute] = index;
      });

      //Genero la lista a partir de 'orderHeader', que es una lista de las columnas
      //ordenadas pero utilizando el nombre del atributo. El plugin requiere el indice con respecto
      // a como fue definido originalmente las columnas en 'columnHeader'
      orderHeader.forEach(function (columna) {
        cambioOrdenDiccionario.push(temp[columna]);
      });

      //Cargo la lista ordenada a las opciones de la tabla.
      options.withColReorder();
      options.withColReorderOrder(cambioOrdenDiccionario);

      //Si se quiere que no sea posible mover ciertas columns
      //options.withColReorderOption('iFixedColumnsRight', 1) 
      return options;
    };

    options.handleHiddenColumns = function (options) {

      return options//.withColVis()
        //.withColVisOption('buttonText', 'Columnas'+'<i class="fa fa-angle-down"></i>');
        .withButtons([
          // 'columnsToggle',
          { extend: 'colvis', text: 'Columnas' + '<i class="fa fa-angle-down"></i>' }
          /*'copy',
          'print',
          'excel',
          {
              text: 'Some button',
              key: '1',
              action: function (e, dt, node, config) {
                  alert('Button activated');
              }
          }*/
        ]);
      // Si es que se quiere agregar una funcion para captar el evento de ocultar columna.
      /*.withColVisStateChange( function (iColumn, bVisible) {
          console.log('The column', iColumn, ' has changed its status to', bVisible);
      })
     // Si es que se quiere excluir columnas, se pueden especificar explicitamente.
        .withColVisOption('aiExclude', [1])*/
    };


    options.setearDtOptions = function (options_input) {

      var options = {};
      options = DTOptionsBuilder.newOptions();

      if (options_input) {
        /*Administro columnas ocultas*/
        if (options_input.showHiddenColumns)
          options = this.handleHiddenColumns(options);

        /*Administro el orden de las columnas*/
        if (options_input.orderHeader && options_input.orderHeader.length === options_input.columnHeader.length)
          options = this.reorder(options, options_input.columnHeader, options_input.orderHeader);
      }
      /*Traduzco la tabla a español y agrego custom loading*/
      options = this.translate(options);
      return options;
    };

    options.setUpPagination = function (type_pagination) {
      var type_pag = (type_pagination == 'full_numbers' || type_pagination == 'simple_numbers') ?
        type_pagination : 'full_numbers';

      var new_options = DTOptionsBuilder.newOptions()
        .withPaginationType(type_pag)

      return this.translate(new_options);
    };


    //--deprecated
    options.setearDtColumns = function (columnHeader_options) {
      var columnHeader = [];

      columnHeader_options.forEach(function (column) {
        if (column.visible == true)
          columnHeader.push(DTColumnBuilder.newColumn(column.atribute)
            .withTitle(column.title));
        if (column.visible == false)
          columnHeader.push(DTColumnBuilder.newColumn(column.atribute)
            .withTitle(column.title)
            .notVisible()
          );
      });
      return columnHeader;
    };

    //Genera columnas a partir de data
    options.setUpDTColumnsWithData = function (data) {
      var outColumns = [];
      if (data.length > 0) {
        angular.forEach(data[0], function (value, key) {
          outColumns.push(DTColumnBuilder.newColumn(key).withTitle(key));
        });
      }
      return outColumns;

    };

    options.setUpDtColumns = function (scope, dtcolumns, boolean_toggle) {
      var outColumns = [];
      var titleHtml = '<input type="checkbox" ng-model="selectAll" ng-click="toggleAll(selectAll, selected)">';

      if (boolean_toggle) {
        scope.selected = {};
        scope.selectAll = false;
        scope.toggleAll = toggleAll;
        scope.toggleOne = toggleOne;

        function toggleAll(selectAll, selectedItems) {
          console.log('toggleAll');
          for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
              selectedItems[id] = selectAll;
            }
          }
        }

        function toggleOne(selectedItems) {
          console.log('toggleOne', selectedItems);
          for (var id in selectedItems) {
            if (selectedItems.hasOwnProperty(id)) {
              if (!selectedItems[id]) {
                scope.selectAll = false;
                return;
              }
            }
          }
          scope.selectAll = true;
        }
        outColumns.push(
          DTColumnBuilder.newColumn(null).withTitle(titleHtml).notSortable()
            .renderWith(function (data, type, full, meta) {
              scope.selected[full.id] = false;
              return '<input type="checkbox" ng-model="selected[' + data.id + ']" ng-click="toggleOne(selected)">';
            }))
      }

      dtcolumns.forEach(function (elem) {
        outColumns.push(DTColumnBuilder.newColumn(elem.newColumn).withTitle(elem.title));

      })
      return outColumns;

    };
    options.setUpServerSide = function (scope, webService, rowClickHandler,
      boolean_filter, type_pagination, buttons) {

      type_pagination = type_pagination ? type_pagination : 'simple_numbers';

      var myOptions = DTOptionsBuilder.newOptions()

        .withOption('ajax', function (data, callback, settings) {
          webService(data, callback);
        })
        .withDataProp('data')
        .withOption('serverSide', true)
        .withOption('processing', true)
        .withOption('rowCallback', function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
          // Unbind first in order to avoid any duplicate handler (see https://github.com/l-lin/angular-datatables/issues/87)
          $('td', nRow).unbind('click');
          $('td', nRow).bind('click', function () {
            scope.$apply(function () {
              rowClickHandler(aData);
            });
          });
          return nRow;
        })
        .withOption('bFilter', boolean_filter)// Se elimina barra de busqueda nativa
        .withPaginationType(type_pagination)
        .withDisplayLength(10)
        .withBootstrap()
        .withOption('responsive', true)
        .withOption('headerCallback', function (header) {
          if (!scope.headerCompiled) {
            // Use this headerCompiled field to only compile header once
            scope.headerCompiled = true;
            $compile(angular.element(header).contents())(scope);
          }
        })
        .withOption('createdRow', function (row) {
          // Recompiling so we can bind Angular directive to the DT
          $compile(angular.element(row).contents())(scope);
        })

      if (buttons) {
        if (buttons.length > 0) {
          myOptions.withDOM('frtip')
            .withButtons(buttons);
        }

      }

      return myOptions;

    }

    return options;
  })

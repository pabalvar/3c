'use strict';
angular.module('RRHH')
    .controller('RrhhControllerContratos', ['rndDropArea', 'rndPage', 'Personas', 'preProcess', 'rndExcel', '$timeout', 'contratosModel', 'hotRegisterer', 'rrhhFactoryContratosFilter', 'rndDialog', 'rndColumn', 'rrhhServiceContratosFilter', 'State', 'WS', 'rndAlerts', '$scope', '$state', '$stateParams', 'Contratos',
        function (rndDropArea, rndPage, Personas, preProcess, rndExcel, $timeout, contratosModel, hotRegisterer, rrhhFactoryContratosFilter, rndDialog, rndColumn, rrhhServiceContratosFilter, State, WS, rndAlerts, $scope, $state, $stateParams, Contratos) {
            // Variables y funciones disponibles en la vista
            $scope.rrhhServiceContratosFilter = rrhhServiceContratosFilter; // bind to $scope.rrhhServiceContratosFilter
            $scope.observer = new State('contratosObserver'); // bind to $scope.personasObserver
            $scope.page = new rndPage({ onChange: refresh, maxSizeForm: 10 });// inicializar en página 1            
            $scope.dropArea = new rndDropArea({ onChange: manageDrop, modo: 'replace' });
            $scope.alert = new rndAlerts();
            $scope.hotTable = {}; // Objeto Handson Table {columns, settings}
            $scope.reload = reload;
            $scope.refresh = refresh; // Introduce un cambio en el vector de estado (llama reload eventualmente si el estado está completo)
            $scope.saveChanges = saveChanges;
            $scope.createLine = createLine;
            $scope.persona_id = $stateParams.persona_id;// Bind state from URL
            $scope.lineAction = lineAction; // Form: controla estado de línea en modo 'form'
            $scope.Model = contratosModel.model;
            $scope.ModelPersonales = $scope.Model.filter(o => o.group == 1);
            $scope.ModelContrato = $scope.Model.filter(o => o.group == 2 && o.visible);
            $scope.updateState = updateState; // función watcher que calcula si existen registros modificados en toda la vista
            $scope.getTouched = getTouched; // descarta registros que no están modificados
            $scope.onChangeLocalFilter = localFilter;

            // Inicializar estado
            $scope.modo = {};
            var modo = $scope.modo;
            modo.masivo = (['app.rrhh.contratos.modificar'].indexOf($state.current.name) >= 0 || $stateParams.ff); // modos que operan con más de una persona
            modo.grid = modo.masivo ? 'table' : 'form';
            modo.canCreate = (['app.rrhh.contratos.modificar', 'app.rrhh.contratos.crear'].indexOf($state.current.name) >= 0); // modo que puede crear persona
            modo.canDelete = (['app.rrhh.contratos.modificar'].indexOf($state.current.name) >= 0); // modos que pueden eliminar personas
            modo.action = (['app.rrhh.contratos.crear'].indexOf($state.current.name) >= 0) ? 'crear' : 'modificar';
            modo.source = (['app.rrhh.contratos.modificar'].indexOf($state.current.name) >= 0) ? 'contratos' : 'personas';

            // Local variables/services
            var model = $scope.Model;
            var alert = $scope.alert;
            var ws = new WS($scope); // agrega servicios busy,error,$ready a ajax. Bind to $scope
            var observer = $scope.observer;
            var page = $scope.page; // alias
            var dropArea = $scope.dropArea;
            var dropInput = '';
            var dropQueued = false;

            // init
            $scope.Model.find(o => o.field == 'RUT').onValueChange = onChangePersona; // agregar función onChangePersona para cuando cambia RUT en modo Table
            $scope.Model.find(o => o.field == 'RUT').validations.push(hasUidxperson); // agregar función onChangePersona para cuando cambia RUT en modo Table

            // watchers
            $scope.$watch('observer.ticker', reload); //Usado para forzar reload
            $scope.$watch('currentCompany', refresh); //Observar cambio de compañia   
            $scope.$watch('rrhhServiceContratosFilter.Tags', refresh, true); //Observar cambio de filtros de funcionarios       
            $scope.$watch('ContratosWS.$readylatch', callLinkData); // Observar recepción datos de Contratos desde el servidor 

            /** actualiza las variables *unsavedChanges */
            function updateState() {
                $scope.sumState = rndDialog.getSumState($scope.Contratos, model);
                return '';
            }

            // detalles de implementación
            function localFilter(input) {
                var hot = hotRegisterer.getInstance('hot');
                rndDialog.setFilterString($scope.Contratos, ['RUT', 'APPP', 'APPM', 'KOCON', 'NOMBRE'], input, hot);
            }

            /** función que llama a la función que expone los datos a la vista después del WS */
            function callLinkData() {
                linkData($scope.ContratosWS);
            }

            /** Función que debería pertenecer al modelo. Crea una nueva instancia del modelo. Input hace merge */
            function createLine(input) {
                rndDialog.createLine($scope.Contratos, model, input);
            }


            /** eliminar los que no están seleccionados. Muta ($scope.Contratos.data!) */
            function getTouched() {
                $scope.Contratos.data = rndDialog.getTouched($scope.Contratos.data);
            }


            function saveChanges(cont) {
                alert.close();
                var hot = hotRegisterer.getInstance('hot'); // grasp handsontable instance

                // Obtener modificados
                var data = $scope.Contratos.data; // alias
                var updated = rndDialog.getModified(data, model);
                var nuevos = rndDialog.getCreated(data, model);
                var deleted = rndDialog.getDeleted(data, model).map(o => o.UIDXCONTRAT);

                if (updated.length && nuevos.length) ws(Contratos.upsert, nuevos.concat(updated), 'CONsaveWS', [alert.parse, observer.refresh], [alert.parse, rndDialog.setErrorMessage($scope.Contratos, 'UIDXPERSON', hot)])
                else if (updated.length) ws(Contratos.update, updated, 'CONsaveWS', [alert.parse, observer.refresh], [alert.parse, rndDialog.setErrorMessage($scope.Contratos, 'UIDXPERSON', hot)])
                else if (deleted.length) ws(Contratos.delete, { contratos: deleted }, 'CONsaveWS', [alert.parse, observer.refresh], [alert.parse, rndDialog.setErrorMessage($scope.Contratos, 'UIDXPERSON', hot)])
                else if (nuevos.length) ws(Contratos.create, nuevos, 'CONsaveWS', [alert.parse, observer.refresh], [alert.parse, rndDialog.setErrorMessage($scope.Contratos, 'UIDXPERSON', hot)]);
            }


            /** Expone datos de Contratos en la vista */
            function linkData(res) {

                // Ignorar si la promesa no está resuelta
                if (!(res || {}).$readylatch) return false;
                //console.log("link data: ", res.data);

                // decouple y asegurar array en variable local Data
                var Data = angular.copy(Array.isArray(res.data) ? res.data : []);

                // Si vienen muchos datos forzar modo table
                if (Data.length > page.maxSizeForm) modo.grid = 'table';

                // Inicializar tabla hot
                $scope.Contratos = { data: Data, recordsTotal: res.recordsTotal, rtablas: res.rtablas }
                $scope.hotTable.Columns = rndColumn.getColumns($scope.Model, res.rtablas, $scope.Contratos);
                $scope.hotTable.Settings = rndColumn.getSettings($scope.Contratos, 'hot', $scope.hotTable.Columns, $scope);

                // Si hay data en dropArea, hacer merge con los datos
                if (dropQueued) {
                    dropArea.mergeDropData($scope.Contratos, dropInput, model, ['RUT', 'KOCON'])
                    dropQueued = false;

                    // pedir datos de las personas a WS
                    getPersonas({ rut: Data.map(o => o.RUT) });
                } else if (modo.action == "crear") {
                    var params;
                    if (modo.masivo) {
                        params = { searchParams: rrhhServiceContratosFilter.decode() }
                    } else {
                        params = { personas: $stateParams.personas || '5FBBF3A5-7487-4736-9904-33A76C41BEBD' }; // hash es dummy
                    }
                    getPersonas(params);
                }

                // Conectar a $scope.persona si es single
                if (!$scope.masivo) $scope.persona = angular.copy(res);

            }

            /** Función que obtiene modelo de datos en $scope.ContratosWS */
            function getContratos(params) {
                // paginar 
                params.order = 'APPP'; // trae resultados ordenados por APPP (apellido paterno)
                params.size = page.getSize();
                params.start = page.getStart();
                params.type = 'datatable';
                params.embed = ['dialog', 'tipocon'];
                params.empresa = $scope.currentCompany;

                console.log("WS Contratos.get")
                ws(Contratos.get, params, 'ContratosWS', null, alert.parse);
            }



            function getPersonas(params) {
                params.order = 'APPP'; // trae resultados ordenados por APPP (apellido paterno)
                params.size = page.getSize();
                params.start = page.getStart();
                params.type = 'datatable';
                params.embed = ['dialog', 'tipocon'];
                params.empresa = $scope.currentCompany;
                console.log("llamando WS Personas. params:", params);
                ws(Personas.get, params, 'PersonasWS', [mergePersonasData, alert.parse])
            }

            /** filtra que el estado haya cambiado antes de llamar al servicio ws */
            function reload(n, o) {
                var params;

                // Si es modo masivo usa state de rrhhServiceContratosFilter
                if (modo.action == "modificar") {
                    params = { searchParams: rrhhServiceContratosFilter.decode() }
                } else {
                    params = { "personas": $stateParams.persona_id || $stateParams.personas || '5FBBF3A5-7487-4736-9904-33A76C41BEBD' };
                }
                var stateVector = [$scope.modo.grid, $scope.currentCompany, params];
                if (observer.changed(stateVector)) {
                    getContratos(params);
                }
            }

            /** Función modifica ticker */
            function refresh(n, o) {
                alert.close();
                observer.refresh();
            };

            /** Acciones de línea */
            function lineAction(action, line) {
                if (action == 'editar') rndDialog.toggleLineOpen(line); // Aplicar modo edición
                else if (action == 'eliminar') rndDialog.toggleLineDelete(line); // Aplicar modo edición
            }

            /** Función a llamar cuando hay drop area */
            function manageDrop(input, modo) {
                alert.close(); // cerrar alerts si hay               
                dropInput = input; // hacer persistente
                if (!(input || {}).columns) return 0;// Descartar si no vienen datos

                // homologar nombres de columnas personasEnDrop= {field:'RUT|UIDXPERSON', data:[arr of string]}
                var personasEnDrop = dropArea.getList(input, 'RUT', model);
                if (!personasEnDrop) return 0; // Descartar si no vienen RUTs     

                // Si se está en modo reemplazo llamar a WS Contratos con la lista de RUT como filtro
                if (modo.id == 'replace') {
                    // actualizar el filtro de funcionarios para los rut  filtro personas
                    $scope.rrhhServiceContratosFilter.setTags([{ type: 'free_text', param: 'rut', data: personasEnDrop }]);
                    dropQueued = true;
                } else if (modo.id == 'edit') {
                    // Hacer merge con los datos recibidos (MUTA Contratos.data!)
                    dropArea.mergeDropData($scope.Contratos, dropInput, model, ['RUT', 'KOCON'])
                }
            }

            /** Callback de getPersonas. Hace Merge con datos recibidos de ajax */
            function mergePersonasData(res) {
                // obtener instancia handsontable
                var hot = hotRegisterer.getInstance('hot');

                // obtener línea
                res.data.map(function (obj) {
                    var i = $scope.Contratos.data.findIndex(l => l.RUT == obj.RUT);
                    // Si se está en modo crear, crear la línea si no se encontró el RUT
                    if (modo.action == "crear") {
                        if (i < 0) {
                            createLine();
                            i = 0;
                        }
                    }
                    var linea = $scope.Contratos.data[i];
                    if (linea) {
                        // Copiar datos obtenidos en la línea
                        linea.UIDXPERSON = obj.UIDXPERSON;
                        linea.RUT = obj.RUT;
                        linea.NOMBRE = obj.NOMBRE;
                        linea.APPP = obj.APPP;
                        linea.APPM = obj.APPM;

                        // Validar línea ahora que se cargaron los datos
                        console.log("validación post mergePersonas");
                        rndDialog.validateLine($scope.Contratos, model, i, hot);//[0=ix,1=field,2=oldVal,3=newVal]     
                    }
                })
                // redraw
                console.log("redrawing from controller post MergePersonas")
                if (hot) hot.render();
            }


            /** Retorna true si la fila tiene UIDXPERSON */
            function hasUidxperson(Data, i, meta) {
                return Data.data[i].UIDXPERSON ? true : false;
            }



            /** Actualizar Nombre y apellido al elegir RUT  */
            function onChangePersona(Data, i, meta, oldval) {
                console.log("meta.onValueChange");
                alert.close(); // cerrar alerts si hay
                var rut = Data.data[i].RUT;
                // actualizar el filtro de funcionarios para los rut  filtro personas
                var ff = new rrhhFactoryContratosFilter();
                ff.setTags([{ type: 'free_text', param: 'rut', data: rut }]);
                var params = { searchParams: ff.decode() };
                getPersonas({ rut: rut });
            }


        }
    ]);
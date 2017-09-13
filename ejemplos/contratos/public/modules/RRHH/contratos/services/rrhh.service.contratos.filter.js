angular.module('RRHH')
    /** Instancia global de filtro de funcionarios **/
    .service('rrhhServiceContratosFilter', ['rrhhFactoryContratosFilter',
        function (rrhhFactoryContratosFilter) {
            // inicializar rrhhServiceContratosFilter
            var tagArray = [];
            var ff = new rrhhFactoryContratosFilter(tagArray);
            return ff;
        }])
    /** Factory con funciones para manejar filtro funcionarios **/
    .factory('rrhhFactoryContratosFilter', ['$moment', 'rndCompany', '$filter',
        function ($moment, rndCompany, $filter) {

            return function (TagArray) {
                /** Símbolos a exportar **/
                var M = {
                    fechaini: $moment.utc().startOf('month').format("YYYY-MM-DD"), // se inicia al mes en curso por defecto
                    fechafin: $moment.utc().endOf('month').format("YYYY-MM-DD"),
                    Tags: TagArray,
                    decode: 'decode' // ver función abajo
                };

                /** Funciones auxiliares **/
                var getFreetext = function (tags) {
                    /** input: tags.group[].name  **/
                    var ret = {
                        type: tags.type,
                        param: tags.param,
                        data: tags.data
                    };
                    return ret
                }

                var getAssign = function (tags) {
                    /** input: tags.group[].param **/
                    var ret = {
                        type: tags.type,
                        param: tags.param,
                        data: tags.data.map(o => o.value)
                    };
                    return ret
                }

                var getClase = function (tags) {
                    var ret = {
                        type: tags.type,
                        param: tags.param,
                        data: tags.data
                    };
                    return ret
                }

                /** Funciones y estructuras de datos **/

                /* Crea objeto grupo de fultro */
                var Tag = function (type, param) {
                    var ret = {};
                    ret.type = type
                    ret.param = param;
                    ret.id = Math.floor((Math.random() * 1000000) + 1);
                    ret.data = [];
                    return ret;
                };

                var manageType = {
                    'free_text': function (item, insert, store, removeGroup) {
                        // Si viene flag removeGroup: retornar vacío
                        if (removeGroup) return null;

                        // Si no viene item data, salid
                        if (typeof (item.data) == 'undefined') return null;

                        // If no store, init new instance for the group
                        store = store || Tag(item.type, item.param);

                        // split text in semicolons, commas and space.
                        var stringArr
                        if (typeof (item.data) == 'string')
                            stringArr = item.data.split(/[\s,;|]+/).filter(o => o.length);
                        else // es array, se deja tal cual
                            stringArr = item.data

                        // Revisar si existe item, agregar si es necesario
                        stringArr.forEach(function (s) {
                            var ix = store.data.indexOf(s); // check if new item exists
                            if (ix < 0 && insert) store.data.push(s); // Si no existe y nuevo item es valido -> (insert)
                            else if (ix >= 0 && !insert) store.data.splice(ix, 1); // Si existe y nuevo item es inválido -> delete          
                        })

                        // Recalcular nombre del grupo (pipe de los strings cortado a 10 caracteres)
                        store.name = store.data.join('|');

                        // Obtener ícono del grupo
                        var icons = { 'kocon': 'fa fa-calendar-o', 'any': 'fa fa-address-card-o', 'uuid': 'fa fa-barcode', 'rut': 'fa fa-user' }
                        store.icon = icons[store.param] || 'fa fa-question';

                        // Reducir nombre a "..." si es más largo que 40 caracteres (y mostrar cuántos términos se incluyen en búsqueda)
                        if (store.name.length > 40) store.name = store.name.substring(0, 19) + ' . . . ' + name.substring(name.length - 19) + ' (' + store.data.length + ')';

                        // si group es de largo 0 retornar vacío
                        if (!store.data.length) store = null;

                        return store;
                    },
                    'assign': function (item, insert, store, removeGroup) {
                        // If no store, init new instance for the group
                        store = store || Tag(item.type, item.param);

                        // Si viene flag removeGroup: desticar todos los items del grupo y salir
                        if (removeGroup) {
                            store.data.length = 0;
                        } else {
                            // Revisar si existe item, agregar si es necesario
                            var ix = store.data.map(o => o.value).indexOf(item.value);

                            if (ix < 0 && insert) store.data.push(item); // Si no existe y acción es insert -> (insert)
                            else if (ix >= 0 && !insert) store.data.splice(ix, 1); // Si existe y acción es delete -> delete 

                            // Recalcular el nombre como la concatenación de los nombres individuales
                            store.name = store.data.map(o => o.name).join('|');

                            // calcular ícono 
                            store.icon = (store.data[0] || {}).icon || 'fa fa-filter';
                        }
                        // si group es de largo 0 retornar vacío
                        if (!store.data.length) store = null;

                        return store;
                    },
                    'clase': function (item, insert, store, removeGroup) {
                        // Si viene flag removeGroup: retornar vacío
                        if (removeGroup) return null;

                        // If no store, init new instance for the group
                        store = store || Tag(item.type, item.param);

                        // Attach data
                        store.data.push(item.data);

                        // Calcular el nombre
                        store.name = item.name;

                        // ícono
                        store.icon = item.icon;

                        return store;
                    }
                }

                M.decode = function () {
                    var ret = {};
                    ret.cfiltros = [];
                    this.Tags.forEach(function (t) {
                        if (!t) return;
                        if (t.type == 'free_text') ret.cfiltros.push(getFreetext(t));
                        else if (t.type == 'assign') ret.cfiltros = ret.cfiltros.concat(getAssign(t));
                        else if (t.type == 'clase') ret.cfiltros.push(getClase(t));
                    });
                    ret.dates = { fechaini: M.fechaini, fechafin: M.fechafin };
                    //ret.company = 
                    ret.empresa = rndCompany.get();
                    return ret;
                }

                M.setTags = function (tags) {
                    this.Tags = [];
                    var self = this;
                    var ret;
                    tags.forEach(function (o) { ret = self.manageTags(o, true) });
                    return ret;
                }
                M.getTags = function () {
                    var ret = angular.copy(this.Tags);
                    return ret;
                }
                M.manageTags = function (Item, insert, removeGroup) {
                    // Decouple
                    var item = angular.copy(Item);
                    var store = angular.copy(this.Tags);

                    // Buscar el grupo entre los tags existentes, si existe insertar o eliminar segun caso (insert)
                    var found;
                    for (var i = 0; i < store.length; i++) {
                        var tag_i = store[i];
                        if (tag_i.param == item.param) {
                            found = true;
                            // Si el grupo existe, actualizar grupo
                            store[i] = manageType[item.type](item, insert, tag_i, removeGroup);
                            // Si el grupo es vacío, borrar
                            if (!store[i]) store.splice(i, 1);
                            break;
                        }
                    }
                    // Si no existe, insertar
                    if (!found && insert) {
                        var tmp = manageType[item.type](item, insert);
                        if (tmp) store.push(tmp);
                    }
                    // decople
                    this.Tags = angular.copy(store);
                    var ret = angular.copy(store);
                    return ret;
                }


                M.factoryFilters = [
                    {
                        id: 'activo',
                        name: 'sólo vigentes',
                        param: 'active',
                        value: 'activo',
                        icon: 'fa fa-handshake-o',
                        type: 'assign'
                    },
                    {
                        id: 'inactivo',
                        name: 'sólo no vigentes',
                        param: 'active',
                        value: 'inactivo',
                        icon: 'fa fa-hand-paper-o',
                        type: 'assign'
                    }, {
                        id: 2,
                        name: 'salientes',
                        param: 'finiquito',
                        value: 'finiquito',
                        icon: 'fa fa-sign-out',
                        type: 'assign'
                    }, {
                        id: 3,
                        name: 'Liquidación emitida',
                        param: 'liqemit',
                        value: 'emitida',
                        icon: 'fa fa-legal',
                        type: 'assign'
                    }, {
                        id: 4,
                        name: 'Liquidación con errores',
                        param: 'liqerr',
                        value: 'erronea',
                        icon: 'fa fa-bug',
                        type: 'assign'
                    }, {
                        id: 5,
                        name: 'Contrato incompleto',
                        param: 'incompleto',
                        value: 'incompleto',
                        icon: 'fa fa-star-half-empty',
                        type: 'assign'
                    }];
                M.getFactoryFilter = function (id) {
                    return this.factoryFilters.filter(o => o.id == id)[0];
                }

                return M;
            }
        }
    ]);
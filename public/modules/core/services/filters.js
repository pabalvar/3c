const _SEPARATOR_ = '➙'; // ojo, se usa en rndInput.html tb. 
function isTypeNumeric(input) {
	return ((input || '').match(/currency|date|number/)) ? true : false;
}


angular.module('core')
	.factory('focus', function ($timeout, $window) {
		return function (param, timer) {
			$timeout(function () {
				// truco: id puede ser un objeto
				var className = (typeof(param)=='string')?param:param.id;
				var element = angular.element(document.getElementsByClassName(className));
				if (element) {
					console.log("haciendo foco en id=", className);
					element.focus();
				}
				else {
					console.warn("no se pudo hacer foco en id=", className);
				}
			}, timer);
		};
	})

	/** inserta html desde controlador */
	.filter("trustedUrl", ['$sce', function ($sce) {
		return function (url) {
			return $sce.trustAsResourceUrl(url);
		}
	}])
	/** inserta html desde controlador */
	.filter("trust", ['$sce', function ($sce) {
		return function (htmlCode) {
			return $sce.trustAsHtml(htmlCode);
		}
	}])
	/** Destaca texto ingresado (usado en facts) */
	.filter('buzzlight', function ($sce) {
		return function (text, buzzwords) {
			(buzzwords || []).forEach(function (w) {
				var regex = new RegExp('(' + w + ')', "g");
				text = text.replace(regex, '<span class="bg-info lter">$1</span>');
			});
			return $sce.trustAsHtml(text)
		}
	})

	/** Entrega alignment right o left de acuerdo al tipo de dato */
	.filter('alignment', function ($filter) {
		return function (input) {
			var ret = 'left';
			switch (typeof (input)) {
				case 'string':
					if (isTypeNumeric(input)) ret = 'right';
					else if (input == 'boolean') ret = 'center';
					break;
				case 'object':
					if (isTypeNumeric(input.datatype)) ret = 'right';
					else if (input.datatype == 'boolean') ret = 'center';
					break;
				default:
					break;
			}
			return ret;
		}
	})
	/** retorna un string como número. ToDo: I18N!, está fijo en español */
	.service('parseNumber', function () {
		return function (input) {
			var value, valid;
			if (typeof (input) == 'number') {
				value = input;
			} else {
				value = parseFloat(String(input).replace(',', '.'));
			}
			var valid = (value >= 0 || value < 0);
			return { value: value, valid: valid }
		}
	})
	.service('getDatatype', function () {
		return function (param) {
			var datatype, variant, sub;
			if (typeof (param) == 'string') {
				param = param || '';
				datatype = param.split(':')[0];
				variant = param.split(':')[1];
				sub = param.split(':')[2];
			} else if (typeof (param) == 'object') {
				// revisar si es rtabla
				if (param.datatype == 'lookup') {
					datatype = 'lookup'
				} else if (param.tabla) {
					datatype = 'rtabla';
				} else {
					if (param.datatype) {
						datatype = param.datatype.split(':')[0];
						variant = param.datatype.split(':')[1];
						sub = param.datatype.split(':')[2];
					} else {
						datatype = 'string'; // default
					}
				}
			}
			return { datatype: datatype, variant: variant, sub: sub }
		}

	})

	/** Entrega la tabla como array ['returnClient'+ ':' + join(addClient)] */
	.service('displayRtabla', function () {
		return function (rtabla, opts) {
			return rtabla.data.map(function (o) {
				var ret = o[opts.returnClient]
				if (opts.addClient) {
					ret += _SEPARATOR_ + opts.addClient.map(f => o[f]).join(' - ');
				}
				return ret;
			})
		}
	})

	.service('encodeRtabla', function () {
		return function (input, rtabla, opts) {
			var value = input; // falback returns same input
			var valid = false; // 
			// Ahora recorrer la tabla, hasta encontrar el valor
			for (var i = 0; i < rtabla.data.length; i++) {
				// caracter -> se usa para separar campos. Si se cambia debe coincidir con decodeTabla
				if (rtabla.data[i][opts.returnClient] == (input || '').split(_SEPARATOR_)[0]) {
					value = rtabla.data[i][opts.returnSrv];
					valid = true;
					break;
				}
			}
			// fallback: retorna el mismo valor
			return { value: value, valid: valid };
		}
	})

	/** returnSrv a returnClient */
	.service('decodeRtabla', function () {
		return function (input, _rtabla, opts) {
			var value = input; // falback returns same input
			// Si es función, instanciar
			var rtabla = (typeof (_rtabla) == 'function') ? _rtabla() : _rtabla;
			var valid = false; // 
			var data;
			// Ahora recorrer la tabla, hasta encontrar el valor
			for (var i = 0; i < rtabla.length; i++) {
				if (rtabla[i][opts.returnSrv] == input) {
					value = rtabla[i][opts.returnClient];
					data = rtabla[i];
					valid = true;
					break;
				}
			}
			// fallback: retorna el mismo valor
			return { value: value, valid: valid, data: data };
		}
	})

	.service('preProcess', function ($filter, $moment, getDatatype, decodeRtabla) {
		return function (input, meta, rtablas, initialize) {
			var value = input;
			var valid = true;
			var type = getDatatype(meta);
			if (!type.datatype) {
				// No viene dato
				console.log("no viene dato")
				// currency:CLP
			} else if (type.datatype == 'date') {
				var format;
				// Si viene opción inicializar, inicializar como fecha de hoy
				if (initialize) { value = $moment().format('YYYY-MM-DD') }
				if (!value) {
					valid = false;
				} else { // Ver si es fecha válida
					if (typeof (input) == 'string') {
						if (value.match(/^\d{4,}/)) {
							valid = $moment(value, 'YYYY-MM-DD').isValid();
							format = 'YYYY-MM-DD';
						} else { // Intentar DD-MM-YYYY{
							valid = $moment(value, 'DD-MM-YYYY').isValid();
							format = 'DD-MM-YYYY';
						}
					} else {
						// Si es objeto o number, convertir a fecha YYYY-MM-DD usando moment
						valid = $moment(value).utc().isValid();
						value = $moment(value).utc().format('YYYY-MM-DD');
						format = 'YYYY-MM-DD';
					}
				}

				// Convertir dato en formato interno 'YYYY-MM-DD'
				if (type.variant == 'm') {
					if (type.sub == 'i') {
						value = $moment(value, format).utc().startOf('month').format('YYYY-MM-DD');
					} else if (type.sub == 'f') {
						value = $moment(value, format).utc().endOf('month').format('YYYY-MM-DD');
					}
				} else if (type.variant == 'd') {
					value = $moment(value, format).utc().format('YYYY-MM-DD');
				}
			} else if (isTypeNumeric(type.datatype)) {
				// Si viene opción inicializar, inicializar como número
				if (initialize) { value = 0 }
			} else {
				if (initialize) { value = '' }
			}
			return { value: value, valid: valid };

		}
	})

	.filter('monitor', ['$filter', 'getDatatype', 'decodeRtabla', function ($filter, getDatatype, decodeRtabla) {

		const FarFutureDate = '2097-01-01';
		const FarFutureText = 'indefinido';

		var isFarFuture = function (input) {
			var FarFuture = new Date(FarFutureDate);
			var fecha = new Date(input);
			return fecha > FarFuture;
		}
		return function (input, param, _rtablas) {

			var ret = input;
			var type = getDatatype(param);
			if (!type) {
				// No viene dato
				console.log("no viene dato")

				// currency:CLP
			} else if (type.datatype == 'currency') {
				//var currency = param.split(':')[1]||'CLP'; 
				type.variant = type.variant || 'CLP'; // por defecto currency es peso
				if (type.variant == 'CLP') {
					ret = $filter('currency')(input, '$ ', 0);
				} else {
					console.log("Warning, datatype currency desconocido: ", type.variant);
				}

				// number
			} else if (type.datatype == 'number') {
				ret = $filter('number')(input);

				// date:day|month
			} else if (type.datatype == 'date') {
				if (type.variant == 'd' || !type.variant) {
					ret = isFarFuture(input) ? FarFutureText : $filter('date')(input, 'mediumDate', 'UTC');
				} else if (type.variant == 'm') {
					ret = isFarFuture(input) ? FarFutureText : $filter('date')(input, 'MMM y', 'UTC');
				} else {
					console.log("Warning, datatype date desconocido: ", type.variant);
				}
				// lookup
			} else if (type.datatype == 'lookup') {
				// las tablas de apoyo están en el segundo parámetro
				// Si rtabla es una función, instanciar ahora
				var meta = (typeof (_rtablas) == 'function') ? _rtablas() : _rtablas;

				// el valor se encuentra en rtabla[param.tabla]
				ret = decodeRtabla(input, meta[param.tabla], param.options).value;
				// rtabla
			} else if (type.datatype == 'rtabla') {
				// Si rtabla es una función, instanciar ahora
				var rtablas = (typeof (_rtablas) == 'function') ? _rtablas() : _rtablas;
				// el valor se encuentra en rtabla[param.tabla]
				ret = decodeRtabla(input, rtablas[param.tabla], param.options).value;

				// gender
			} else if (type.datatype == 'gender') {
				if (typeof (input) == 'string') { // sólo si hay input
					if (input.match(/m/i)) ret = 'Masculino'
					else if (input.match(/f/i)) ret = 'Femenino'
					else ret = input; // error
				}
			} else if (type.datatype == '$estado') {
				//console.log("es estado", ret)
				ret = ''
			}
			// string
			else if (type.datatype == 'boolean') {
				// Hacer falsy el '0'
				ret = (input == '0' || !input) ? '☐' : '☑';
			}
			// string
			else if (type.datatype == 'string') {
				//si viene variante usar directamente
				if (type.variant == 'capitalize') ret = $filter('capitalize')(input);
			}


			return ret;
		}
	}])

	.filter('capitalize', function () {
		return function (input, all) {
			return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			}) : '';
		}
	})

	.filter('boolToStr', function () {
		return function (input) {
			return input ? "Si" : "No";
		}
	})

	.filter('dateZ', function ($filter) {
		return function (input, format) {
			var ret;

			format = format || 'dd-MM-yyyy'; // por defecto formato chileno
			var indef = new Date('2090-01-01'); // mayor a 2090 es infinito      
			var fecha = new Date(input);
			if (fecha > indef) {
				ret = 'Indefinido';
			} else if (fecha < indef) {
				fecha = fecha.valueOf() + fecha.getTimezoneOffset() * 60 * 1000;
				ret = $filter('date')(fecha, format);
			} else {
				// input no es fecha válida
				ret = input;
			}
			return ret;
		}
	})
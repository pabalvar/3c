'use strict';

/** Servicio para preparar datos para uso de Plugin Morris **/

/**
    params = {
        data: basicData
        xKey: 'year'
        barYkeys: ["a", "b"],
        labels: ["Series A", "Series B"],
        colors: ["#ff4a43","#1693A5"]
        stacked:true
    }
               
    basicData = [
      { year: '2009', a: 15,  b: 5 },
      { year: '2010', a: 20,  b: 10 },
      { year: '2011', a: 35,  b: 25 },
      { year: '2012', a: 40, b: 30 }
    ];

**/

angular.module('core')

.factory('rndMorris', function() {
    var m = {};
    m.donut = function(){
         // params
        this.params = {
            formatter: function(y,data){ return '$'+y},
            data: [],
            colors: [] //['#f3f42a','#1bc700',"#ff4a43","#1693A5"],
        }
        this.values= []; //[10, 20],
        this.labels= []; // ["Series A", "Series B"],

        var that = this;
        this.addData = function(value, label,color) {
            // El valor 0 se ve mal en estos gráficos-> ignorar
            if (value){
                // Update params
                that.values.push(value);
                that.labels.push(label);
                that.params.colors.push(color);
            }
        }
        
        this.val = function() {
            var ret = [];
            // Agregar dato por defecto si no hay nada, para que se vea un circulo
            if (this.values.length == 0){
                this.addData(-1,"sin datos",'#e1e5e7');
            }
            
            for (var i = 0;i<this.values.length;i++){
               ret.push({"label":this.labels[i],"value":this.values[i]})
            }

            this.params.data = ret;
            return this.params;
        }
    }
    m.chart = function() {

        // params
        this.params = {
            data: [],
            xKey: '', //'year'
            yKeys: [], //["a", "b"],
            labels: [], // ["Series A", "Series B"],
            
            colors: [], //['#f3f42a','#1bc700',"#ff4a43","#1693A5"],
            events:[],
            stacked: true
        }

        this.X = {}; // ref to yKeys
        var that = this;
        this.addData = function(data, label, xKey, yKey, color,event,stacked) {
            // Update params
            that.params.xKey = xKey;
            that.params.yKeys.push(label);
            that.params.labels.push(label);
            that.params.colors.push(color);
            that.params.stacked = stacked;
            if (event) {
				if (that.params.events.indexOf(event)<0){
				that.params.events.push(event);
				}
			}

            // Loop over data and add to X
            data.forEach(function(e) {
                that.X[e[xKey]] = that.X[e[xKey]] || {};
                that.X[e[xKey]][label] = e[yKey];
            });
        }

        /** convierte string tipo '0000201501' en E F Ma A My Jn Jl A S O N D**/
        this.nproceso2date = function(x) {
            var Meses = ['E', 'F', 'Ma', 'A', 'My', 'Jn', 'Jl', 'A', 'S', 'O', 'N', 'D'];
            var mes = x.substring(8, 10);
            var anno = x.substring(4, 8);
            //return String(Meses[mes - 1]) + anno; // E15 -> Enero 2015
            return  anno+"-"+mes;
        }

        this.val = function() {

            var ret = [];
            for (var x in this.X) {
                var tmp = this.X[x];
                tmp[this.params.xKey] = this.nproceso2date(x); // Acá puede usarse una transformación de X
                ret.push(tmp);
            }
            this.params.data = ret;

            return this.params;
        }

    }
    return m;
});
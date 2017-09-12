'use strict';

/** Servicio para preparar datos para uso de Plugin Morris **/


angular.module('core')

.factory('rndColors', function() {
    var shadeColor = function(color, percent) {
        var R = parseInt(color.substring(1, 3), 16);
        var G = parseInt(color.substring(3, 5), 16);
        var B = parseInt(color.substring(5, 7), 16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;

        var RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
        var GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
        var BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

        return "#" + RR + GG + BB;
    }

    var m = {};

    /** shortcut al theme para acceder a los colores en JS (sin tener que recorrer theme). Ojo, rompe MVC */
    m.colorIndex = function(name, shade) {
        var color = ''
        if (name == 'primary') color = '428bca';
        else if (name == 'success') color = '5cb85c';
        else if (name == 'warning') color = 'f0ad4e';
        else if (name == 'danger') color = 'd9534f';
        else if (name == 'info') color = '5bc0de';
        else if (name == 'default') color = '616f77';
        else if (name == 'cyan') color = '22beef';
        else if (name == 'green') color = 'a2d200';
        else if (name == 'red') color = 'ff4a43';
        else if (name == 'orange') color = 'ffc100';
        else if (name == 'amethyst') color = 'cd97eb';
        else if (name == 'greensea') color = '16a085';
        else if (name == 'dutch') color = '1693A5';
        else if (name == 'hotpink') color = 'FF0066';
        else if (name == 'blue') color = '418bca';
        else if (name == 'slategray') color = '536781';
        else if (name == 'darkgray') color = '4d4d4d';
        else if (name == 'lightred') color = 'e05d6f';
        else color = '428bca'; // por defecto primary

        color = '#' + color; // agrega hash

        if (!isNaN(shade)) {
            color = shadeColor(color, shade);
        }

        return color;
    }

    /** convierte string tipo '0000201501' en E F Ma A My Jn Jl A S O N D**/
    m.nproceso2date = function(x) {
        var Meses = ['E', 'F', 'Ma', 'A', 'My', 'Jn', 'Jl', 'A', 'S', 'O', 'N', 'D'];
        var mes = parseInt(x.substring(8, 10));
        var anno = x.substring(6, 8);
        return String(Meses[mes - 1]) + anno;
    }

    return m;
});
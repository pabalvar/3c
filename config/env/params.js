'use strict';
var path = require('path', 'dont-enclose');
var fs = require('fs');

// puerto TCP por defecto
var port = process.env.NODE_PORT || 3000;

// ruta a cache en disco (%APPDATA% en windows, /var/log en LINUX)
var rootPath = process.env.APPDATA || path.join('/var', 'log');
var localPath = path.join(rootPath, 'RandomStack', String(port));
var connectionFile = path.join(localPath, 'sql.connection.json');

// Nivel de DEBUG. error=0,warning=1,log=2,info=3
var debugLevel = process.env.DEBUG_LEVEL || 2;

// URL del servidor de documentación
var docSrvURL = process.env.DOCU_URL || 'http://localhost:80';

module.exports = {
    app: {
        title: 'Random RRHH',
        description: 'Sistema de recursos humanos',
        keywords: 'Web, RANDOM ERP',
        version: '1.0.0'
    },
    debugLevel: debugLevel,
    docu: {
        url: docSrvURL
    },
    port: port,
    localPath: localPath,
    sql: {
        defaultParams: {
            'user': '',
            'password': '',
            'server': '',
            'database': '',

            'options': {
                'tdsVersion': '7_1',
                'encrypt': true,  //Usar para un servidor Azure
                'connectionTimeout': 40000,  //En ms
                'requestTimeout': 40000,    //En ms
                'pool.idleTimeoutMillis': 30000  //En ms, tiempo antes de cerrar una conexion no usada
            }
        },
        connectionFile: connectionFile
    }
}
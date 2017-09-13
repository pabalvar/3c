'use strict';

var fs = require('fs', 'dont-enclose'),
    http = require('http', 'dont-enclose'),
    https = require('https', 'dont-enclose'),
    express = require('express'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    cookieSession = require('cookie-session'),
    passport = require('passport'),
    config = require('./config'),
    consolidate = require('consolidate'),
    path = require('path', 'dont-enclose'),
    logger = require('./logger.js');

/**
* Si quieres cambiar constantes revisa params.js
*/
module.exports = function (connectionPool) {
    // Initialize express app
    var app = express();

    // Ruta a log files
    var localPath = config.localPath;
    var scribe = require('scribe-js')({
        rootPath: path.join(localPath, '/logs')
    });

    // Debug level
    app.locals = app.locals || {};
    app.locals.debugLevel = config.debugLevel; // error=0,warning=1,log=2,info=3
    process.console = logger.console(app)(process.console); // agrega métodos console.Error, etc... 

    //ruta para visualizador de log Scribe
    app.use('/logs', scribe.webPanel());

    // Favourite Icon
    app.use(favicon("public/favicon.ico"));

    // CookieParser should be above session
    app.use(cookieParser());

    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
    app.use(bodyParser.json({ limit: "50mb" }));

    /* Retorna un objeto con los filtros del cliente en forma segura*/
    app.use(function (req, res, next) {
        // Init campos SQL
        req.consultas = req.consultas || {};
        next();
    });

    app.use(methodOverride());

    app.use(cookieSession({
        secret: 'RANDOM_SECRET'
    })); // Express cookie session middleware

    // use passport
    app.locals.auth = require('./passport')(app);
    app.use(passport.initialize()); // passport initialize middleware
    //app.use(passport.session()); // passport session middleware [TO-DO: after passport auth (config function: serializeUser() & deserializeUser()), use: req.session o req.user]
    //app.use(app.locals.auth); //RECOMMENDED: use an environment variable for referencing the secret and keep it out of your codebase (should be equal to the one use on models/Users.js)

    // Setting application local variables
    app.locals.title = config.app.title;
    app.locals.description = config.app.description;
    app.locals.keywords = config.app.keywords;
    app.locals.jsFiles = config.getJavaScriptAssets();
    app.locals.cssFiles = config.getCSSAssets();
    app.locals.connectionPool = connectionPool;
    app.locals.localPath = localPath;
    app.locals.paramsSQL = config.paramsSQL;
    app.locals.sqlConnection = config.sqlConnection;

    // Passing the request url to environment locals
    app.use(function (req, res, next) {
        res.locals.url = req.protocol + '://' + req.headers.host + req.url;
        next();
    });

    // Should be placed before express.static
    app.use(compress({
        filter: function (req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    // Showing stack errors
    app.set('showStackError', true);

    // Set swig as the template engine
    app.engine('server.view.html', consolidate[config.templateEngine]);

    // Set views path and view engine
    app.set('view engine', 'server.view.html');
    app.set('views', './app/lib/Server/views');

    // Environment dependent middleware
    if (process.env.NODE_ENV === 'development') {

        // Disable views cache
        //app.set('view cache', false);
    } else if (process.env.NODE_ENV === 'production') {
        app.locals.cache = 'memory';
    }

    // Setting the app router and static folder
    app.use(express.static(path.resolve('./public')));

    // Incluir los middleware (el orden importa, por eso se fuerza según se requieren)
    function requirePath(routePath) { require(path.resolve(routePath))(app); }
    config.getGlobbedFiles('./app/lib/*/routes/**/*.js').forEach(requirePath);
    config.getGlobbedFiles('./app/rrhh/contracts/routes/**/*.js').forEach(requirePath);
    config.getGlobbedFiles('./app/**/routes/**/*.js').forEach(requirePath);
    //config.getGlobbedFiles('./app/lib_erp/*.js').forEach(requirePath);
    config.getGlobbedFiles('./app/gestion/*.js').forEach(requirePath);

    // Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
    app.use(function (err, req, res, next) {
        // If the error object doesn't exists
        if (!err) return next();

        // Log it
        process.console.Error(err.stack);

        // Error page
        res.status(500).json({ type: "ERR_SRV_UNKNOWN", message: "Error de servidor", error: err.stack });
    });

    // Assume 404 since no middleware responded
    app.use(function (req, res) {
        res.status(404).json({ type: "ERR_404", message: "Ruta no existe: " + req.originalUrl });
    });

    if (process.env.NODE_ENV === 'secure') {
        // Log SSL usage
        console.log('Securely using https protocol');

        // Load SSL key and certificate
        var privateKey = fs.readFileSync('./config/sslcerts/key.pem', 'utf8');
        var certificate = fs.readFileSync('./config/sslcerts/cert.pem', 'utf8');

        // Create HTTPS Server
        var httpsServer = https.createServer({
            key: privateKey,
            cert: certificate
        }, app);

        // Return HTTPS server instance
        return httpsServer;
    }

    // Return Express server instance
    return app;
};
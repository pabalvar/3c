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
    configPassport = require('./config.passport.js'),
    consolidate = require('consolidate'),
    path = require('path', 'dont-enclose'),
    logger = require('./logger.js'),
    globals = require('../app/lib/globals/controllers/globals.js'),
    db = require('../app/lib/Server/controllers/config.server.controller.js');


module.exports = function (config) {
    // Initialize express app
    var app = express();

    // Ruta a log files
    var localPath = config.localPath;
    var scribe = require('scribe-js')({ rootPath: path.join(localPath, '/logs') });

    // Anexar config/env/params.js en app.locals.config
    app.locals = app.locals || {};
    app.locals.config = config;

    // Métodos console.Error, console.Info, etc
    process.console = logger.console(app)(process.console);

    //ruta para visualizador de log Scribe
    app.use('/logs', scribe.webPanel());

    // Favourite Icon
    app.use(favicon("public/favicon.ico"));

    // CookieParser should be above session
    app.use(cookieParser());

    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
    app.use(bodyParser.json({ limit: "50mb" }));

    /* Inicializar campos consulta SQL*/
    app.use(globals.initReq);
    app.use(methodOverride());
    app.use(cookieSession({ secret: 'RANDOM_SECRET', resave: false, saveUninitialized: false }));

    // inicializar passport
    configPassport.init(app);
    app.locals.auth = configPassport.requiresLogin;//require('./config.passport.js')(app);

    // Setting application local variables
    app.locals.title = config.app.title;
    app.locals.description = config.app.description;
    app.locals.keywords = config.app.keywords;
    app.locals.jsFiles = config.getJavaScriptAssets();
    app.locals.cssFiles = config.getCSSAssets();
    app.locals.localPath = localPath;

    // abrir archivo conexión 
    db.read(config);
    db.reset(app)();

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
    // Ruta a la documentación
    app.use('/docu', express.static(path.resolve('./docu')));
    // Setting the app router and static folder
    app.use(express.static(path.resolve('./public')));

    // Incluir los middleware (el orden importa, por eso se fuerza según se requieren)
    function requirePath(routePath) { require(path.resolve(routePath))(app); }
    config.getGlobbedFiles('./app/lib/*/routes/**/*.js').forEach(requirePath);
    config.getGlobbedFiles('./app/rrhh/contracts/routes/**/*.js').forEach(requirePath);
    config.getGlobbedFiles('./app/rrhh/!(contracts)/routes/**/*.js').forEach(requirePath);
    // módulos no anidados. eg. /app/gestion/entidades.routes.js
    config.getGlobbedFiles('./app/liberp/*routes.js').forEach(requirePath);
    config.getGlobbedFiles('./app/!(lib|rrhh)/*.routes.js').forEach(requirePath);

    // Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
    app.use(function (err, req, res, next) {
        if (!err) return next(); // If the error object doesn't exists
        process.console.Error(err.stack);        // Log it
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
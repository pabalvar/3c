module.exports = function(app) {
     // Para configurar test de carga (con página Loader.IO)
    app.route('/loaderio-e4b522fb4918f12133092a50d430ee61/')
        .get(function(req, res, next) {
                console.log("R con id QUERY", req.query);
                console.log("R con id PARAMS", req.params);
                next();
            },
            function(req, res) {
                res.status(200).send("loaderio-e4b522fb4918f12133092a50d430ee61");
            }
        );
}
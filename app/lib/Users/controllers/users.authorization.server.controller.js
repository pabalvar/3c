'use strict';


exports.requiresLogin = function (req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).send({
            message: 'Usuario no ha abierto sesión'
        });
    }
    next();
};
'use strict';

var db = require('../controllers/config.server.controller');

module.exports = function (app) {

    app.route('/config/db')
        .get(db.list(app))
        .post(db.reset(app), db.save(app))
        .put(db.reset(app))
    app.route('/config/debug/:debugLevel')
        .get(db.setDebugLevel(app));
};
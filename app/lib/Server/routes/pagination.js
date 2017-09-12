"use strict";
/** Middleare para entregrar paginación **/
module.exports = function(app) {
    app.use(function(req,res,next){

        // catches: count,start,size,page
        var ret = {}
        var query = req.query;
        if (query){
            if (query.count) ret.count = query.count;
            if (query.start || query.size || query.page){ 
                ret.pagination = {};
                if (query.start) ret.pagination.start = parseInt(query.start);
                if (query.size) ret.pagination.size = parseInt(query.size);
                if (query.page) ret.pagination.page = parseInt(query.page);
            }
            if (query.order) ret.pagination.order = query.order;
            
        }
        req.pagination = ret;
        //console.log("using castSQL middleware:", req.pagination);
        next();
    });
}
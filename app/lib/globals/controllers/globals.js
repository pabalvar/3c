'use strict';

/** Middleware que convierte parámetros query de la URL **/
exports.urlParams = function(req,res,next){
    if (req.query){
        // param: proceso. Si es truty convertirlo a true. Indica usar proceso activo
        if (req.query.proceso) req.query.proceso = true;
        else if (req.query.unassigned) req.query.unassigned = true;
        else if (req.query.requerido) req.query.requerido = true;
    }
    next();
}

/** Función de salida de objeto **/
exports.returnStatusCreate = function(req,res){
    var out;
    if (req.filas){
        out=req.filas[0];
    }
    out.object='status_create';
    res.send(out);
}
/** Función de salida de objeto **/
exports.returnStatusDelete = function(req,res){
    var out;
    if (req.filas){
        out=req.filas[0];
    }
    out.object='status_delete';
    res.send(out);
}
/** Función de salida de objeto **/
exports.returnStatusUpsert = function(req,res){
    var out;
    if (req.filas){
        out=req.filas[0];
    }
    out.object=req.object||'status_upsert';
    res.send(out);
}
/** Función de salida de objeto **/
exports.returnStatusUpdate = function(req,res){
    var out;
    if (req.filas){
        out=req.filas[0];
    }
    out.object=req.object||'status_update';
    res.send(out);
}
/** Función de salida de objeto **/
exports.returnStatus = function(req,res){
    var out;
    if (req.filas){
        out=req.filas[0];
    }
    out.object=req.object||'status_insert';
    res.send(out);
}

/** Función de salida para NO queries, usado para retornar constantes **/
exports.returnConstante = function(req, res){
    var out = {
        "values" : req.data,
        "object" : 'constante'
    };
    //res.send(req.data);   
    res.send(out);
    return;
}

// definición objetos salida
// contrato_dialog {object:'contrato_dialog', data:[], rtablas}
exports.contrato_dialog = function(req,res){

    // si no vienen datos retornar 400
    if (!(req.resultados.contracts||[]).length && req.singleResource) {
        errorRes(req,res,404,'ERR_SRV_404','No se encuentra el recurso'); 
        return;
    }
    // si viene req.embed.dialog retornar dialog
    var out = {object:'contrato_dialog'}
    var key = 'contracts'
    // agregar rtablas
    if ((req.embed||{}).dialog) {
        out.rtablas =req.resultados.parseRtablas;
    }
    // agregar información datatables
    if(req.query.type== 'datatable'){
        out.recordsTotal = req.resultados.contracts_datatable[0].total;
        out.recordsFiltered = req.resultados.contracts_datatable[0].total;  
    }
    out.data = req.resultados.contracts;
    // agregar 
    res.send(out);
    return
}


/** Función global de salida a cliente con recurso */
exports.queryOut = function(req,res){
    var k,out;
    if (req.singleResource||req.query.count){
        for(var key in req.resultados){
            out=req.resultados[key][0];
        }
    }else{
        var out = {object:"list"};

        var isObject;
        // probar si respuesta viene en req.resultados
        for(var key in req.resultados){
            isObject = true;
            if (k = key.match(/(.*)_datatable$/)){
                out.recordsTotal = req.resultados[key][0].total;
                out.recordsFiltered = req.resultados[key][0].total;
            }else{
                out.data = req.resultados[key];
            }
        }
        if (!isObject){
            // La respuesta debe venir en req.filas
            out.data = req.filas;
        }
        
    }
    
    // Validación. Si es singleResource y no hay resultados, devolver 404
    if (req.singleResource){
        if (typeof(out)=='undefined'){
            console.log("sacando 404",typeof(out))
            errorRes(req,res,404,'ERR_SRV_404','No se encuentra el recurso'); 
            return            
        }   
    }
    
    res.send(out);
}
var errorRes = function(req,res,status,type,message){
    status = status||400;
    type = type||'ERR_SRV_400';
    message = message||'requerimiento malformado';
   
    //console.tag("ERR",type).Error(message);
 
    res.status(status).json({
        type: type,
        message: message
    });
    return
}
exports.errorRes = errorRes;

exports.noContent = function(req,res,msg){
        msg = msg||'ningún elemento coincide con el criterio de búsqueda';
        console.log("tarea vacía. HTTP-202");
        res.status(202).json(
            {
                type: 'NO_CONTENT',
                message: msg
            });
}

/** Valida campos antes de insertar */
exports.validateFields = function(arr,tr){

    arr.forEach(function(l){

        // Reemplazar cada línea por su función tr, si existe
        for (var key in tr){
            if (tr[key].required){
                if (typeof(l[key])=='undefined'){
                    l[key]=null;
                }
            }
        }
        for (var key in l){
            // Aplicar validación tr
            if (typeof ((tr[key]||{}).transform) != 'undefined'){
                l[key] = tr[key].transform(l[key],l); 
            }
        }
    });
    return arr;
}
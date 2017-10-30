'use strict';

var _ = require('lodash');
var SQLcast = require('../lib/random_lib/castSQL').SQLcast;
var SQLsearch = require('../lib/random_lib/castSQL').getSearchStringQuery;

exports.buscar = buscar;

function buscar(req, res, next) {
  // Preparar los campos
  var p = {}
  p.fields = ((_.castArray(req.query.f).join(', ')) || '*') + '/noquote'
  p.tables = _.castArray(req.query.t).join(', ') + '/noquote'
  if (req.query.c) p.condition = _.castArray(req.query.c).map(f => 'and ' + f).join(', ') + '/noquote'
  if (req.query.o) p.orderby = _.castArray(req.query.o).join(', ') + '/noquote'
  if (req.query.search) {
    p.search = req.query.search;
    p.searchQ = SQLsearch(req.query.f);
  }

  req.consultas.buscar = SQLcast(buscarSQL(), p, req.pagination);
  next();
}

function buscarSQL() {
  return `
  -- Búsqueda global 
  declare @search varchar(1000)
  set @search = '%'+'texto'--<< search
  set @search = UPPER(@search)+'%'
 
  -->> select
 SELECT 
   KOEN,NOKOEN --<< fields
 -->> from
 FROM 
   MAEEN --<< tables
 -->> where
 WHERE 1=1
   KOEN='001' --<< condition
   AND UPPER( COALESCE(KOEN, '')+COALESCE(NOKOEN, '') ) like @search --<< searchQ?
 -->> order  
 ORDER BY --<< orderby?
   order --<< orderby
  `;
}
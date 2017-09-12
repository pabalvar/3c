'use strict';

angular.module('core')
.factory('rndExcel', function($window) {

        var setExcelHeaders = function(Params) {
            var now = new Date();
            var params = Params||{};
            params.author = params.author || "Random ERP";
            params.created = now.toISOString();
            params.changed = now.toISOString();
            params.fileName = params.fileName || 'RandomERP_reporte.xls';
        
            var template = `
                <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
                <html lang="es-ES">
                    <head>
                        <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
                        <title>{title}</title>
                        <meta name="generator" content="Random ERP-html5"/>
                        <meta name="author" content="{author}"/>
                        <meta name="created" content="{created}"/>
                        <meta name="changed" content="{changed}"/>
                        <style type="text/csv">
                            body,div,table,thead,tbody,tfoot,tr,th,td,p { font-family:"Arial"; font-size:x-small }
                        </style>
                    </head>
            `;
            return template.replace(/{(\w+)}/g, function(m, p) {
                return params[p]; }).replace(/\t/g, '').replace(/\s\s/g,' ');
        }

        var setWordHeaders = function(Params) {
            var now = new Date();
            var params = Params||{};
            params.author = params.author || "Random ERP";
            params.created = now.toISOString();
            params.changed = now.toISOString();
            params.fileName = params.fileName || 'RandomERP_reporte.xls';
        
            var template = `
                <html>
                    <head>
                        <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
                        <title>{title}</title>
                        <meta name="generator" content="Random ERP-html5"/>
                        <style type="text/csv">
                            body,div,table,thead,tbody,tfoot,tr,th,td,p { font-family:"Arial"; font-size:x-small }
                        </style>
                    </head>
            `;
            return template.replace(/{(\w+)}/g, function(m, p) {
                return params[p]; }).replace(/\t/g, '').replace(/\s\s/g,' ');
        }
        
        var createLink = function(uri,Params){
            var params = Params||{};
            var link = document.createElement("a");
            link.href = encodeURI(uri); // esta línea necesaria si se baja CSV, si no, opcional
            link.style = "visibility:hidden";
            link.download = params.fileName || 'file.txt';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        var stripHTML = function(text){
            var str = text;
            str=str.replace(/<\/th>/gi, ";"); // header cells as semicolon
            str=str.replace(/<\/td>/gi, ";"); // table cells as semicolon
            str=str.replace(/<\/tr>/gi, "\r\n"); // table rows as new line
            //str=str.replace(/<\/hr>/gi, "\r\n"); // page break as new line
            str=str.replace(/<br\s*\/?>/gi, "\r\n"); // new line as new line
            
            str=str.replace(/<\/(?:h1|h2|h3|h4|h5|h6|p)\s*>/gi,"\r\n"); // reemplaza final párrafo por newline
            str=str.replace(/<\/(?:dt|dd)\s*>/gi,"\r\n"); // reemplaza final objeto dt/dd newline
            
            str=str.replace(/<(?:.|\s)*?>/g, ""); // borrar todos los otros tags
            
            return str;        
        }
        /** Convertir tableArray={table:columns:{},data:[],instance:{}} */
        var rndMultiTable2Table = function(tableArray){
            var doc = '';
            tableArray.forEach(function(t){
                doc += rndTable2Table(t.tabla.rndtable);
            })

            return doc;
        }     
        var rndModel2Table = function(data,model){
            // head
            var thead = '<thead><tr>';
            thead += model.map(o=>'<th>'+o.name+'</th>').join('');
            thead += '</tr></thead>';
            // tbody
            var tbody = '<tbody>';
            data.map(function(l){
                tbody += '<tr>'+model.map(m=>'<td>'+l[m.field]+'</td>').join('')+'</tr>';
            })
            tbody += '</tbody>'
            var ret = '<table>'+thead+tbody+'</table>';
            return ret;           
        }

        var rndTable2Table = function(table){
            // convertir table.columns=[{data:"VALPRIN",type:"text"}...] en <colgroup> <col style="width: 172px;">...</colgroup>
            
            var thead = '<thead><tr>';
            table.columnsSrc.forEach(function(c){
                    if(c.visible||c.exportable)
                thead+=`<th>${c.title}</th>`;
            });
            thead += '</tr></thead>';
            
            // tbody
            var tbody = '';
            table.data.forEach(function(l){
                tbody +='<tr>';
                table.columnsSrc.forEach(function(c){
                        if(c.visible||c.exportable)
                    tbody += `<td>${l[c.data]}</td>`;                
                });
                tbody+= '</tr>';
            });
            
            // body
            var ret = `<table> ${thead} ${tbody} </table>`;
            return ret;
        }

        var m = {
            multiTableToExcel: function(tableArray, Params){
                var params = Params || {};
                /** Preraparar contenido **/
                // Header
                var head = setExcelHeaders(params);
                // Body
                var body =  '<body>'+rndMultiTable2Table(tableArray)+'</body></html>';
                /** Preparar encabezados de URL **/
                // anexar a uri
                var uri = 'data:text/csv;charset=utf-8,' + head + body;
                // Anexar documento al DOM y descargar
                createLink(uri,params);
            },
            modelToExcel: function(data,model,params){
                var head = setExcelHeaders(params);
                var body =  '<body>'+rndModel2Table(data,model)+'</body></html>';
                var uri = 'data:text/csv;charset=utf-8,' + head + body;
                createLink(uri,params);
            },
            tableToExcel: function(table, Params) {
                var params = Params || {};
                
                /** Preraparar contenido **/
                // Header
                var head = setExcelHeaders(params);
                // Body
                var body =  '<body>'+rndTable2Table(table)+'</body></html>';
                /** Preparar encabezados de URL **/
                // anexar a uri
                var uri = 'data:text/csv;charset=utf-8,' + head + body;
                // Anexar documento al DOM y descargar
                createLink(uri,params);
            },
            htmlToExcel:function(text,Params){
                var params = Params || {};
                /** Preraparar contenido **/
                // Header
                var head = setExcelHeaders(params);
                // Body
                var body =  '<body>'+text+'</body></html>';
                // anexar a uri
                var uri = 'data:text/csv;charset=utf-8,' + head + body;
                // Anexar documento al DOM y descargar
                createLink(uri,params);
            },
            htmlToWord:function(text,Params){
                var params = Params || {};
                /** Preraparar contenido **/
                // Header
                var head = setWordHeaders(params);
                // Body
                var body =  '<body>'+text+'</body></html>';
                // anexar a uri
                var uri = 'data:text/csv;charset=utf-8,' + head + body;
                // Anexar documento al DOM y descargar
                createLink(uri,params);
            },
            htmlToCSV: function(text,params){
            /** Preraparar contenido **/
            // Body
            var body = stripHTML(text);
            // anexar a uri
            var uri = 'data:text/csv;charset=utf-8,' + body;
            // Anexar documento al DOM y descargar
            createLink(uri,params);
        
            }
        }
        return m;
    })
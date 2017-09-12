'use strict';

/** Appends Methods to node's console **/

exports.console = function(app){
    return function(ProcessConsole){
        var console = ProcessConsole;
            console.Error = function(txt,txt2) {
                //console.loggers.error.logInConsole = true;
                console.error(txt,txt2||'');
            }
            console.Warning = function(txt,txt2) {
                if (app.locals.debugLevel >= 1) {
                    console.warning(txt,txt2||'');
                }else{
                    console._tags=[];
                }
            }
            console.Log = function(txt,txt2) {
                if (app.locals.debugLevel >= 2) {
                    console.log(txt,txt2||'');
                }else{
                    console._tags=[];
                }
            }
            console.Info = function(txt,txt2) {
                if (app.locals.debugLevel >= 3) {
                    console.info(txt,txt2||'');
                }else{
                    console._tags=[];
                }
            }
            return console;
        }
}
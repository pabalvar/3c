angular.module('core')
.factory('State', function() {
    // State machine
    return function(name){
        var self = this;
        this.name = name;
        this._states = {};
        this.ticker = 1;
        this.refresh = function(){
            self.ticker++;
        }
        var states = this._states;

        /** param: array. Retorna true si todo el array es truty */
        this.changed = function(currentVector,reload){
            var ret = false;

            if (currentVector.every(i=>i)){
                var currentVectorStr = JSON.stringify(currentVector);

                if (states.previousVectorStr != currentVectorStr || states.previousTicker != self.ticker){

                    states.previousVectorStr = currentVectorStr;
                    states.previousTicker = self.ticker;
                    //console.log("valid state changed:",states.currentVector.join('_'));
                    ret = true;
                }else{
                    if (reload) ret = true;
                    //console.log("valid state unchanged",states.currentVector.join('_'));
                }
            }else{
                //console.log("no valid state:",states.currentVector.join('_'));
            }
            return ret;
        }
        //console.log("init State, ["+this.name+"] currentVector:",this._states.currentVector); 
    }

});
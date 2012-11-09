var path = require('path');
var fs = require('fs');

var _nebsavr;
module.exports = {
    init: function(rs, input, cb){

        if (!input.helpers){
            input.helpers = {};
        }

        if (!_nebsavr){
            _nebsavr = path.resolve(__dirname, '../../view');
            if (!fs.existsSync(_nebsavr)){
                throw new Error('bad path ' + _nebsavr);
            }
        }
        input.helpers.nebsavr = _nebsavr;
        cb();
    }
}
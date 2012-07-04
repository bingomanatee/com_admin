var NE = require('nuby-express');
var util = require('util');
var _DEBUG = false;
var _ = require('underscore');
var Gate = NE.deps.support.Gate;

/* ***************** CLOSURE ******************* */

function _refresh_options(frame, src) {
    var opts = src.get_config('options');
    if (opts && _.isArray(opts)) {
        opts = _.map(opts, function (saved_option) {
            var out = {src:src.name, class:src.CLASS};
            return _.extend(out, saved_option);
        });

        return opts;

    }
}

/* ****************** MODULE ***************** */

module.exports = {
    init:function (frame, cb) {
        var config_file_options = [];

        frame.get_controllers().forEach(function (con) {
            var ro = _refresh_options(frame, con);
            if (ro && _.isArray(ro)){
                config_file_options = config_file_options.concat(ro);
            }
        })

        frame.get_components().forEach(function (con) {
            var ro = _refresh_options(frame, con);
            if (ro && _.isArray(ro)){
                config_file_options = config_file_options.concat(ro);
            }
        })


        if (_DEBUG) console.log('inspecting cc options %s', util.inspect(config_file_options));

        var options_model = frame.get_resource('model', 'cc_options');

        var gate = new Gate(cb, 'loading cc options %s', util.inspect(config_file_options));
        gate.debug = true;

        options_model.active(function(err, saved_options){
            if (_DEBUG) console.log('saved options: %s', util.inspect(saved_options));

            config_file_options.forEach(function(config_file_option){
                if (_DEBUG) console.log('investigating config %s', util.inspect(config_file_option))
                var saved_option = _.find(saved_options, function(saved_option){
                    if (_DEBUG) console.log('comparing it to saved option %s', util.inspect(saved_option.toJSON()));
                    return (saved_option.name == config_file_option.name)
                        && (saved_option.class == config_file_option.class);
                });
                if (_DEBUG) console.log('option exists: %s', util.inspect(saved_option));
                if (saved_option){
                    var cc_value = _.clone(config_file_option);
                    if (_.isNull(saved_option.value)){
                        cc_value.value = cc_value.default;
                    } else {
                        delete config_file_option.value;
                    }
                    _.extend(saved_option, cc_value);
                    saved_option.save(gate.task_done_callback(true));
                    
                } else {
                    if (_DEBUG) console.log('putting options ', config_file_option);
                    gate.task_start();
                    options_model.put(config_file_option,
                        function(err, result){
                            if (err){
                                if (_DEBUG) console.log('ERR saving option: %s', util.inspect(err));
                            } else {
                                if (_DEBUG) console.log('SAVED option: %s', util.inspect(result));
                            }
                            gate.task_done();
                        }
                       );
                }
                
            });

            gate.start();
        });
    }
}


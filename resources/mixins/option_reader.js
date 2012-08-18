var NE = require('nuby-express');
var util = require('util');
var _DEBUG = false;
var _DEBUG_OPTIONS = false;
var _ = require('underscore');
var Gate = NE.deps.support.Gate;

/* ***************** CLOSURE ******************* */

function _refresh_options(frame, src) {
    var opts = src.direct_config('options');
    if (opts && _.isArray(opts)) {
        opts = _.map(opts, function (saved_option) {
            var out = {src:src.name, class:src.CLASS};
            return _.extend(out, saved_option);
        });

        return opts;

    }
}

function _get_option(name, cb, frame) {

    var options_model = frame.get_resource('model', 'cc_options');

    options_model.find_one({name:name, deleted:{"$ne":true}},
        function (err, opt) {
            if (err) {
                cb(err);
            } else if (opt) {
                cb(null, opt.value);
            } else {
                cb(new Error('cannot find option ' + name));
            }
        }
    )
}

/* ****************** MODULE ***************** */

module.exports = {
    init:function (frame, cb) {

        NE.Action.prototype.get_option = function (name, callback) {
            _get_option(name, callback, frame);
        }

        var config_file_options = [];

        var controllers = frame.frame_controllers();

        if (_DEBUG)  console.log('%s controllers found', controllers.length);

        controllers.forEach(function (con) {
            if (_DEBUG) {
 // console.log('LOOKING FOR OPTIONS IN CONTROLLER "%s"', con.name);
            }
            var ro = _refresh_options(frame, con);
            if (_DEBUG) {
 // console.log('.... found %s', util.inspect(ro));
            }
            if (ro && _.isArray(ro)) {
                config_file_options = config_file_options.concat(ro);
            }
        })

        frame.get_components().forEach(function (com) {
            if (_DEBUG) {
 // console.log('LOOKING FOR OPTIONS IN COMPONENT "%s"', com.name);
            }
            var ro = _refresh_options(frame, com);
            if (_DEBUG) {
 // console.log('.... found %s', util.inspect(ro));
            }
            if (ro && _.isArray(ro)) {
                config_file_options = config_file_options.concat(ro);
            }
        })


        if (_DEBUG || _DEBUG_OPTIONS) console.log('inspecting cc options %s', util.inspect(config_file_options));

        var options_model = frame.get_resource('model', 'cc_options');

        var gate = new Gate(cb, 'loading cc options %s', util.inspect(config_file_options));
        gate.debug = false;

        options_model.active(function (err, saved_options) {
            if (_DEBUG) console.log('saved options: %s', util.inspect(saved_options));

            config_file_options.forEach(function (config_file_option) {
                if (_DEBUG) console.log('investigating config %s', util.inspect(config_file_option))
                var saved_option = _.find(saved_options, function (saved_option) {
                    if (_DEBUG) console.log('comparing it to saved option %s', util.inspect(saved_option.toJSON()));
                    return (saved_option.name == config_file_option.name)
                        && (saved_option.class == config_file_option.class);
                });
                if (_DEBUG) console.log('option exists: %s', util.inspect(saved_option));
                if (saved_option) {
                    var cc_value = _.clone(config_file_option);
                    if (_.isNull(saved_option.value)) {
                        cc_value.value = cc_value.default;
                    } else {
                        delete config_file_option.value;
                    }
                    _.extend(saved_option, cc_value);
                    saved_option.save(gate.task_done_callback(true));

                } else {
                    if (_DEBUG) console.log('putting options ', config_file_option);
                    if (config_file_option){
                        config_file_option.value = config_file_option.default;
                    }
                    gate.task_start();
                    options_model.put(config_file_option,
                        function (err, result) {
                            if (err) {
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


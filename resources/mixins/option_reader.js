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

    var options_model = frame.get_resource('model', 'site_options');

    options_model.find_one({name:name, '$nor':[{deleted: true}]},
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
        var options_model = frame.get_resource('model', 'site_options');

        NE.Action.prototype.get_option = function (name, callback) {
            _get_option(name, callback, frame);
        }

        var config_file_options = [];

        var controllers = frame.frame_controllers();

        if (_DEBUG)  console.log('%s controllers found', controllers.length);

        controllers.forEach(function (con) {
            options_model.read_resource_options(con);
        })

        frame.get_components().forEach(function (com) {
            options_model.read_resource_options(com);
        })

        cb();

    }
}


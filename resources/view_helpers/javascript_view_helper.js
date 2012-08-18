var NE = require('nuby-express');
var _ = require('underscore');
var util = require('util');
var proper_path = require('support/proper_path');
var _DEBUG = true;

var _js_view = new NE.helpers.View({
    name:'js_view_helper',

    init:function (rs, input, cb) {


        var ln = rs.action.get_config('layout_name', 'NO LAYOUT')

        if (ln == 'NO LAYOUT') {
            //  console.log(' .... no layout: %s', ln);
            var layout = false;
        } else {
            //    console.log('input layout name: %s', ln);
            var layout = rs.framework.get_resource('layout', ln);
        }

        var js = input.javascript ? input.javascript : [];

        if (layout && layout.config.javascript) {
            js = js.concat(layout.config.javascript);
        }
        js = _parse_js(rs.action.get_config('javascript', js, true));

        if (_DEBUG) console.log('javascript retrieved: %s', util.inspect(js));

        input.javascript = js;

        var js_head = input.javascript_head ? input.javascript_head : [];

        if (layout && layout.config.javascript_head) {
            js_head = js_head.concat(layout.config.javascript_head);
        }

        js_head = _parse_js(rs.action.get_config('javascript_head', js_head, true));

        if (_DEBUG) console.log('javascript head retrieved: %s', util.inspect(js_head));

        input.javascript_head = js_head;
        cb(null, this.name);
    }

});

module.exports = function () {
    return _js_view;
}

function _parse_js(js) {
    var out = [];
    js.forEach(function (item) {
        if (_.isObject(item)) {
            out = out.concat(_parse_js_objs(item));
        } else {
            out.push(item);
        }
    })

    return _.uniq(out);
}

function _parse_js_objs(item) {
    var out = [];

    _.each(item, function (suffixes, prefix) {
        prefix = proper_path(prefix, /^http/.test(prefix));
        out = out.concat(_.map(suffixes, function (suffix) {
            return prefix + proper_path(suffix);
        }));
    })

    return out;
}
var NE = require('nuby-express');
var _ = require('underscore');
var util = require('util');
var proper_path = require('support/proper_path');


var _js_view = new NE.helpers.View( {
    name: 'js_view_helper',

    init: function(rs, input, cb){
        input.javascript = _parse_js(rs.action.get_config('javascript', [], true));
        input.javascript_head = _parse_js(rs.action.get_config('javascript_head', [], true));
        cb(null, this.name);
    }

});

module.exports = function () {
    return _js_view;
}

function _parse_js(js){
    var out = [];
    js.forEach(function(item){
        if (_.isObject(item)){
            out = out.concat(_parse_js_objs(item));
        } else {
            out.push(item);
        }
    })

    return _.uniq(out);
}

function _parse_js_objs(item){
    var out = [];

    _.each(item, function(suffixes, prefix){
        prefix = proper_path(prefix, /^http/.test(prefix));
        out = out.concat(_.map(suffixes, function(suffix){
            return prefix + proper_path(suffix);
        }));
    })

    return out;
}
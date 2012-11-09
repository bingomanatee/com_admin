var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var _DEBUG = true;

/* *************** MODULE ********* */

module.exports = {

    /* ************* GET ************** */


    on_get_validate:function (rs) {
        this.on_get_input(rs);
    },

    on_get_input:function (rs) {
        var self = this;
        self.on_get_process(rs, rs.req_props.name);
    },

    on_get_process:function (rs, name) {
        var self = this;
        var target = this.models.site_options.option_value(name, function(err, value){
            if (err){
                self.emit('process_error', rs, err);
            } else {
                self.on_output(rs, {name: name, value: value});
            }
        })
    },

    /* ************* POST ************** */

    on_post_validate:function (rs) {
        if (rs.has_content('name')){
            this.on_post_input(rs);
        } else {
            this.emit('validate_error', rs, 'no name passed');
        }
    },

    on_post_input:function (rs) {
        this.on_post_process(rs, rs.req_props);
    },

    on_post_process:function (rs, option) {
        var self = this;

        var options = {};
        options[option.name] = option.value;
        this.models.site_options.set_options(options, function(err, saved){
            if (err){
                self.emit('process_error', rs, err);
            } else {
                rs.send({saved: saved, error: false});
            }
        });
    },

    _on_post_error_go:true

}
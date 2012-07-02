var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var path = require('path');
var NE = require('nuby-express');

/* ***************** CLOSURE ************* */

/* ***************** MODULE *********** */

module.exports = {

    model:function () {
        return this.models.config_template;
    },

    /* *************** GET RESPONSE METHODS ************** */

    on_get_validate:function (rs) {
        if (rs.req_props.id) {
            this.on_get_one_input(rs);
        } else {
            this.on_get_input(rs);
        }
    },

    on_get_input:function (rs) {
        var self = this;
        this.model().active(function(err, configs){
            if (err){
                self.on_get_input_error(rs, err);
            } else {
                rs.send(configs);
            }
        });
    },

    on_get_process:function (rs, input) {
        this.on_output(rs, input);
    },

    /* *************** POST RESPONSE METHODS ************** */

    on_post_validate:function (rs) {
        this.on_post_input(rs);
    },

    on_post_input:function (rs) {
        this.on_post_process(rs, rs.req_props);
    },

    on_post_process:function (rs, input) {
        var self = this;
        this.model().put(input, function(err, new_config){
            if (err){
                self.on_post_process_error(rs, err);
            } else {
                rs.send(new_config.toJSON());
            }
        })
    },

    _on_get_error_go: true,

    _on_post_error_go: true

}
var _ = require('underscore');
var util = require('util');
var fs = require('fs');

/* *************** MODULE ********* */

module.exports = {
    
    /* ************* GET ************** */

    on_get_validate:function (rs) {
    },

    on_get_input:function (rs) {
    },

    on_get_processs:function (rs, input) {
        var self = this;

        self.on_get_output(rs, output);
    },
    
    /* ************* PUT ************** */

    on_put_validate:function (rs) {
    },

    on_put_input:function (rs) {
    },

    on_put_processs:function (rs, input) {
        var self = this;

        self.on_put_output(rs, output);
    },
    
    /* ************* POST ************** */

    on_post_validate:function (rs) {
    },

    on_post_input:function (rs) {
    },

    on_post_processs:function (rs, input) {
        var self = this;

        self.on_post_output(rs, output);
    },
    
    /* ************* DELETE ************** */

    on_delete_validate:function (rs) {
    },

    on_delete_input:function (rs) {
    },

    on_delete_processs:function (rs, input) {
        var self = this;

        self.on_delete_output(rs, output);
    }

}
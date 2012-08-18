var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var path = require('path');
var NE = require('nuby-express');
var Gate = NE.deps.support.Gate;
var validate_admin = require('validate_admin');

// @NOTE: since the data is embedded in the action,

/* ***************** CLOSURE ************* */

/* ***************** MODULE *********** */

module.exports = {

    /* *************** GET RESPONSE METHODS ************** */

    on_get_validate:function (rs) {
        if (!validate_admin(rs, 'post', this)) {
            return;
        }

        this.on_get_input(rs);
    },

    on_get_input:function (rs) {
        var self = this;
        var models = this.framework.get_resources('model');
        var model_data = [];

        var gate = new Gate(function () {
            self.on_get_process(rs, {models:model_data});
        }, 'counting models');

        models.forEach(function (model, i) {
            var model_info = {
                index:i + 1,
                model:model
            };

            gate.task_start();

            model.count(function (err, c) {
                model_info.count = c;
                model.count({deleted:{'$ne':true}},
                    function (err, a) {
                        model_info.active = a;
                        model_data.push(model_info);
                        gate.task_done();
                    }
                )
            })
        })


        gate.start();

    },

    on_get_process:function (rs, models) {
        var self = this;
        this.on_output(rs, models);
    },

    // note - there is no "on_get_output()' function because on_output is the normal output for get

    _on_get_error_go:'/',

    /* *************** POST RESPONSE METHODS ************** */

    on_post_validate:function (rs) {
        var self = this;
        this.on_post_input(rs);
    },

    on_post_input:function (rs) {
        var self = this;
        this.on_post_process(rs, rs.req_props);
    },

    on_post_process:function (rs, input) {
        var self = this;
        this.on_post_output(rs, input);
    },

    on_post_output:function (rs, output) {
        this.on_output(rs, output);
    },

    _on_post_error_go:true,


    /* *************** PUT RESPONSE METHODS ************** */

    on_put_validate:function (rs) {
        var self = this;
        this.on_put_input(rs);
    },

    on_put_input:function (rs) {
        var self = this;
        this.on_put_process(rs, rs.req_props);
    },

    on_put_process:function (rs, input) {
        var self = this;
        this.on_put_output(rs, input);
    },

    on_put_output:function (rs, output) {
        this.on_output(rs, output);
    },

    _on_put_error_go:true,


    a:true
}
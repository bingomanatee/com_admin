var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var path = require('path');
var NE = require('nuby-express');

/* ***************** CLOSURE ************* */

/* ***************** MODULE *********** */

module.exports = {

    /* *************** GET RESPONSE METHODS ************** */

    on_get_validate:function (rs) {
        var self = this;
        if (this.can(rs, 'admin')) {
            if (rs.has_content('name')) {
                this.on_get_input(rs);
            } else {
                this.on_get_validate_error(rs, 'no model name passed');
            }
        } else {
            this.on_get_validate_error(rs, 'must be admin');
        }
    },

    on_get_input:function (rs) {
        var self = this;
        var model = this.framework.get_resource('model', rs.req_props.name);
        if (model) {
            this.on_get_process(rs, model);
        } else {
            this.on_get_input_error(rs, 'cannot get model ' + rs.req_props.name);
        }
    },

    on_get_process:function (rs, model) {
        var self = this;
        this.on_output(rs, {model:model});
    },

    // note - there is no "on_get_output()' function because on_output is the normal output for get

    _on_get_error_go:'/admin/comp/list',

    /* *************** POST RESPONSE METHODS ************** */

    on_post_validate:function (rs) {
        console.log('post validation: ', rs.req_props);
        var self = this;
        if (this.can(rs, 'admin')) {
            if (rs.has_content('name', 'task')) {
                this.on_post_input(rs);
            } else {
                this.on_post_validate_error(rs, 'no model name passed');
            }
        } else {
            this.on_post_validate_error(rs, 'must be admin');
        }
    },

    on_post_input:function (rs) {
        var self = this;
        var model = this.models[rs.req_props.name];
        if (model) {
            this.on_post_process(rs, model, rs.req_props.task);
        } else {
            console.log('fail! %s', rs.req_props.name);
            this.on_post_input_error(rs, 'cannot get model ' + rs.req_props.name);
        }
    },

    on_post_process:function (rs, model, task) {
        var self = this;
        switch (task) {
            case 'query':
                console.log('querying ' + rs.req_props.name);
                return this._opp_query(rs, model);
                break;

            default:
                console.log('task fail %s', task);
                this.on_post_process_error(rs, 'cannot perform task ' + task);
        }
    },

    _opp_query:function (rs, model) {
        var self = this;
        var crit = rs.req_props.crit;
        try {
            var jcrit = JSON.parse(crit);
            model.find(jcrit, function(err, out){
                rs.send(out);
            });
        } catch (err){
            this.on_post_process_error(rs, err);
        }
    },

    on_post_output:function (rs, output) {
        this.on_output(rs, output);
    },

    _on_post_error_go:true
}


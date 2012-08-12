var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var path = require('path');
var NE = require('nuby-express');
var Gate = NE.deps.support.Gate;
var proper_path = NE.deps.support.proper_path;

/* ***************** CLOSURE ************* */

/* ***************** MODULE *********** */

module.exports = {

    /* *************** GET RESPONSE METHODS ************** */

    on_validate:function (rs) {
        var self = this;
        if (this.can && _.isFunction(this.can)){
            if (!this.can(rs, 'admin')) {
                return this.on_get_validate_error(rs, 'you are not authorized to administer this site');
            }
        }
        this.on_input(rs);
    },

    on_input:function (rs) {
        var self = this;
        var statics = this.framework.get_resources('static_route');
        this.on_process(rs, statics);
    },

    on_process:function (rs, statics) {
        var self = this;
        var st_data = [];

        var gate = new Gate(function(){
            self.on_output(rs, {statics: st_data});
        }, 'get_paths');

        var root = proper_path(this.framework.path);

        statics.forEach(function(static){
            console.log('static: %s', util.inspect(static));
            gate.task_start();
            var tp = root + proper_path(static.root);
            fs.readdir(tp, function(err, files){
                console.log('tp: %s', tp);
                st_data.push({
                    files: files,
                    prefix: static.prefix,
                    root: static.root
                });

                gate.task_done();
            });

        })

        gate.start();
    },

    // note - there is no "on_get_output()' function because on_output is the normal output for get

    _on_get_error_go: '/',




 

    a: true
}
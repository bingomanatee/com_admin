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

    on_validate:function (rs) {
        if (!validate_admin(rs, 'post', this)) {
            return;
        }

        this.on_input(rs);
    },

    on_input:function (rs) {
        var self = this;
        var models = this.framework.get_resources('model');
        var model_data = [];

        var gate = new Gate(function () {
            self.on_process(rs, {models:model_data, frame_path: self.framework.path, _: _});
        }, 'counting models');

        models.forEach(function (model, i) {
         //   console.log('model: %s', util.inspect(model));
            var model_info = {
                index:i + 1,
                model:model,
                root: model._resource_root
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

    on_process:function (rs, models) {
        var self = this;
        this.on_output(rs, models);
    },

    _on_get_error_go:'/'
}
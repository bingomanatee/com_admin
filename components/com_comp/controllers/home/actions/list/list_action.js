var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var path = require('path');
var NE = require('nuby-express');
var validate_admin = require('validate_admin');

/* ***************** CLOSURE ************* */

/* ***************** MODULE *********** */

module.exports = {

    /* *************** RESPONSE METHODS ************** */

    on_validate:function (rs) {
        if (!validate_admin(rs, 'get', this)) {
            return;
        }
        this.on_input(rs);
    },

    on_input:function (rs) {
        var self = this;
        this.on_process(rs, {components: this.framework.get_components()});
    },

    on_process:function (rs, input) {
        var self = this;
        this.on_output(rs, input);
    },

    _on_error_go: '/'


}
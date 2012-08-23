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

        var self = this;
        if (!validate_admin(rs, '', this)){
            return;
        }

        this.on_input(rs);
    },

    _on_validate_error_go:'/',

    on_input:function (rs) {
        var self = this;
        this.on_process(rs, rs.req_props);
        rs.flash('info', 'please complete the <a href="/admin/member/init_wizard">Members Wizard</a>.');
    },

    on_process:function (rs, input) {
        var self = this;
        this.on_output(rs, input);
    }

}
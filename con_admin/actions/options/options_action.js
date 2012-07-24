var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var path = require('path');
var NE = require('nuby-express');

/* ***************** CLOSURE ************* */

/* ***************** MODULE *********** */

module.exports = {

    /* *************** RESPONSE METHODS ************** */

    validate:function (rs) {

        // note - "can" is a feature of the member module.
        // While the member module is not attached to the admin module
        // it is fairly safe to assume you won't be using the admin module without ACL and membership.
        if (this.can && _.isFunction(this.can)){
            if (!this.can(rs, [ 'admin'])) {
               return this.on_validate_error(rs, 'you are not authorized to administer this site');
            }
        }
        this.on_input(rs);
    },

    on_input:function (rs) {
        this.on_process(rs, rs.req_props);
    },

    on_process:function (rs, input) {
        this.on_output(rs, input);
    }

}
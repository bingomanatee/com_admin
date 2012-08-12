var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var path = require('path');
var NE = require('nuby-express');

/* ***************** CLOSURE ************* */

/* ***************** MODULE *********** */

module.exports = {

    /* *************** RESPONSE METHODS ************** */

    on_validate:function (rs) {
        var self = this;

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
        var self = this;
        this.on_process(rs, {components: this.framework.get_components()});
    },

    on_process:function (rs, input) {
        var self = this;
        this.on_output(rs, input);
    }

}
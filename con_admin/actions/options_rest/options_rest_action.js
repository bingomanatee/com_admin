var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var path = require('path');
var NE = require('nuby-express');
var validate_admin = require('validate_admin');

/* ***************** CLOSURE ************* */

/* ***************** MODULE *********** */

module.exports = {

    model:function () {
        return this.models.cc_options;
    },

    /* *************** DELETE RESPONSE METHODS ************** */

    on_delete_validate:function (rs) {

        if (!validate_admin(rs, 'delete', this)) {
            return;
        }

        if (rs.has_content('id')) {
            this.on_delete_input(rs);
        } else {
            this.on_delete_validate_error(rs, 'cannot get id');
        }

    },

    on_delete_input:function (rs) {
        var self = this;

        this.model().get(rs.req_props.id, function (err, menu) {
            if (err) {
                self.on_delete_input_error(rs, err);
            } else if (menu) {
                self.on_delete_process(rs, menu);
            } else {
                self.on_delete_input_error(rs, 'cannot get menu for id ' + rs.req_props.id);
            }
        })
    },

    on_delete_process:function (rs, menu) {
        var self = this;
        this.model().delete(menu, function (err, del_menu) {
            if (err) {
                self.on_delete_process_error(rs, err);
            } else {
                rs.send(del_menu);
            }
        });
    },

    /* *************** GET RESPONSE METHODS ************** */

    on_get_validate:function (rs) {

        if (!validate_admin(rs, 'get', this)) {
            return;
        }

        if (rs.has_content('id')) {
            this.on_get_one_input(rs);
        } else {
            this.on_get_input(rs);
        }

    },

    on_get_input:function (rs) {
        var self = this;
        this.model().active(function (err, configs) {
            if (err) {
                self.on_get_input_error(rs, err);
            } else {
                rs.send(configs);
            }
        });
    },

    on_get_process:function (rs, input) {
        this.on_output(rs, input);
    },

    /* *************** PUT RESPONSE METHODS ************** */

    on_put_validate:function (rs) {

        if (!validate_admin(rs, 'put', this)) {
            return;
        }

        if (!rs.req_props.id) {
            this.on_put_validation_error(rs, 'no ID');
        } else {
            this.on_put_input(rs);
        }
    },

    on_put_input:function (rs) {
        var self = this;

        this.model().get(rs.req_props.id, function (err, menu) {
            if (err) {
                self.on_put_input_error(rs, err);
            } else if (!menu) {
                self.on_put_input_error(rs, 'No Menu');
            } else {
                self.on_put_process(rs, menu);
            }
        })
    },

    on_put_process:function (rs, menu) {
        var self = this;
        ['component', 'name', 'data_type', 'value', 'default'].forEach(function (field) {
            if (rs.req_props.hasOwnProperty(field)) {
                menu[field] = rs.req_props[field];
            }
        });

        if (!menu.parent) {
            menu.parent = null;
        }

        menu.save(function (err, new_menu) {
            if (err) {
                self.on_put_process_error(rs, err);
            } else {
                rs.send(new_menu.toJSON());
            }
        })
    },

    /* *************** POST RESPONSE METHODS ************** */

    on_post_validate:function (rs) {
        if (!validate_admin(rs, 'post', this)) {
            return;
        }

        if (!rs.has_content('id')) {
            this.on_put_validation_error(rs, 'no ID');
        } else {
            this.on_put_input(rs);
        }
    },

    on_post_input:function (rs) {
        this.on_post_process(rs, rs.req_props);
    },

    on_post_process:function (rs, input) {
        var self = this;
        this.model().put(input, function (err, new_config) {
            if (err) {
                self.on_post_process_error(rs, err);
            } else {
                rs.send(new_config.toJSON());
            }
        })
    },

    _on_get_error_go:true,
    _on_delete_error_go:true,
    _on_put_error_go:true,
    _on_post_error_go:true

}
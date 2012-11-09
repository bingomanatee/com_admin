var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var ejs = require('ejs');

_edit_button = ejs.compile('<a href="#edit_option_modal"  ' +
    'class="btn" role="btn" data-toggle="modal" ' +
    'onClick="edit_name(\'<%- name %>\')" ' +
    '><i class="icon-edit"></i> Edit Option</a>');

/* *************** MODULE ********* */

module.exports = {

    on_validate:function (rs) {
        this.on_input(rs);
    },

    on_input:function (rs) {
        var self = this;
        this.models.site_options.all(function (err, options) {
            if (err) {
                self.emit('validate_error', rs, err);
            } else {
                self.on_process(rs, {site_options:options})
            }
        })
    },

    on_process:function (rs, input) {
        var self = this;
        input.data_table_config = {
            title:'Site Options',
            data:input.site_options,
            columns:[
                {label:'Name', field:'name', width:'12em'},
                {label:'Value', field:'value'},
                {label:'&nbsp;', template:_edit_button}
            ]}

        self.on_output(rs, input);
    }

}
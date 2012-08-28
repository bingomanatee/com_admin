var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var path = require('path');
var NE = require('nuby-express');
var proper_path = NE.deps.support.proper_path;
var ejs = require('ejs');
var validate_admin = require('validate_admin');

/* ***************** CLOSURE ************* */

module.exports = {};

/* ***************** MODULE *********** */

module.exports = {

    _on_get_error_go:true,
    _on_post_error_go:true,

    /* *************** GET RESPONSE METHODS ************** */

    on_get_validate:function (rs) {
        var self = this;

        if (!validate_admin(rs, 'post', this)) {
            return;
        }

        if ((!rs.req_props.controller) || (/\.\./.test(rs.req_props.controller))) {
            return  this.emit('validate_error',rs, 'no/bad controller path ')
        }
        this.on_get_input(rs);
    },

    on_get_input:function (rs) {
        var self = this;
        var controllers = this.framework.frame_controllers();
        var cpath = rs.req_props.controller;
        var cpath2 = this.framework.path + cpath;
        var matches = _.filter(controllers, function (c) {
            //  console.log('checking controller %s', c.path);
            if (c.path == cpath) {
                return true;
            } else if (c.path == cpath2) {
                return true;
            }
            return false;
        });

        switch (matches.length) {
            case 0:
                this.emit('input_error',rs, 'cannot find controller ' + cpath + ' or ' + cpath2);
                break;

            case 1:

                rs.req_props.controller = matches[0];
                this.on_get_process(rs, rs.req_props);
                break;

            default:
                this.emit('input_error',rs, 'more than one match for controller ' + cpath + ' or ' + cpath2);
        }

    },

    on_get_process:function (rs, input) {
        var self = this;
        this.on_output(rs, input);
    },

    /* *************** POST RESPONSE METHODS ************** */

    on_post_validate:function (rs) {
        var self = this;
        if (!rs.req_props.new_action) {
            this.emit('validate_error',rs, 'no new_action')
        } else if (!rs.req_props.new_action.name) {
            this.emit('validate_error',rs, 'no name in ' + JSON.stringify(rs.req_props.new_action));
            //@TODO: check name is leagal for dir.
        } else {
            this.on_post_input(rs);
        }
    },

    on_post_input:function (rs) {
        var self = this;

        var controllers = this.framework.frame_controllers();
        var cpath = rs.req_props.new_action.controller;
        var cpath2 = this.framework.path + cpath;
        var matches = _.filter(controllers, function (c) {
            //  console.log('checking controller %s', c.path);
            if (c.path == cpath) {
                return true;
            } else if (c.path == cpath2) {
                return true;
            }
            return false;
        });


        switch (matches.length) {
            case 0:
                this.emit('input_error',rs, 'cannot find controller ' + cpath + ' or ' + cpath2);
                break;

            case 1:
                this.on_post_process(rs, rs.req_props.new_action, matches[0]);
                break;

            default:
                this.emit('input_error',rs, 'more than one match for controller ' + cpath + ' or ' + cpath2);
        }
    },

    on_post_process:function (rs, new_action, controller) {
        var self = this;

        var actions_dir = proper_path(controller.path) + proper_path('actions');

        function _make_action() {

            var action_dir = actions_dir + proper_path(new_action.name.toLowerCase().replace(/[\W]+/g, '_'));
            path.exists(action_dir, function (ex) {
                if (ex) {
                    //@todo: reinsert 4 prod
                    self.emit('process_error',rs, 'already have an action ' + action_dir);
                } //else {
                fs.mkdir(action_dir, function (err) {
                    if (err) {
                          self.emit('process_error',rs, err);
                    }// else {
                    _add_action_file(action_dir);
                    //  }
                })
                //   }
            });

        }

        function _add_action_file(action_dir) {
            if (new_action.REST) {
                var template = '/tmpl/REST_template.js';
            } else {
                var template = '/tmpl/action_template.js';
            }

            fs.readFile(__dirname + template, 'utf8', function (err, txt) {

                var request = {};

                new_action.routes.forEach(function (route) {
                    request[route] = true;
                })

                new_action.routes = request;

                var action = ejs.render(txt, new_action);

                fs.writeFile(proper_path(action_dir) + proper_path(new_action.name + '_view.html'), '', 'utf8', function (err) {
                }); // note - becuase new action creation is done between restarts we are not waiting for the response here. .

                fs.writeFile(proper_path(action_dir) + proper_path(new_action.name + '_action.js'), action, 'utf8', function (err) {
                    if (err) {
                        self.emit('process_error',rs, err);
                    } else {
                        _add_config_file(action_dir);
                    }
                });
            })
        }

        function _add_config_file(action_dir) {
            fs.readFile(__dirname + '/tmpl/config_template.json', 'utf8', function (err, txt) {

                var config = ejs.render(txt, new_action);
                var file = proper_path(action_dir) + proper_path(new_action.name + '_config.json');

                fs.writeFile(file, config, 'utf8', function (err) {
                    if (err) {
                        self.emit('process_error',rs, err);
                    } else {
                        //   rs.send({msg:'action_created', data:new_action})
                        rs.flash('info', 'Your new action has been written. Note you may have to change ownership or read/write flacs on it. Restart your site to use new action');
                        rs.go('/admin/comps');

                        setTimeout(function () {
                            self.models.cc_options.option_value('unix_user_name', function(err, root_user){
                                if (!root_user) return;
                                var spawn = require('child_process').spawn;

                                var ls = spawn('chown', ['-R', root_user, action_dir]);

                                ls.stdout.on('data', function (data) {
                                    //      console.log('stdout: ' + data);
                                });

                                ls.stderr.on('data', function (data) {
                                    //    console.log('stderr: ' + data);
                                });

                                ls.on('exit', function (code) {
                                    //     console.log('child process exited with code ' + code);
                                });
                            })
                        }, 3000); // plenty of time for writes to finish
                    }
                });
            })
        }

        path.exists(actions_dir, function (ex) {
            if (ex) {
                _make_action();
            } else {
                fs.mkdir(actions_dir, function (err) {
                    if (err) {
                        //   self.emit('process_error',rs, err);
                    } //else {
                    _make_action();
                    //  }
                })
            }
        })

    },

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
        this.on_output(rs, input);
    },

    /* *************** DELETE RESPONSE METHODS ************** */

    on_delete_validate:function (rs) {
        var self = this;
        this.on_delete_input(rs);
    },

    on_ut_input:function (rs) {
        var self = this;
        this.on_delete_process(rs, rs.req_props);
    },

    on_delete_process:function (rs, input) {
        var self = this;
        this.on_output(rs, input);
    }

}
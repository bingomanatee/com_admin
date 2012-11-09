var _DEBUG = false;
var util = require('util');
var _ = require('underscore');

module.exports = {
    weight:100,
    init:function (rs, input, cb) {

        var ln = false;
        if (input.hasOwnProperty('layout_name') && input.layout_name) {
            ln = input.layout_name
        } else {
            ln = rs.action.get_config('layout_name', false);
        }

        if (!(ln == 'ne_bs_admin')) {
            return cb();
        }

        ['nav', 'sidebar', 'hero'].forEach(function (t) {

            if (!input.hasOwnProperty(t)) {
                input[t] = false;
            }

        })


        var member = rs.session('member');
        if (member) {
            var member_menu = {
                title:'Membership',
                links:[
                    {
                        title:'viewing as <br />' + member.member_name
                    },
                    {
                        link:'/sign_out',
                        title:'Sign Out'
                    }
                ]
            }

        } else {
            var member_menu = {
                title:'Membership',
                links:[
                    {
                        modal:'/sign_in',
                        title:'Sign in'
                    },
                    {
                        link:'/join_us',
                        title:'Join Us'
                    }
                ]
            }
        }

        input.sidebar = [

            member_menu,

            {  title:'Administration',
                links:[
                    {link: '/', title: 'Site Home'},
                    {link:'/admin/home', title:'Admin home'},
                    {link:'/admin/options', title:'Options'}
                ]},
            {
                title: 'Membership',
                links: [
                    {
                      link: '/admin/members',
                        title: 'Members'
                    },
                    {
                      link: '/admin/member_roles',
                        title: 'Roles'
                    },
                    {
                        link: '/admin/member_tasks',
                        title: 'Tasks'
                    }
                ]
            },
            {
                title: 'Wiki',
                links: [
                    {
                        link: '/admin/wiki/scopes',
                        title: 'Scopes'
                    }
                ]
            },
            {
                title: 'Factory',
                links: [
                    {
                        link: '/admin/factory/make',
                        title: 'Site Structure'
                    }
                ]
            }
        ];
        cb();
    }
}
var util = require('util');
var path = require('path');
var _ = require('underscore');

var NE = require('nuby-express');

module.exports = {
    name:'admin_menu',
    exec:function (rs, menus, cb) {

        var self = this;

        this.add_menu_items(menus, 'admin', {
           weight: 0,
            links: [
                {
                    label: 'Site Home',
                    type: 'link',
                    link: '/'
                },
                {
                    label: 'Admin Home',
                    type: 'link',
                    link: '/admin/home'
                },
                {
                    label: 'Options',
                    type: 'link',
                    link: '/admin/options'
                }

            ]
        })

        rs.action.models.member.can(rs, ['admin site'], function (err, can) {
            if (can) {
                if (!menus['admin']){
                    self.add_menu_items(menus, 'nav', {
                        weight:-10,
                        links:[
                            {
                                label:'Administer Site',
                                type:'link',
                                link:'/admin/home'
                            }
                        ]
                    }, false);


                }


            }
            cb();
        });

    }



}
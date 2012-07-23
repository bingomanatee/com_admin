var NE = require('nuby-express');
var _ = require('underscore');
var util = require('util');

module.exports = {
    name: 'css',

    init: function(rs, input, cb){


        var  ln = rs.action.get_config('layout_name', 'NO LAYOUT')

        if (ln == 'NO LAYOUT' ){
            //console.log(' .... no layout for css: %s', ln);
            var layout = false;
        } else {
           // console.log('input layout name:  css %s', ln);
            var layout = rs.framework.get_resource('layout', ln);
        }

        var css = rs.action.get_config('css', input.css ? input.css : [], true);

        if (layout && layout.config.css){
            css = css.concat(layout.config.css);
        } else if (layout){
          //  console.log('no css in layout: %s', util.inspect(layout.config));
        }

        input.css = _.uniq(css);
        cb(null, this.name);
    }

};
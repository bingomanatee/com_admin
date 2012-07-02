var NE_ADMIN = {

    panel:function (name, selector) {
        if (!this._panel_render) {
            Handlebars.registerHelper("loop", function (array, fn) {
                var buffer = "";
                for (var i = 0, j = array.length; i < j; i++) {
                    var item = array[i];

                    // stick an index property onto the item, starting with 1, may make configurable later
                    item._each_index = i;
                    item._each_first = (i == 0);
                    item._each_last = (i == j - 1);
                    item._each_item = item;

                    // show the inside of the block
                    buffer += fn(item);
                }

                // return the finished buffer
                return buffer;

            });

            var link_template = ['<a href="{{ link }}">{{ label }}</a>',
                '{{#loop children }}' ,
                '{{#if _each_first }}' ,
                '<ul>' ,
                '{{/if }}' +
                    '<li>{{panel_menus _each_item }}</li>' ,
                '{{#if _each_last }}' ,
                '</ul>' ,
                '{{/if }}' ,
                '{{/loop}}'].join("\n")

            var link_render = Handlebars.compile(link_template);

            Handlebars.registerHelper('panel_menus', function (menus) {
                return new Handlebars.SafeString(link_render(menus));
            });

            var panel_template = '<div class="panel" id="panel_{{ panel }}">' +
                '{{#loop menus }}' +
                '{{panel_menus _each_item }}' +
                '{{/loop }}' +
                '</div>';
            this._panel_render = Handlebars.compile(panel_template);
            var self = this;

            $.getJSON('/menu_panel/' + name).success(function (data) {
                $(selector).html(self._panel_render({panel: name, menus: data}));
            });
        }

    }

}
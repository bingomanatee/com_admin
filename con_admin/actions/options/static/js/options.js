$(function () {

    var REST_ROOT = '/admin/comp/option';

    /* ***************** HELPERS ******************** */

    function _deserialize(fd) {
        var out = {};

        _.each(fd, function (field) {
            if (out[field.name]) {
                if (!_.isArray(out[field.name])) {
                    out[field.name] = [out[field.name]];
                }
                out[field.name].push(field.value);
            } else {
                out[field.name] = field.value;
            }

        });

        return out;
    }

    Handlebars.registerHelper('id_short', function (id) {
        return id.slice(0, 8) + '...'
    });

    var text_input = Handlebars.compile('<input type="text" name="{{ name }}" value="{{ value }}" class="input_mono wide" />');
    var textarea_input = Handlebars.compile('<textarea name="{{name }}" class="input_mono wide">{{ value }}</textarea>');
    Handlebars.registerHelper('input', function (type, name, value) {

        switch (type) {
            case 'string':
                return new Handlebars.SafeString(text_input({name:name, value:value}));
                break;

            case 'text':
                return new Handlebars.SafeString(textarea_input({name:name, value:value}));
                break;

        }
        return new Handlebars.SafeString(text_input({name:name, value:value}));
    })

    Handlebars.registerHelper('sq', function (t) {
        return t.replace(/'/g, '\\\'');
    });

    Handlebars.registerHelper('id_display', function (id) {
        var ida = [
            id.slice(0, 4),
            id.slice(4, 8),
            id.slice(8, 12),
            id.slice(12, 16),
            id.slice(16, 20),
            id.slice(20)
        ]
        return  ida.join('-');
    });

    var data_type_options =
        [
            {value:'string', label:'String'},
            {value:'number', label:'Number'},
            {value:'date', label:'Date'}

        ];

    var options_render = Handlebars.compile('{{#each options }}' +
        '<option value="{{ value }}" ' +
        '{{#if selected }} ' +
        ' selected="selected" ' +
        '{{/if }} >' +
        '{{label }}' +
        '</option>{{/each }}');
    Handlebars.registerHelper('data_type_options', function (option) {
        var sdo = _.map(data_type_options, function (o) {
            var out = {selected:o.value == option};
            _.extend(out, o);
            return out;
        })
        return new Handlebars.SafeString(options_render({options:sdo}));
    })

    /* ****************** MODEL ********************** */

    var Config_Template_Model = Backbone.Model.extend({
        defaults:{
            name:'',
            component:'',
            data_type:'string',
            default:''
        },
        urlRoot:REST_ROOT,
        idAttribute:'_id'
    })

    var Config_Template_Coll = Backbone.Collection.extend({
        model:Config_Template_Model
    })

    /* ****************** MAIN VIEW **************** */

    function _comp(c1, c2) {
        if (c1 > c2) {
            return 1;
        } else if (c1 < c2) {
            return -1;
        } else {
            return 0;
        }
    }

    var Configs_View = Backbone.View.extend({

        collection:new Config_Template_Coll(),

        el:$("#config_template_list"),

        initialize:function () {
            var self = this;
            this.comp_value = 'name';
            this.collection.url = REST_ROOT;
            this.collection.comparator = function (opt) {
                return opt.get(self.comp_value);
            };
            this.update_coll(false);
        },

        _form_cordian:null,

        render:function () {

            var self = this;
            $('tbody', this.$el).empty();
            //    this.$el.removeClass();
            //  this.$el.addClass('comp_' + this.comp_field);
            /*  var filtered_models = _.filter(
             this.collection.models,
             function (m) {
             return self._filter_model(m);
             }
             ) */
            this.collection.each(function (m) {
                self.render_config(m);
            }, this);

            if (!this._form_cordian) {
                this._form_cordian = new Forms_View({model:this.collection});
            }

            this._form_cordian.render();

        },

        render_config:function (config) {
            var v = new RowView({
                model:config
            });
            $('tbody.insert', this.$el).before(v.render().el);
        },

        events:{
            'click button.add':'add_config',
            'click td.id_sort':'sort_by_id',
            'click td.name_sort':'sort_by_name',
            'click td.type_sort':'sort_by_type',
            'click td.src_sort':'sort_by_src',
            'click td.default_sort':'sort_by_default',
            'click td.value_sort':'sort_by_value'
        },

        sort_by_id:function () {
            this.comp_value = 'id';
            var self = this;
            this.update_coll(false)
        },


        sort_by_type:function () {
            this.comp_value = 'type';
            var self = this;
            this.update_coll(false)
        },


        sort_by_value:function () {
            this.comp_value = 'value';
            var self = this;
            this.update_coll(false)
        },


        sort_by_src:function () {
            this.comp_value = 'src';
            var self = this;
            this.update_coll(false)
        },


        sort_by_name:function () {
            this.comp_value = 'name';
            var self = this;
            this.update_coll(false)
        },


        sort_by_default:function () {
            this.comp_value = 'default';
            var self = this;
            this.update_coll(false)
        },

        _ct_form:false,

        add_config:function () {
            //   console.log('add config');
            if (!this._new_ct_form) {
                this._new_ct_form = new AddConfigView({configs_view:this}).render();
            }
            this._new_ct_form.show_dialog(true);
        },

        update_coll:function (no_fetch, callback) {
            var self = this;

            function _update() {
                self.collection.sort();
                if (callback) {
                    callback();
                } else {
                    self.render();
                }
            }

            if (no_fetch) {
                _update();
            } else {
                this.collection.fetch({success:_update});
            }
        }


    })

    /* ******************* ROW VIEW *************** */

    var tmpl = $("#config_list_template").html();
    var row_tmpl = Handlebars.compile(tmpl);

    var RowView = Backbone.View.extend({
        template:row_tmpl,
        tagName:'tbody',
        render:function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        events:{
            'click button.edit':'edit_config',
            'mouseover td.id_value':'show_id',
            'mouseout td.id_value':'hide_id'
        },

        hide_id:function () {
            $('.full_id', this.$el).hide();
        },

        show_id:function () {
            $('.full_id', this.$el).show();
        },

        edit_config:function (n) {
          //  console.log('edit menu: ', n, this, this.model);
            var mfv = new EditConfigView({model:this.model});
            mfv.render();
        }

    })

    /* -------------- FORMS VIEW ------------- */

    var ftmpl = $('#config_form_template').html();

    var Forms_View = Backbone.View.extend({

        tagName:'div',

        el:$("#config_forms"),

        template:Handlebars.compile(ftmpl),

        render:function () {
            var self = this;
            var params = {forms:[]};

            this.model.forEach(function (config) {
                var form = _.find(params.forms, function (form) {
                    return (form.src == config.get('src')) && (form.class == config.get('class'));
                });

                var field = config.toJSON();

                if (form) {
                    form.fields.push(field);
                } else {
                    params.forms.push({src:config.get('src'), class:config.get('class'), fields:[field]});
                }
            });

            this.$el.html(this.template(params));

            $('form', this.$el).each(function (i, f) {
                $(f).submit(function (d) {
                 //   console.log('submitting form ', d);
                    var data = _deserialize($(f).serializeArray());
                  //  console.log('data: ', data);
                    var context = {src:data.src, class:data.class};
                    delete data.src;
                    delete data.class;
                    _.each(data, function (value, key) {
                        var matches = configs_view.collection.where({
                            src:context.src,
                            class:context.class,
                            name:key
                        });
                        if (matches.length > 0) {
                            matches[0].set('value', value);
                            matches[0].save();
                        }
                    });

                    configs_view.update_coll();
                    return false;
                });
            });

            $('.accordion', this.$el).accordion();
        }

    })


    /* -------------- EDIT VIEW ------------- */
    /*
     RADICALLY OBSOLETE
     */

    var EditConfigView = Backbone.View.extend({
        el:$('#edit_config'),


        events:{
            //   'click button.delete':'delete_config',
            'click button.update':'update_config'
        },

        /*  delete_config:function (e) {
         var self = this;
         this.model.destroy({
         success:function () {
         configs_view.update_coll(false, function () {
         $(self.$el).dialog('close');
         configs_view.render();
         });
         }
         });
         this.show_dialog(false);
         return false;
         }, */

        update_config:function (e) {
            var fd = $('form', this.$el).serializeArray();
            var self = this;
            _fd_to_model(fd, this.model);

            this.model.save({}, {
                success:function () {
                    configs_view.update_coll(true, function () {
                        self.show_dialog(false);
                        configs_view.render();
                    });
                }
            });
            return false;
        },

        template:Handlebars.compile(
            $("#edit_config_form").html()),

        render:function () {
            var data = this.model.toJSON();
            this.$el.html(this.template(data));
            this.show_dialog(true);
            return this;
        },

        show_dialog:function (s) {
            if (s) {
                $(this.$el).dialog({title:"Add Configuration", width:"40em"});
            } else {
                $(this.$el).dialog('close');
            }

        }

    })


    var configs_view = new Configs_View();
    configs_view.render();

})

function reset_form_value(b, name, val) {
   // console.log('rfv:', b, name, val);

    var f = b.form;

    $('input[name="' + name + '"]', f).val(val);
    $('textarea[name="' + name + '"]', f).val(val);
    return false;
}